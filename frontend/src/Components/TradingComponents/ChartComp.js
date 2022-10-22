import React, { Component } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

class ChartComp extends Component {
state = {
  Data : null,
  CanDrawGraph : false
}

componentDidMount(){
  
}

  componentDidUpdate(prevProp) {
    if (prevProp.StockData !== this.props.StockData){
      var data = [
        {
          name: 'Janurary',
          uv: 0,
          pv: this.props.StockData[0],
          amt: 123,
        },
        {
          name: 'Janurary',
          uv: 3000,
          pv: this.props.StockData[1],
          amt: 2210,
        },
        {
          name: 'Janurary',
          uv: 2000,
          pv: this.props.StockData[2],
          amt: 2290,
        },
        {
          name: 'Janurary',
          uv: 2780,
          pv: this.props.StockData[3],
          amt: 2000,
        },
        {
          name: 'Page E',
          uv: 1890,
          pv: this.props.StockData[4],
          amt: 2181,
        },
        {
          name: 'Page F',
          uv: 2390,
          pv: this.props.StockData[5],
          amt: 2500,
        },
        {
          name: 'Page G',
          uv: 3490,
          pv: this.props.StockData[6],
          amt: 2100,
        },
      ];
      this.setState({Data : data, CanDrawGraph : true});
  }
}
      
  render() {
    return (
    <div id=""style={{height:'100%'}}>
        {this.state.CanDrawGraph && <ResponsiveContainer width="100%" height="100%">
        <LineChart  data={this.state.Data}>
        <XAxis dataKey="name" />
          <YAxis />
          <Line type="monotone" dataKey="pv" stroke="#ffffff" strokeWidth={2} />
        </LineChart>
        </ResponsiveContainer>
  }

    </div>
      );
    }
  }
  
  
  export default ChartComp;