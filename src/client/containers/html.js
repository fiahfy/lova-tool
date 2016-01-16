import React, {Component, PropTypes} from 'react'
import Helmet from 'react-helmet'
import css1 from 'bootstrap/dist/css/bootstrap.css'
import css2 from 'flat-ui/dist/css/flat-ui.css'
import css3 from 'nvd3/build/nv.d3.css'
import appCss from '../../../public/assets/css/app.scss'
import tableSorterCss from '../../../public/assets/css/tablesorter.scss'

export default class Html extends Component {
  static propTypes = {
    markup:       PropTypes.string,
    initialState: PropTypes.string
  };
  render() {
    const {markup, initialState} = this.props

    const head = Helmet.rewind()

    const cssString
      = css1.toString()
      + css2.toString()
      + css3.toString()
      + appCss.toString()
      + tableSorterCss.toString()

    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          {head.title.toComponent()}
          <meta name="viewport" content="width=device-width,user-scalable=0,initial-scale=1" />
          <base href="/" />
          <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
          <style dangerouslySetInnerHTML={{__html: cssString}} />
          <script src="/assets/js/bundle.js" defer></script>
        </head>
        <body>
          <div id="app" dangerouslySetInnerHTML={{__html: markup}} />
          <script dangerouslySetInnerHTML={{__html: `window.__initialState=${initialState}`}} />
        </body>
      </html>
    )
  }
}
