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
              <th>Type</th>
              <th>Amount</th>
              <th>Cost</th>
              <th>Return</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {this.props.Trades != undefined && this.props.Trades.map(Trade =>
              Trade.Instrument == this.props.stock && <tr key={Math.random()}>
                <td>{Trade.Method}</td>
                <td>{Trade.Amount}</td>
                <td>{Trade.Cost}</td>
                <td>{Trade.Status=="Active" && Trade.Amount * this.props.BuyPrice}</td>
                <td>{Trade.Status}</td>

              </tr>)}
          </tbody>
        </table>
      </div>
    );
  }
}


export default TradePanel;