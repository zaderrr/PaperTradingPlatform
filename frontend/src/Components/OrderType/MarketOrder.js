import React, { Component} from 'react';
import './Orders.css'
class MarketOrder extends Component {

  render() {
    return (
    <div className='MarketOrderType' align="center">
        <div className="field has-addons MarketPriceField" align="center">
            <div className="control">
                <button className="button is-white">
                    Price
                </button>
            </div>
            <div className="control">
                <input className="input" type="text" value={this.props.BuyPrice} disabled />
            </div>
        </div>
        <div className="field has-addons MarketPriceField" align="center">
            <div className="control">
                <button className="button is-white">
                    Amount
                </button>
            </div>
            <div className="control">
                <input id="StockAmount" autoComplete="off" className="input" type="number" onInput={this.props.OnAmountInput} placeholder='0.00'  />
            </div>
        </div>
        
     </div>
    );
  }
}


export default MarketOrder;