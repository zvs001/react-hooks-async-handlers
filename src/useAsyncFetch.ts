import { DependencyList, useCallback, useEffect, useRef } from 'react'
import useState from 'react-usestateref'
import { useTimeout } from 'usehooks-ts'
import useAsyncHandler, { UseActionHandlerHookData } from './useAsyncHandler'
import { shallowEqualArrays } from "shallow-equal"

export type FetchAction<DataResult> = Omit<UseActionHandlerHookData<DataResult>, 'onAction'> & {
  tries: number
  isInRetryTimeout: boolean
}
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
  if (!dependencies) dependencies = []

  useEffect(() => {
    if (dependencies)
      dependencies.forEach((dep) => {
        if (dep && typeof dep === 'object') {
          console.warn(
            '[useAsyncFetch]',
            'Try to avoid using objects in dependencies. It might cause recursive runs. Prefer primitive types.',
          )
        }
      })
  }, dependencies)

  const { maxTries = 1, timeoutBeforeRetry = 1000 } = options || {}
  const [tries, setTries, triesRef] = useState(0)
  const [isInRetryTimeout, setRetryTimeoutEnabled] = useState(false)
  const action = useAsyncHandler(onActionFn, { strict: true })
  const { isLoading, isDone, isErrored, error, data, indicators } = action
  const depsPrevRef = useRef<DependencyList>()

  const handleTry = useCallback(
    function handleTryFn() {
      const { isLoading, isDone } = indicators.stateRef.current
      const tries = triesRef.current || 0
      if (isDone || isLoading) return
      depsPrevRef.current = dependencies

      setTries(tries + 1)
      action.execute().catch((e) => {
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
    handleTry()
  }

  useEffect(() => {
    const isEqual = depsPrevRef.current ? shallowEqualArrays(depsPrevRef.current as any, dependencies as any) : false
    if(isLoading || isEqual) {
      return
    }

    reset()
  }, [isLoading, ...dependencies])

  const isFetchNecessary = !isLoading && !isDone
  useEffect(() => {
    if (isInRetryTimeout) return
    if (!isFetchNecessary) return
    if (!tries || tries >= maxTries) return

    setRetryTimeoutEnabled(true)
  }, [isFetchNecessary, tries])

  function handleTimeout() {
    setRetryTimeoutEnabled(false)
    handleTry()
  }

  useTimeout(handleTimeout, isInRetryTimeout ? timeoutBeforeRetry : null)

  return { isLoading, isDone, isErrored, isInRetryTimeout, error, data, reset, tries, indicators }
}

export default useAsyncFetch
