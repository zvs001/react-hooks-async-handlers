import { DependencyList, useCallback, useEffect } from 'react'
import useState from 'react-usestateref'
import { useTimeout } from 'usehooks-ts'
import useAsyncHandler, { UseActionHandlerHookData } from './useAsyncHandler'

export type FetchAction<DataResult> = Omit<UseActionHandlerHookData<DataResult>, 'onAction'> & { tries: number }
export interface FetchActionOptions {
  maxTries?: number
  timeoutBeforeRetry?: number
}

function useAsyncFetch<DataResult>(
  onActionFn: () => Promise<DataResult>,
  options?: FetchActionOptions,
  dependencies?: DependencyList,
): FetchAction<DataResult>

function useAsyncFetch<DataResult>(
  onActionFn: () => Promise<DataResult>,
  options: FetchActionOptions,
): FetchAction<DataResult>

function useAsyncFetch<DataResult>(
  onActionFn: () => Promise<DataResult>,
  dependencies: DependencyList,
): FetchAction<DataResult>

function useAsyncFetch<DataResult>(
  onActionFn: () => Promise<DataResult>,
  options?: FetchActionOptions | DependencyList,
  dependencies?: DependencyList,
): FetchAction<DataResult> {
  if (options instanceof Array) {
    dependencies = options
    options = {}
  }

  const { maxTries = 1, timeoutBeforeRetry = 1000 } = options || {}
  const [tries, setTries, triesRef] = useState(0)
  const [isTimeoutEnabled, setTimeoutEnabled] = useState(false)
  const action = useAsyncHandler(onActionFn, { strict: true })
  const { isLoading, isDone, isErrored, error, data, indicators } = action

  const handleTry = useCallback(
    function handleTryFn() {
      const { isLoading, isDone } = indicators.stateRef.current
      const tries = triesRef.current || 0
      if (isDone || isLoading) return

      setTries(tries + 1)
      action.execute()
        .catch(e => {
          let actionPrefix = onActionFn.name ? `(${onActionFn.name}) ` : ''
          console.error(`${actionPrefix}AsyncFetch action got error:`)
          console.error(e)
        })
    },
    [action],
  )

  function reset() {
    action.reset()
    setTries(0)
  }

  useEffect(() => {
    reset()
    handleTry()
  }, dependencies || [])

  const isFetchNecessary = !isLoading && !isDone
  useEffect(() => {
    if (isTimeoutEnabled) return
    if (!isFetchNecessary) return
    if (!tries || tries >= maxTries) return

    setTimeoutEnabled(true)
  }, [isFetchNecessary, tries])

  function handleTimeout() {
    setTimeoutEnabled(false)
    handleTry()
  }

  useTimeout(handleTimeout, isTimeoutEnabled ? timeoutBeforeRetry : null)

  return { isLoading, isDone, isErrored, error, data, reset, tries, indicators }
}

export default useAsyncFetch
