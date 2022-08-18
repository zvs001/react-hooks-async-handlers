import { useCallback, useState } from 'react'
import useError, { UseErrorOptions } from './useError'
import useIndicators from './useIndicators'

export interface UseActionHandlerOptions extends UseErrorOptions {
  isRetryAllowed?: boolean
  strict?: boolean
}

interface UseActionHandlerHookBase {
  reset(): void
  error: string
  isLoading: boolean
  isErrored: boolean
  indicators: ReturnType<typeof useIndicators>
}

export type AsyncAction<ActionResult, ActionParams = undefined> = {
  onAction: ActionParams extends undefined
    ? () => Promise<ActionResult>
    : (params: ActionParams) => Promise<ActionResult>
} & UseActionHandlerHookData<ActionResult>

export type UseActionHandlerHookData<DataResult> =
  | ({
      isDone: false
      data: null
    } & UseActionHandlerHookBase)
  | ({
      isDone: true
      data: DataResult
    } & UseActionHandlerHookBase)

function useAsyncHandler<ActionResult>(
  onAction: () => Promise<ActionResult>,
  options?: UseActionHandlerOptions,
): {
  execute: () => Promise<ActionResult>
} & UseActionHandlerHookData<ActionResult>

function useAsyncHandler<ActionResult, Param>(
  onAction: (param: Param) => Promise<ActionResult>,
  options?: UseActionHandlerOptions,
): {
  execute: typeof onAction
} & UseActionHandlerHookData<ActionResult>

// todo test if it make sense to merge useState into one object.
function useAsyncHandler(onAction: any, options?: UseActionHandlerOptions) {
  const { isRetryAllowed, strict } = options || {}
  const indicators = useIndicators()
  const { isLoading, isDone } = indicators.state

  const [data, setData] = useState<unknown>(null)
  const { error, setError, isErrored } = useError(options)

  const handleAction = useCallback(
    async (actionParam?: any) => {
      const { isLoading, isDone } = indicators.stateRef.current

      if (isDone && !isRetryAllowed && strict) {
        console.warn('Action is blocked because isDone is true. Async action is ignored. Possible leak detected.')
        return null
      }
      if (isLoading) {
        console.warn('action is loading already. Ignore rerunning actions.')
        return null
      }
      try {
        indicators.set({
          isLoading: true,
        })
        if (isErrored) setError(null)

        const result = await onAction(actionParam)
        setData(result)
        indicators.set({
          isDone: true,
          isLoading: false,
        })
        return result
      } catch (e) {
        setError(e)
        indicators.set({
          isLoading: false,
        })
        throw e // executor fn should be able to stop function, because of error
      }
    },
    [indicators, isErrored, onAction, isRetryAllowed, strict],
  )

  const reset = useCallback(
    function resetFn() {
      const latestState = indicators.stateRef.current
      if (latestState.isLoading) {
        // why it is not firing? Even if loading is true already
        console.warn('You are using .reset() during active action. Some data can be overwritten')
      }

      indicators.reset()
      setError(null)
      setData(null)
    },
    [indicators],
  )

  return {
    execute: handleAction,
    isLoading,
    isDone,
    isErrored,
    error,
    reset,
    data,
    indicators,
  }
}

export default useAsyncHandler
