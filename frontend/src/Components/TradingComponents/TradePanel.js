import React, { Component} from 'react';
import './TradePanel.css'
class TradePanel extends Component {
  componentDidUpdate(){
    console.log(this.props.BuyPrice)
  }
  render() {
    return (
      <div className='TradePanel'>
        <h5 className='TradeHeader'>Trades</h5>
        <table align='center'>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Average Price</th>
              <th>Return</th>

            </tr>
          </thead>
          <tbody>
            {this.props.Holdings != null && this.props.Holdings.map(Holding =>
              Holding.Instrument == this.props.stock && <tr key={Math.random()}>
                <td>{Holding.Amount}</td>
                <td>{Holding.Average_Price}</td>
                <td>{(Holding.Average_Price - this.props.BuyPrice).toFixed(2)}</td> 
                
              </tr>)}
          </tbody>
        </table>
      </div>
    );
  }
}


export default TradePanel;