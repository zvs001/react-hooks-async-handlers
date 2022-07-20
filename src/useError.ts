import { useState } from 'react'

let processErrorGlobal = function errorProcessor(error: Error): string {
  return error?.message || ''
}
function setErrorProcessor(fn: (error: unknown) => string) {
  processErrorGlobal = fn
}

export interface UseErrorOptions {
  processError?<Err extends Error>(error: Err): string
}

function useError(options?: UseErrorOptions) {
  const { processError = processErrorGlobal } = options || {}
  const [errorMessage, setErrorMessage] = useState('')
  const [isErrored, setIsErrored] = useState(false)

  function resetError() {
    setErrorMessage('')
    setIsErrored(false)
  }

  function setError(error: Error | null | string | unknown) {
    if (!error) return resetError()
    if (typeof error === 'string') error = new Error(error)
    const apiError = processError(error as Error)
    setErrorMessage(apiError)
    setIsErrored(true)
  }

  return { error: errorMessage, isErrored, setError, resetError }
}

export { setErrorProcessor }
export default useError
