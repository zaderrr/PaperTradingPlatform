import React, { Component} from 'react';
import './Orders.css'
class MarketOrder extends Component {
    constructor(props) {
        super(props);
    }

  render() {
    return (
    <div className='MarketOrderType' align="center">
        <div className="field has-addons MarketPriceField" align="center">
            <div className="control">
                <a className="button is-white">
                    Price
                </a>
            </div>
            <div className="control">
                <input className="input" type="text" value={this.props.BuyPrice} disabled />
            </div>
        </div>
        <div className="field has-addons MarketPriceField" align="center">
            <div className="control">
                <a className="button is-white">
                    Amount
                </a>
            </div>
            <div className="control">
                <input id="StockAmount" className="input" type="text" placeholder='0.00'  />
            </div>
        </div>
        
     </div>
    );
  }
}


export default MarketOrder;