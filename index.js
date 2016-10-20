let Immutable = seamlessImmutable
let ReactDOM = reactDom
let React = react

////////////////////////////////

const apiKey = 'dc6zaTOxFJmzC'

const gifReducer = (state, action) => {
    switch (action.type) {
        case 'LIKE_GIF': {
            return state.set('likes', state.likes + 1 || 1)
        }
        default: {
            return state
        }
    }
}

const gifListReducer = (state = Immutable.from([]), action) => {
    switch (action.type) {
        case 'FETCH_GIFS': {
            return state.concat(action.data)
        }
        case 'LIKE_GIF': {
            return state.map(s => {
                if (s.id != action.id) {
                    return s
                } else {
                    return gifReducer(s, action)
                }
            })
        }
        default: {
            return state
        }
    }
}

const defaultAppState = Immutable.from({
    isFetching: false,
    offset: 0
})

const appReducer = (state = defaultAppState, action) => {
    switch (action.type) {
        case 'FETCH_GIFS': {
            if (action.isFetching)
                return state.set('isFetching', action.isFetching)
            return (
                state
                .set('isFetching', action.isFetching)
                .set('gifList', gifListReducer(state.gifList, action))
                .set('offset', state.offset + 3)
            )
        }
        default: {
            return state.set('gifList', gifListReducer(state.gifList, action))
        }
    }
}

let store = redux.createStore(appReducer)

const gifFetch = (params) => {
    console.log('params = ' + JSON.stringify(params))
    store.dispatch({
        type: 'FETCH_GIFS',
        isFetching: true,
    })
    axios.get('http://api.giphy.com/v1/gifs/search', {
        params
    }).then(res => {
        setTimeout(() => {
            store.dispatch({
                type: 'FETCH_GIFS',
                isFetching: false,
                data: Immutable.from(res.data.data) 
            })
        }, 500)
    })
}

console.log(store.getState())

const fetch = () =>
    gifFetch({
        api_key: apiKey,
        limit: 3,
        offset: store.getState().offset,
        q: 'lovely cat'
    })

console.log(store.getState())

const App = (props) => {
    return React.createElement(
        'div',
        {},
        React.createElement('button', {onClick: fetch}, 'Fetch moaar'),
        props.store.isFetching ? React.createElement('h2', {}, 'Loading love') : '',
        props.store.gifList.length > 0 ? props.store.gifList.map(gif => React.createElement('iframe', {key: gif.id, src: gif.embed_url})) : ''
        
    )
}

render = () => {
    ReactDOM.render(
        React.createElement(App, {store: store.getState()}),
        document.getElementById('app')
    )
}

render()

store.subscribe(() => {
    console.log(store.getState())
    render()
})