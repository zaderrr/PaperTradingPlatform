import React, { Component} from 'react';
import './StockPanel.css';
import ChartComp from './ChartComp.js';
import ModelsComp from './ModelsComp.js'
import CompareComp from './CompareComp.js'
import FinancialsComp from './FinancialsComp.js';
import MarketOrder from '../OrderType/MarketOrder';
class StockPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      InfoToShow : <ChartComp stock={props.stock}></ChartComp>,
      connection : null,
      BuyPrice : null
    };

  }
  componentDidMount() {

  }
  componentDidUpdate(prevProp) {
    if (prevProp.stock != this.props.stock){
      this.setState({InfoToShow : <ChartComp stock={this.props.stock}></ChartComp>}, () => {
      });
    }
  }

  ChangeTab = async(StockInfoToShow, header) => {
    this.setState({InfoToShow : StockInfoToShow});
    var selected = document.getElementsByClassName("is-active")[0].classList.remove('is-active');
    document.getElementById(header).classList.add('is-active');
  }

  

  render() {
    return (
      <div className='StockPanel'>
        <div className='HeaderAndChart'>
          <div className='StockInfoContainer'>
            <div className='StockPriceInfo'>
              <div align="left">
              <h1 className='HeaderItem HeaderLabel'>{this.props.FullName}</h1>
              <p className='StockHeader'><strong>{this.props.stock}</strong></p>
              </div>
              <div align="left">
                <p className='HeaderItem HeaderLabel'>Price</p>
                <h1 className='StockHeaderStockHeader'>£{this.props.BuyPrice}</h1>
              </div>
              <div align="left">
                <p className='HeaderItem HeaderLabel'>24h Change</p>
                <h1 className='HeaderItem HeaderInfo'>%12</h1>
              </div>
              <div align="left">
                <p className='HeaderItem HeaderLabel'>24h High</p>
                <h1 className='HeaderItem HeaderInfo'>£123</h1>
              </div>
              <div align="left">
                <p className='HeaderItem HeaderLabel'>24h Low</p>
                <h1 className='HeaderItem HeaderInfo'>£120</h1>
              </div>
            </div>
          </div>
          <div className='BuyPanelAndInfo'>
            <div className='ChartOrOther'>
              <div className='HeaderOptions'>
                <div className="tabs is-medium">
                  <ul>
                    <li className="is-active" id='ChartHeader'><a onClick={() => this.ChangeTab(<ChartComp stock={this.props.stock}></ChartComp>, "ChartHeader")}>Chart</a></li>
                    <li id='FinancialsHeader'><a onClick={() => this.ChangeTab(<FinancialsComp></FinancialsComp>, "FinancialsHeader")} >Financials</a></li>
                    <li id='ModelsHeader'><a  onClick={() => this.ChangeTab(<ModelsComp></ModelsComp>, "ModelsHeader")}>Models</a></li>
                    <li id='CompareHeader' ><a onClick={() => this.ChangeTab(<CompareComp></CompareComp>, "CompareHeader")}>Compare</a></li>
                  </ul>
                </div>
              </div>
              <div className='MarketInfo'>
                {this.state.InfoToShow}
              </div>
            </div>
            <div className='BuyPanel'>
              <div className='PanelBuyButtons'>
                <button className='button'>BUY</button>
                <button className='button'>Sell</button>
              </div>
              <div className="tabs">
                <ul>
                  <li className="is-active" ><a>Market</a></li>
                  <li><a>Limit</a></li>
                  <li><a>Stop Limit</a></li>
                  <li><a>Strategy</a></li>
                </ul>
              </div>
              <div className='OrderTypeFields' align="right">
                <div>
                  <MarketOrder BuyPrice={this.props.BuyPrice}></MarketOrder>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='NewsAndAbout'>
          <h1 className='title'>News & About</h1>
        </div>
     </div>
    );
  }
}


export default StockPanel;