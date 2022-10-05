import React, { Component } from 'react';

import TradingView from 'https://s3.tradingview.com/tv.js';
class ChartComp extends Component {
    constructor(props) {
        super(props);
      }
    
      componentDidUpdate(prevProp) {
        if (prevProp.stock != this.props.stock){
          new window.TradingView.widget({
            "width": 100 + '%',
            "height": 100 + '%',
            "symbol": this.props.stock,
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "toolbar_bg": "#f1f3f6",
            "enable_publishing": false,
            "allow_symbol_change": false,
            "container_id": "tradingview_19e2d"
          });
        }
      }
  
  componentDidMount(){
      new window.TradingView.widget({
       "width": 100 + '%',
       "height": 100 + '%',
       "symbol": this.props.stock,
       "interval": "D",
       "timezone": "Etc/UTC",
       "theme": "dark",
       "style": "1",
       "locale": "en",
       "toolbar_bg": "#f1f3f6",
       "enable_publishing": false,
       "allow_symbol_change": false,
       "container_id": "tradingview_19e2d"
     });
  }

  render() {
    return (
    <div style={{height:'100%'}}>
        <div className="tradingview-widget-container" ref={this.myRef}>
            <div id="tradingview_19e2d"></div>
        </div>
    </div>
      );
    }
  }
  
  
  export default ChartComp;