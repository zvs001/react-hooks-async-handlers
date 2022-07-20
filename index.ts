import useAsyncFetch from './src/useAsyncFetch'
import useAsyncHandler from './src/useAsyncHandler'
import useAsyncIntervalFetch from './src/useAsyncIntervalFetch'
import useError, { setErrorProcessor } from './src/useError'

export * from './src/useAsyncHandler'
export * from './src/useAsyncFetch'
export { useAsyncHandler, useAsyncFetch, useAsyncIntervalFetch, useError, setErrorProcessor }

export default {
  useError,
  useAsyncFetch,
  useAsyncHandler,
  useAsyncIntervalFetch,
}
