import React, { Component} from 'react';
import './TradingPage.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faMagnifyingGlass, faChartPie, faUser } from '@fortawesome/free-solid-svg-icons'
import './TradingComponents/Search.css';
import StockPanel from './TradingComponents/StockPanel';
import Portfolio from './Portfolio';
import Register from './AccountComps/Register';
import Cookies from 'js-cookie';
import Search from './TradingComponents/Search';
class TradingPage extends Component {
state = {
  SlideMenu : false,
  stock : "AAPL",
  LoggedIn : false, 
  PanelToShow : "Chart",
  FullName : "Apple Inc.",
  connection : null,
  BuyPrice : null
};
  componentDidMount() {
    this.IsValidSession();
    var _this = this;
    var connection = new WebSocket('ws://localhost:9030');
    connection.onopen = function () {
      var msg = {
        MessageType : "Init",
        SessionAuth : Cookies.get("SessionID"),
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
      if (msg['MessageType'] == "InitRes"){
        var cash = msg['CashFunds'];
        window.sessionStorage.setItem('CashFunds', cash);
        _this.setState({BuyPrice : msg['Price']});
      }else {
        _this.setState({BuyPrice : msg['Price']});
      }
    };

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
            
        }
        
  }
  ShowSideMenu() {
    if (this.state.SlideMenu === false){
        document.getElementById("menuslider").style.display = 'block';
        this.setState({SlideMenu : true});
    }else {
        document.getElementById("menuslider").style.display = 'none';
        this.setState({SlideMenu : false});
    }
  }
  ShowPortfolio() {
    console.log("Portfolio clicked")
    this.setState({PanelToShow: "Portfolio"});
  }

  StockSelected = (e) => {
    this.setState({
      FullName : e.currentTarget.firstChild.getAttribute("fullname"),
       stock : e.currentTarget.firstChild.innerHTML
      });
  }

  UserButtonClicked() 
  {
    if (!this.state.LoggedIn)
    {
        document.getElementsByClassName("modal")[0].classList.add("is-active");
    }else{
      alert("logged in")
    }

  }

  CloseModal() 
  {
    document.getElementById("AccountModal").classList.remove("is-active")
  }


  componentDidUpdate(prevProp) {
    if (prevProp.stock !== this.props.stock){
      console.log(this.state)
      this.setState({stock : this.props.stock});
    }
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
                <li><a><span className="icon"><FontAwesomeIcon icon={faHouse} /></span></a></li>
                <li><a onClick={() => this.ShowSideMenu()}><span className="icon"><FontAwesomeIcon icon={faMagnifyingGlass} /></span></a></li>
                <li><a><span className="icon" onClick={() => this.ShowPortfolio()}><FontAwesomeIcon icon={faChartPie} /></span></a></li>
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
        <div >AMZN $1d23</div>
        <div >AMZN $123</div>
        <div >AMZN $123</div>
        </div>   
        <div id='menuslider'>
          <Search StockSelected={this.StockSelected}></Search>
        </div>
            <div className='MainArea'>
              {this.state.PanelToShow == "Portfolio" && <Portfolio></Portfolio>}
              {this.state.PanelToShow == "Chart" && <StockPanel stock={this.state.stock} BuyPrice={this.state.BuyPrice} FullName={this.state.FullName} connection={this.state.connection}></StockPanel>}
            </div>
            </div>
     </div>
    );
  }
}


export default TradingPage;