import { useCallback, useState } from 'react'
import useError, { UseErrorOptions } from './useError'

export interface UseActionHandlerOptions extends UseErrorOptions {
  isRetryAllowed?: boolean
  strict?: boolean
}

interface UseActionHandlerHookBase {
  reset(): void
  error: string
  isLoading: boolean
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
  const [isLoading, setIsLoading] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [data, setData] = useState<unknown>(null)
  const { error, setError } = useError(options)

  const handleAction = useCallback(
    async (actionParam?: any) => {
      if (isDone && !isRetryAllowed && strict) {
        console.warn('Action is blocked because isDone is true. Async action is ignored. Possible leak detected.')
        return null
      }
      if (isLoading) {
        console.warn('action is loading already. Ignore rerunning actions.')
        return null
      }
      try {
        setIsLoading(true)
        if (error) setError('')

        const result = await onAction(actionParam)
        setData(result)
        setIsDone(true)
        setIsLoading(false)
        return result
      } catch (e) {
        setError(e)
        setIsLoading(false)
      }
    },
    [isDone, error, isLoading, onAction, isRetryAllowed, strict],
  )

  const reset = useCallback(
    function resetFn() {
      if (isLoading) {
        // why it is not firing? Even if loading is true already
        console.warn('You are using .reset() during active action. Some data can be overwritten')
      }
      setIsDone(false)
      setIsLoading(false)
      setError(null)
      setData(null)
    },
    [isLoading],
  )

  return {
    execute: handleAction,
    isLoading,
    isDone,
    error,
    reset,
    data,
  }
}

export default useAsyncHandler
