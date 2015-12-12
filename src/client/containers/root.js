import React, {Component, PropTypes} from 'react'
import {Provider} from 'react-redux'
import {RoutingContext} from 'react-router'
import {ReduxRouter} from 'redux-router'
import DevTools from './dev-tools'

export default class Root extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired
  }
  render() {
    const {store} = this.props
    return (
      <Provider store={store}>
        <div>
          <ReduxRouter />
          {/*<DevTools />*/}
        </div>
      </Provider>
    )
  }
}