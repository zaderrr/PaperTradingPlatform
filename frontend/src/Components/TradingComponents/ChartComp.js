import React, { Component } from 'react';

//import TradingView from 'https://s3.tradingview.com/tv.js';
class ChartComp extends Component {

      
  render() {
    return (
    <div style={{height:'100%'}}>
        <div className="tradingview-widget-container">
            <div id="tradingview_19e2d"></div>
        </div>
    </div>
      );
    }
  }
  
  
  export default ChartComp;