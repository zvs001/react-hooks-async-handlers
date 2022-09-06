import useAsyncFetch from './src/useAsyncFetch'
import useAsyncHandler from './src/useAsyncHandler'
import useAsyncIntervalFetch from './src/useAsyncIntervalFetch'
import { useError, ErrorMessageProvider } from 'react-hooks-use-error'

export * from './src/useAsyncHandler'
export * from './src/useAsyncFetch'
export { useAsyncHandler, useAsyncFetch, useAsyncIntervalFetch, useError, ErrorMessageProvider }

export default {
  useAsyncFetch,
  useAsyncHandler,
  useAsyncIntervalFetch,
  useError,
}
