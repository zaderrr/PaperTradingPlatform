import React, { Component} from 'react';
import './TradePanel.css'
class TradePanel extends Component {

  render() {
    return (
      <div className='TradePanel'>
          <h5 className='TradeHeader'>Trades</h5>
          <table align='center'>
            <thead>
            <tr>
                <th>Amount</th>
                <th>Average Price</th>
                <th>Cost</th>
            </tr>
            </thead>
            <tbody>
                
            </tbody>
      </table>
     </div>
    );
  }
}


export default TradePanel;