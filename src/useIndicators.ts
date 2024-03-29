import { useMemo } from 'react'
import useState from 'react-usestateref'

interface AsyncHookIndicatorsDefault {
  isLoading: boolean
  isDone: boolean
}

const defaultState: AsyncHookIndicatorsDefault = {
  isDone: false,
  isLoading: false,
}

function useIndicators() {
  const [state, setObject, stateRef] = useState<{
    isLoading: boolean
    isDone: boolean
  }>(defaultState)

  function resetIndicators() {
    setIndicators(defaultState)
  }

  function setIndicators(data: Partial<AsyncHookIndicatorsDefault>) {
    setObject((statePrev) => ({
      ...statePrev,
      ...data,
    }))
  }

  return useMemo(
    () => ({
      state,
      stateRef,
      set: setIndicators,
      reset: resetIndicators,
    }),
    [state],
  )
}

export default useIndicators
