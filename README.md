
React Hooks for working with async operations.

[![npm](https://img.shields.io/npm/v/react-hooks-async-handlers)](https://www.npmjs.com/package/react-hooks-async-handlers)

## Install

``yarn add react-hooks-async-handlers``

or 

```npm i -S react-hooks-async-handlers```

## Methods

- [useAsyncHandler](#useasynchandler)
- [useAsyncFetch](#useasyncfetch)
- [useAsyncIntervalFetch](#useasyncintervalfetch)


## Usage

Look example of usage for 2 types of handlers.

```tsx
import { useAsyncHandler, useAsyncFetch } from 'react-hooks-async-handlers'

// automatically executed on mount
const fetchAction = useAsyncFetch(async () => {
  await api.getUser()
})

// manual execute
const deleteAction = useAsyncHandler(async () => {
  await api.deleteUser()
})

return <button onClick={() => deleteAction.execute()}>delete</button>
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

if (isLoading) return 'action in progress'
if (error) return `error happened: ${error}`
if (isDone) return 'action completed successfully'

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

### useAsyncIntervalFetch

Hook is a wrapper for `useAsyncFetch` hook.
This hook runs action automatically, when component mounts and runs it again with specified interval.

Example of use with retry:

```typescript
useAsyncIntervalFetch(
  async () => {
    await api.getPageObject()
  },
  30000
)
```


## Advanced usage 

Composition example using: api, redux, react-renderer-status-split
```tsx
import { RendererStatusSplit } from 'react-renderer-status-split'
import { useAsyncFetch } from 'react-hooks-async-handlers'

function UserComponent({ user_id }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => ({
    user: state.users[user_id],
  }))
  
  const userFetch = useAsyncFetch(
    async () => {
      await dispatch(Dispatcher.getUser(user_id))
    },
    { maxTries: 3 },
    [user_id] // action will run again if user_id will be changed.
  )
    
  return (
    <div>
      <h1>Page Title</h1>
  
      <div className={'content-container'}>
        <RendererStatusSplit
          statuses={userFetch}
          isEmpty={!user}
          renderPreview={() => <div>Loading will start soon</div>}
          renderLoading={() => <div>Component is loading</div>}
          renderError={(error) => <span color={'red'}>{error}</span>}
          renderEmpty={() => <div>Component is not found</div>}
          render={() => <UserInfo user={user} />}
        />
      </div>
    </div>
  ) 
}
```


## See Also

List of libraries that work well with hook:

- [react-renderer-status-split](https://www.npmjs.com/package/react-renderer-status-split)
