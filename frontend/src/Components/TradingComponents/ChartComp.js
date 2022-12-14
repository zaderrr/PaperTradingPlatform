import React, { Component } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartToolTip from './ChartToolTip.js';
import './ChartComp.css'
class ChartComp extends Component {
state = {
  Data : null,
  CanDrawGraph : false
}

componentDidMount(){
  
}

  componentDidUpdate(prevProp) {
    if (prevProp.render !== this.props.render || prevProp.StockData !== this.props.StockData){
      var data= []
      
      for (let index = 0; index < this.props.StockData.length; index++) {
        var point = {
          name : index,//new Date(this.props.StockData[index]["Time"] * 1000).toDateString(),
          High : parseFloat(this.props.StockData[index]["High"]),
          Low : parseFloat(this.props.StockData[index]["Low"]),
          Open : parseFloat(this.props.StockData[index]["Open"]),
          Close : parseFloat(this.props.StockData[index]["Close"])
        }
        data.push(point)
      }
      this.setState({Data : data, CanDrawGraph : true});
  }
}

  render() {
    return (
    <div id="GraphBox"style={{height:'100%'}}>
        {this.state.CanDrawGraph && <ResponsiveContainer width="100%" height="100%">
        <LineChart  data={this.state.Data}>
          <XAxis  dataKey="name" />
          <YAxis domain={['auto', 'auto']}  />
          <Tooltip 
           contentStyle={{"color" : 'red'}}
           itemStyle={{"color" : 'blue'}}
           content={<ChartToolTip ></ChartToolTip>}
           />
          <Line type="monotone" dataKey="Close" stroke="#ffffff" strokeWidth={2} />
        </LineChart>
        </ResponsiveContainer>
  }
    </div>
      );
    }
  }
  
  
  export default ChartComp;