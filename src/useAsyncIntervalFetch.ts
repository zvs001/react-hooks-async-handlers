import React, { useMemo, useState } from 'react'
import { useInterval } from 'usehooks-ts'
import useAsyncFetch, { FetchActionOptions } from './useAsyncFetch'

function useAsyncIntervalFetch(
  fnFetch: () => Promise<any>,
  millis: number | null,
  options?: FetchActionOptions,
  dependencies?: React.DependencyList,
) {
  const [intervalCount, setIntervalCount] = useState(0)
  const depsList = useMemo(() => {
    let list: React.DependencyList = [intervalCount]
    list = list.concat(dependencies || [])
    return list
  }, [intervalCount, dependencies])
  const fetchAction = useAsyncFetch(fnFetch, options, depsList)

  const isIntervalEnabled = !fetchAction.isLoading

  useInterval(
    () => {
      fetchAction.reset()
      setIntervalCount(intervalCount + 1)
    },
    isIntervalEnabled ? millis : null,
  )

  return fetchAction
}

export default useAsyncIntervalFetch
