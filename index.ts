import useAsyncFetch from './src/useAsyncFetch'
import useAsyncHandler from './src/useAsyncHandler'
import useError, { setErrorProcessor } from './src/useError'

export { useError, useAsyncFetch, useAsyncHandler, setErrorProcessor }

export default {
  useError,
  useAsyncFetch,
  useAsyncHandler,
}
