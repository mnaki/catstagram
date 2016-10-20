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
            if (action.isFetching) {
                return state.merge({isFetching: action.isFetching})
            } else {
                return state.merge({
                    isFetching: action.isFetching,
                    gifList: gifListReducer(state.gifList, action),
                    offset: state.offset + 3
                })
            }
        }
        default: {
            return state.set('gifList', gifListReducer(state.gifList, action))
        }
    }
}

let store = redux.createStore(appReducer)

const gifFetch = (params) => {
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
        }, 0)
    })
}

console.log(store.getState())

Spinner = (props) =>
    React.createElement('div', {className: `spinner animated ${props.isLoading ? 'bounceIn' : 'bounceOut'}`},
        React.createElement('div', {className: 'rect1'}),
        React.createElement('div', {className: 'rect2'}),
        React.createElement('div', {className: 'rect3'}),
        React.createElement('div', {className: 'rect4'}),
        React.createElement('div', {className: 'rect5'})
    )

class App extends React.Component {

    fetchGifs() {
        return gifFetch({
            api_key: apiKey,
            limit: 3,
            offset: store.getState().offset,
            q: 'cat lsd'
        })
    }

    componentDidMount() {
        this.fetchGifs()
    }

    handleSubmit() {
        this.fetchGifs()
    }

    handleChange() {
        store.dispatch({
            type: 'RESET_OFFSET'
        })
    }

    render() {
        return React.createElement(
            'div',
            {},
            React.createElement('form', {onChange: () => handleChange(), onSubmit: () => handleSubmit()},
                React.createElement('input', {type: 'text', ref: node => this.input = node}),
                React.createElement('button', {type: 'submit'}, 'Fetch moaar')
            ),
            this.props.store.gifList.length > 0 && React.createElement('div', {className: 'masonry'}, this.props.store.gifList.map((gif, i) =>
                React.createElement('div', {
                    key: gif.id,
                    className: 'item animated flipInY',
                    style: {
                        WebkitAnimationDelay: `${(3+i-this.props.store.offset)/2}s`,
                        WebkitAnimationDuration: '1.0s'
                    }
                }, React.createElement('video', {autoPlay: true, loop: true, height: '200px', src: `https://media.giphy.com/media/${gif.id}/giphy.mp4`}))
            )),
            React.createElement(Spinner, {isLoading: this.props.store.isFetching})
        )
    }

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