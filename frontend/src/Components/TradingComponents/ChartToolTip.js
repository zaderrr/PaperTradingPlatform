import React, { Component } from 'react';

class ChartToolTip extends Component {


  render() {
    return (
         this.props.active && 
        <div>
            { this.props.active &&
        <div className="custom-tooltip">
        <p className="label">{this.props.label}</p>
        <p className="close">Close : {(this.props.payload[0].payload.Close)}</p>
        <p className="open">Open : {(this.props.payload[0].payload.Open)}</p>
        <p className="high">High : {(this.props.payload[0].payload.High)}</p>
        <p className="low">Low : {(this.props.payload[0].payload.Low)}</p>
      </div>
  }
    </div>
        
    );
        
    } 
}
export default ChartToolTip;