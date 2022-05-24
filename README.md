
React Hooks for working with async operations.

[![npm](https://img.shields.io/npm/v/react-hooks-async-handlers)](https://www.npmjs.com/package/react-hooks-async-handlers)

## Install

``yarn add react-hooks-async-handlers``

or 

```npm i -S react-hooks-async-handlers```

## Methods

- [useAsyncHandler](#useasynchandler)
- [useAsyncFetch](#useasyncfetch)


## Usage

Look example of usage for 2 types of handlers.

```tsx
import { useAsyncHandler, useAsyncFetch } from 'react-hooks-async-handlers'

// auto
const fetchAction = useAsyncFetch(async () => {
    await api.getUser()
})

// manual execute
const deleteAction = useAsyncHandler(async () => {
    await api.deleteUser()
})

const handleClick = () => deleteAction.execute()

return <button onClick={handleDelete}>delete</button>
```


## Docs

### useAsyncHandler

Hook provides ability to run async operation inside our component.

Hook returns: `isLoading`, `isDone`, `error` statuses for async operation.

To start action, you need to manually start running action by calling `action.execute()` function

Example:

```tsx
import { useAsyncHandler } from 'react-hooks-async-handlers'

const createAction = useAsyncHandler(async () => {
   await api.createObject()
})
const { isLoading, isDone, execute, error } = createAction

if(isLoading) return 'action in progress'
if(error) return `error happened: ${error}`
if(isDone) return 'action completed successfully'

return <div onClick={execute}>click</div>
```


### useAsyncFetch

Hook is a wrapper for `useAsyncHandler` hook. 
This hook runs action automatically, when component mounts and allows to retry an action if it fails.

Example of use with retry: 

```typescript
useFetch(async () => {
  await api.getPageObject()
}, { 
  maxTries: 4, timeoutBeforeRetry: 1000 
})
```

## Advanced usage 

Composition example using: api, redux, react-renderer-status-split
```tsx
import { RendererStatusSplit } from 'react-renderer-status-split'
import { useAsyncFetch } from 'react-hooks-async-handlers'

// Component =>>

const { pageObject } = useSelector((state) => ({
  pageObject: state.pageObject,
}))

const dispatch = useDispatch()
const fetchAction = useAsyncFetch(
  async () => {
    await dispatch(Dispatcher.getPageObject())
  },
  { maxTries: 3 },
)
  
return (
  <div>
    <h1>Page Title</h1>

    <div className={'some-container'}>
      <RendererStatusSplit
        statuses={fetchAction}
        isEmpty={_.isEmpty(offices)}
        renderPreview={() => <div>Loading will start soon</div>}
        renderLoading={() => <div>Component is loading</div>}
        renderError={(error) => <span color={'red'}>{error}</span>}
        renderEmpty={() => <div>Component is not found</div>}
        render={() => <ComponentInfo data={pageObject} />}
      />
    </div>
  </div>
)
```


## See Also

List of libraries hook works well with:

- [react-renderer-status-split](https://www.npmjs.com/package/react-renderer-status-split)
