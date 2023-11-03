import React from 'react';
class Counter extends React.Component {
  // to use the userState property you have to call the contructor method
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    this.handleIncreseClick = this.handleIncreseClick.bind(this);
    this.handleDecreseClick = this.handleDecreseClick.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }
  // handler the increse clicked
  handleIncreseClick() {
    //to attach the this keyword to the fuction you have to bind it manually
    this.setState(curr => {
      return { count: curr.count + 1 };
    });
  }
  handleDecreseClick() {
    this.setState(curr => {
      return { count: curr.count > 0 ? curr.count - 1 : curr.count };
    });
  }
  handleReset() {
    this.setState(curr => {
      return { count: 0 };
    });
  }
  render() {
    const today = new Date();
    today.setDate(today.getDate() + this.state.count);
    return (
      <div className="counter">
        <button onClick={this.handleDecreseClick}>-</button>
        <span>{today.toDateString() + ' '}</span>
        <button onClick={this.handleIncreseClick}>+</button>
        <button onClick={this.handleReset}>Reset</button>
      </div>
    );
  }
}
export default Counter;
