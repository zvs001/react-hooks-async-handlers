import React from 'react'
import { useInterval } from 'usehooks-ts'
import useAsyncFetch, { FetchActionOptions } from './useAsyncFetch'

function useAsyncIntervalFetch(
  fnFetch: () => Promise<any>,
  millis: number | null,
  options?: FetchActionOptions,
  dependencies?: React.DependencyList,
) {
  const fetchAction = useAsyncFetch(fnFetch, options, dependencies)

  const isIntervalEnabled = !fetchAction.isLoading

  useInterval(
    () => {
      fetchAction.reset()
    },
    isIntervalEnabled ? millis : null,
  )

  return fetchAction
}

export default useAsyncIntervalFetch
