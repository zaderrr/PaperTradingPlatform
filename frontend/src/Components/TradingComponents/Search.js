import React, { Component} from 'react';
import './Search.css'
class Search extends Component {
  constructor(props) {
    super(props);
  }

  SearchCompanyList = async (value) => {
    var url = "https://finbox.com/_/api/v5/search-v2/company?q=" + value;
    const response = await fetch(url);
        var body = await response.json();
        return body
  }

  StockSearch = async () => {
    var newStock = document.getElementById("StockSearchBar").value;
    if (document.getElementsByClassName("table")[0].style.display != 'block'){
      document.getElementsByClassName("table")[0].style.display = 'block';
      document.getElementsByClassName("SearchMenu")[0].style.justifyContent = 'start';
    }
    newStock = newStock.toUpperCase()
    var stocks = await this.SearchCompanyList(newStock)
    var tbody = document.getElementById("stocktablebody");
    var counter = 0;
    tbody.childNodes.forEach(element => {
      element.firstChild.setAttribute("fullname", stocks[counter]["name"]);  
      element.firstChild.innerHTML = stocks[counter]["ticker"]
      counter++;
    })
    for (let index = 0; index < stocks.length; index++) {
      
      /*/var tr = document.createElement("tr")
      var tdName = document.createElement("tr")
      tdName.innerHTML = stocks[index]["ticker"]
      var tdLow = document.createElement("tr")
      var tdHigh = document.createElement("tr")
      var tdChange = document.createElement("tr")
      tr.append(tdName);
      tr.append(tdHigh)
      tr.append(tdLow)
      tr.append(tdChange)
      document.getElementById("stocktablebody").append(tr);
      /*/
    }
  }




  CloseSearch() {
    document.getElementById("menuslider").style.display = 'none';
  }

  render() {
    return (
    <div className='SlideClick'>
     <div className='SearchMenu'>
      <div>
       <input className="SearchBar" id='StockSearchBar' autoComplete="off" type="text" onInput={this.StockSearch} placeholder="Search for a market..."></input>
      </div>
       <table id="testtt" className="table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Buy</th>
            <th>Sell</th>
            <th>% Change</th>
          </tr>
        </thead>
        <tbody id='stocktablebody'>
          <tr onClick={this.props.StockSelected}>
            <td Fullname="">TSLA</td>
            <td>504</td>
            <td>506</td>
            <td>12</td>
            
          </tr>
          <tr>
            <td>TSLA</td>
            <td>504</td>
            <td>506</td>
            <td>12</td>
          </tr>
          <tr>
            <td>TSLA</td>
            <td>504</td>
            <td>506</td>
            <td>12</td>
          </tr>
          <tr>
            <td>TSLA</td>
            <td>504</td>
            <td>506</td>
            <td>12</td>
          </tr>
          <tr>
            <td>TSLA</td>
            <td>504</td>
            <td>506</td>
            <td>12</td>
          </tr>
          <tr>
            <td>TSLA</td>
            <td>504</td>
            <td>506</td>
            <td>12</td>
          </tr>
          <tr>
            <td>TSLA</td>
            <td>504</td>
            <td>506</td>
            <td>12</td>
          </tr>
          <tr>
            <td>TSLA</td>
            <td>504</td>
            <td>506</td>
            <td>12</td>
          </tr>
          <tr>
            <td>TSLA</td>
            <td>504</td>
            <td>506</td>
            <td>12</td>
          </tr>
          <tr>
            <td>TSLA</td>
            <td>504</td>
            <td>506</td>
            <td>12</td>
          </tr>
        </tbody>
      </table>
     </div>
     <div className='EmptyClick' onClick={this.props.ShowSideMenu}></div>
     </div>
    );
  }
}


export default Search;