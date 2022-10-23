import React, { Component} from 'react';
import './StockPanel.css';
import ChartComp from './ChartComp.js';
import ModelsComp from './ModelsComp.js'
import CompareComp from './CompareComp.js'
import FinancialsComp from './FinancialsComp.js';
import MarketOrder from '../OrderType/MarketOrder.js';
import TradePanel from './TradePanel.js';
class StockPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      InfoToShow : <ChartComp stock={props.stock} StockData={this.props.StockData} BuyPrice={this.props.BuyPrice}></ChartComp>,
      CanRenderChart : false,
      IsError : false
    };

  }
  componentDidMount() {
    if (this.props.StockData == null){

    }else{
        this.setState({CanRenderChart : true});
    }
  }
  componentDidUpdate(prevProp) {
    if (prevProp.StockData != this.props.StockData){
      this.setState({CanRenderChart : true});
    }
    else if (prevProp.Error != this.props.Error){
      this.setState({IsError : this.props.Error[0]})
    }
  }


  ChangeTab = async(StockInfoToShow, header) => {
    this.setState({InfoToShow : StockInfoToShow});
    var selected = document.getElementsByClassName("is-active")[0].classList.remove('is-active');
    document.getElementById(header).classList.add('is-active');
  }

  ToggleBuySell() {
    var ButtonParent = document.getElementById("BuySellButtons");
    ButtonParent.childNodes.forEach(element => {
      element.classList.toggle("is-active");
      element.classList.toggle("is-dark");
    });
  }

  OnAmountInput = async (evt) => {
    this.setState({IsError : false});
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
                <div className="tabs is-medium HeaderTabs">
                  <ul>
                    <li className="is-active" id='ChartHeader'><a onClick={() => this.ChangeTab(<ChartComp stock={this.props.stock}></ChartComp>, "ChartHeader")}>Chart</a></li>
                    <li id='FinancialsHeader'><a onClick={() => this.ChangeTab(<FinancialsComp></FinancialsComp>, "FinancialsHeader")} >Financials</a></li>
                    <li id='ModelsHeader'><a  onClick={() => this.ChangeTab(<ModelsComp></ModelsComp>, "ModelsHeader")}>Models</a></li>
                    <li id='CompareHeader' ><a onClick={() => this.ChangeTab(<CompareComp></CompareComp>, "CompareHeader")}>Compare</a></li>
                  </ul>
                </div>
              </div>
              <div className='MarketInfo'>
                <ChartComp stock={this.props.stock} render={this.state.CanRenderChart} StockData={this.props.StockData} BuyPrice={this.props.BuyPrice}></ChartComp>
              </div>
              <TradePanel></TradePanel>
            </div>
            <div className='BuyPanel'>
              <div className="tabs is-centered test" >
                <ul>
                  <li className="is-active" ><a>Market</a></li>
                  <li><a>Limit</a></li>
                  <li><a>Stop Limit</a></li>
                  <li><a>Strategy</a></li>
                </ul>
              </div>

              <div className='PanelBuyButtons'>
                <div className="buttons has-addons" id="BuySellButtons">
                  <button onClick={this.ToggleBuySell} className="button is-active BuySellButton">Buy</button>
                  <button onClick={this.ToggleBuySell} className="button is-dark BuySellButton">Sell</button>
                </div>
              </div>
              <div className='OrderTypeFields'>
                <div>
                  <MarketOrder BuyPrice={this.props.BuyPrice} OnAmountInput={this.OnAmountInput}></MarketOrder>
                </div>
              </div>
                {this.state.IsError && <p  id="StockOrderError">{this.props.Error}</p> }
              <button onClick={this.props.OrderStock} id="OrderButton"className="button is-active BuySellButton">Order</button>
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