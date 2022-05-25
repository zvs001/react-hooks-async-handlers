import { DependencyList, useCallback, useEffect, useState } from 'react'
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
  const [tries, setTries] = useState(0)
  const action = useAsyncHandler(onActionFn, { strict: true })
  const { isLoading, isDone, error, data } = action

  const handleTry = useCallback(
    function handleTryFn() {
      if (isDone || isLoading) return
      if (tries >= maxTries) return
      setTries(tries + 1)
      action.execute()
    },
    [action, tries],
  )

  function reset() {
    action.reset()
    setTries(0)
  }

  useEffect(() => {
    reset()
    handleTry()
  }, dependencies || [])

  const isTimeoutEnabled = tries && tries < maxTries && !isLoading && !isDone

  useTimeout(handleTry, isTimeoutEnabled ? timeoutBeforeRetry : null)

  return { isLoading, isDone, error, data, reset, tries }
}

export default useAsyncFetch
