import React, { Component} from 'react';
import './Portfolio.css'
class Portfolio extends Component {

  
  render() {
    return (
      <div className='PortfolioPanel'>
        <h4 className='title is-2'>Portfolio</h4>
        <div>
        <table align='center'>
        <thead>
          <tr>
            <th>Item</th>
            <th>Amount</th>
            <th>Average Price</th>
            <th>Current Worth</th>
          </tr>
        </thead>
        <tbody>
        {this.props.Holdings.map(holding => 
        <tr key={holding.Instrument}>
          <td>{holding.Instrument}</td>
          <td>{holding.Amount}</td>
          <td>{holding.Average_Price}</td>
          <td>{holding.Instrument != "Cash" && holding.CurrentWorth}</td> 
        </tr>)}

          
        </tbody>
      </table>
          </div>
     </div>
    );
  }
}


export default Portfolio;