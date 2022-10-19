import React, { Component} from 'react';
import './Portfolio.css'
class Portfolio extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className='PortfolioPanel'>
          <h4 className='title is-2'>Portfolio</h4>
          <div>
            <label>Cash</label>
            <p id='CashBalance'></p>
          </div>
     </div>
    );
  }
}


export default Portfolio;