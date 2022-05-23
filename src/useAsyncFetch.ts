import { useEffect, useState } from 'react'
import { useTimeout } from 'usehooks-ts'
import useAsyncHandler, { UseActionHandlerHookData } from './useAsyncHandler'

export type FetchAction<DataResult> = Omit<UseActionHandlerHookData<DataResult>, 'onAction'> & { tries: number }

function useAsyncFetch<DataResult>(
  onActionFn: () => Promise<DataResult>,
  options?: { maxTries?: number; timeoutBeforeRetry?: number },
): FetchAction<DataResult> {
  const { maxTries = 1, timeoutBeforeRetry = 1000 } = options || {}
  const [tries, setTries] = useState(0)
  const action = useAsyncHandler(onActionFn, { strict: true })
  const { isLoading, isDone, error, data, reset } = action

  function handleTry() {
    if (isDone || isLoading) return
    if (tries >= maxTries) return
    setTries(tries + 1)
    action.execute()
  }

  useEffect(() => {
    handleTry()
  }, [])

  const isTimeoutEnabled = tries && tries < maxTries && !isLoading && !isDone

  useTimeout(handleTry, isTimeoutEnabled ? timeoutBeforeRetry : null)

  return { isLoading, isDone, error, data, reset, tries }
}

export default useAsyncFetch
