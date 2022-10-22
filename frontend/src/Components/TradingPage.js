import React from 'react';
import './TradingPage.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faHouse} from '@fortawesome/free-solid-svg-icons';
import {faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
import {faChartPie} from '@fortawesome/free-solid-svg-icons';   
import {faUser} from '@fortawesome/free-solid-svg-icons';
import './TradingComponents/Search.css';
import StockPanel from './TradingComponents/StockPanel.js';
import Portfolio from './Portfolio.js';
import Register from './AccountComps/Register.js';
import Search from './TradingComponents/Search.js';
class TradingPage extends React.Component {
state = {
    SlideMenu : false,
    stock : "AAPL",
    LoggedIn : false, 
    PanelToShow : "Chart",
    FullName : "Apple Inc.",
    connection : null,
    BuyPrice : 0,
    Holdings : null,
    StockHistory : null
  };
  componentDidMount() {
    this.IsValidSession();
    var _this = this;
    var connection = new WebSocket('ws://localhost:9030');
    connection.onopen = function () {
      var msg = {
        MessageType : "Init",
        Auth : window.localStorage.getItem('Auth'),
        Stock : _this.state.stock
      }
      
      connection.send(JSON.stringify(msg));
    };

    // Log errors
    connection.onerror = function (error) {
      console.error('WebSocket Error ' + error);
    };

    // Log messages from the server
    connection.onmessage = function (e) {
      var msg = JSON.parse(e['data']);
      if (msg['MessageType'] === "InitRes"){
        _this.setState({BuyPrice : msg['Price'], Holdings : msg['Holdings'], StockHistory : msg['PrevData']});
      }else if (msg["MessageType"] === "StockPrice"){
        _this.setState({BuyPrice : msg['Price']});
      }else if (msg["MessageType"] === "ChangeSub"){
        
        _this.setState({BuyPrice : msg["Price"], StockHistory : msg['PrevData']})
      }
      else if (msg["Status"] === true){
      _this.setState({Holdings : msg['Holdings']});
      }

    }

    this.setState({connection : connection});

  }

  IsValidSession = async() => {
    const response = await fetch('/CheckSession', {
        method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'Authorisation' : window.localStorage.getItem('Auth')
            }
          });
        var body = await response.json();
        if (body['Valid'] === true){
              this.setState({LoggedIn : true})
        }
        else{
          this.setState({LoggedIn : false})
        }
        
  }

  OrderStock = async => {
    var amnt = document.getElementById("StockAmount").value;
    var OrderType = document.getElementsByClassName("button is-active BuySellButton")[0].innerHTML;
    var data = {
      MessageType : "OrderStock",
      Method : OrderType,
      Auth : window.localStorage.getItem('Auth'),
      Stock : this.state.stock,
      Amount : amnt
    }
    this.state.connection.send(JSON.stringify(data))

  }

  ShowSideMenu = () => {
    if (this.state.SlideMenu === false){
        document.getElementById("menuslider").style.display = 'block';
        this.setState({SlideMenu : true});
    }else {
        document.getElementById("menuslider").style.display = 'none';
        this.setState({SlideMenu : false});
    }
  }
  ShowPortfolio() {
    this.setState({PanelToShow: "Portfolio"});
  }

  StockSelected = (e) => {
    this.setState({
      FullName : e.currentTarget.firstChild.getAttribute("fullname"),
       stock : e.currentTarget.firstChild.innerHTML
      }, () => {
        this.ChangeSubscription();
      });
  }

  UserButtonClicked() 
  {
    if (!this.state.LoggedIn)
    {
        document.getElementsByClassName("modal")[0].classList.add("is-active");
    }else{
      alert(this.state.LoggedIn)
    }

  }
  ChangeSubscription() {
    var msg  =
    {
      MessageType : "ChangeSubscription",
      Stock : this.state.stock
    }
    this.state.connection.send(JSON.stringify(msg));
  }
  CloseModal() 
  {
    document.getElementById("AccountModal").classList.remove("is-active")
  }

  ShowChart() 
  {
    this.setState({PanelToShow : "Chart"})
  }

  


  render() {
    return (
     <div className='TradingApp' id='TradingApp'>
      <div className="modal" id='AccountModal'>
            <div className="modal-background" onClick={() => this.UserButtonClicked()} ></div>
            <div className="modal-content">
              <Register></Register>
            </div>
            <button className="modal-close is-large" aria-label="close" onClick={this.CloseModal}></button>
          </div>
       <div id='IconMenu'>
           <aside className='Menu'>
            <ul className="menu-list">
                <li><a onClick={() => this.ShowChart()}><span className="icon"><FontAwesomeIcon icon={faHouse} /></span></a></li>
                <li><a onClick={() => this.ShowSideMenu()}><span className="icon"><FontAwesomeIcon icon={faMagnifyingGlass} /></span></a></li>
                <li><a onClick={() => this.ShowPortfolio()}><span className="icon"><FontAwesomeIcon icon={faChartPie} /></span></a></li>
            </ul>
            <ul className="menu-list">
              <li onClick={() => this.UserButtonClicked()} ><a><span className="icon"><FontAwesomeIcon icon={faUser} /></span></a></li>
            </ul>
                
           </aside>
           
       </div>
       <div className='TradingBody'>
       <div className='TopTickers'>
        <div >AMZN $123</div>
        <div >AMZN $123</div>
        <div >AMZN $123</div>
        <div >AMZN $123</div>
        <div >AMZN $123</div>
        <div >AMZN $123</div>
        </div>   
        <div id='menuslider'>
          <Search StockSelected={this.StockSelected} ShowSideMenu={this.ShowSideMenu}></Search>
        </div>
            <div className='MainArea'>
              {this.state.PanelToShow === "Portfolio" && <Portfolio Holdings = {this.state.Holdings}></Portfolio>}
              {this.state.PanelToShow === "Chart" && <StockPanel stock={this.state.stock} StockData={this.state.StockHistory} BuyPrice={this.state.BuyPrice} FullName={this.state.FullName} connection={this.state.connection} OrderStock={this.OrderStock}></StockPanel>}
            </div>
            </div>
     </div>
    );
  }
}


export default TradingPage;