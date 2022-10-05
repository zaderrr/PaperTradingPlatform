import React, { Component} from 'react';
import './Portfolio.css'
class Portfolio extends Component {

  render() {
    return (
      <div className='PortfolioPanel'>
          <h4 className='title is-2'>Portfolio</h4>
          <div>
            <label>Cash</label>
            <p id='CashBalance'>£ {window.sessionStorage.getItem('CashFunds')}</p>
          </div>
     </div>
    );
  }
}


export default Portfolio;