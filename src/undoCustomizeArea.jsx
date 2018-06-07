//export to "renderingObject.jsx"
import React from "react";
import ReactDOM from "react-dom";
import { inject, observer } from "mobx-react";

@inject("state")
@observer
export default class UndoCustomizeArea extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp=this.handleMouseUp.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleCheckSpace = this.handleCheckSpace.bind(this);
    this.handleCheckIndention = this.handleCheckIndention.bind(this);
    this.handleCheckSymbol = this.handleCheckSymbol.bind(this);
    this.handleCheckNumber = this.handleCheckNumber.bind(this);
    this.handleCheckInput = this.handleCheckInput.bind(this);
    this.handleCheckInterruption = this.handleCheckInterruption.bind(this);
    this.handleCheckEvent = this.handleCheckEvent.bind(this);
    this.handleCheckWord = this.handleCheckWord.bind(this);    
    this.width = window.innerWidth;
  }
  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }
  handleResize(e) {
    let diff = -3;
    this.props.state.renderingObject.forEach(e => {
      diff += 3;
      if (e.type == "run") {
        diff += 4;
      }
    });
    const per = (window.innerWidth - diff) / (this.width - diff);
    const width = this.props.state.renderingObject[this.props.num].width;
    this.props.state.sizeChange(this.props.num, width * per);
    this.width = window.innerWidth;
  }
  handleMouseMove(e) {
    if (this.props.state.renderingObject[this.props.num].scrolling) {
      const width = this.props.state.renderingObject[this.props.num].width;      
      const diff = e.nativeEvent.clientX-this.refs.undoCustomizeArea.getBoundingClientRect().left;
      const frontElementWidth = this.props.state.renderingObject[
        this.props.num - 1
      ].width;
      this.props.state.sizeChange(this.props.num - 1, frontElementWidth + diff);
      this.props.state.sizeChange(this.props.num, width - diff);
    }
    if (this.props.state.renderingObject.length > this.props.num + 1) {
      if (this.props.state.renderingObject[this.props.num + 1].scrolling) {
        const width = this.props.state.renderingObject[this.props.num].width;
        const diff = this.refs.undoCustomizeArea.getBoundingClientRect().right-e.nativeEvent.clientX;
        const nextElementWidth = this.props.state.renderingObject[
          this.props.num + 1
        ].width;
        this.props.state.sizeChange(
          this.props.num + 1,
          nextElementWidth + diff
        );
        this.props.state.sizeChange(this.props.num, width - diff);
      }
    }
  }
  handleMouseUp(e){
    if (this.props.state.renderingObject[this.props.num].scrolling) {
      this.props.state.renderingObject[this.props.num].scrolling=false;
    }
  }
  handleCheckSpace() {
    let obj = this.props.state.customizeState;
    obj.space = !obj.space;
    this.props.state.updateCustomizeState(obj);
  }
  handleCheckIndention() {
    let obj = this.props.state.customizeState;
    obj.indention = !obj.indention;
    this.props.state.updateCustomizeState(obj);
  }
  handleCheckSymbol() {
    let obj = this.props.state.customizeState;
    obj.symbol = !obj.symbol;
    this.props.state.updateCustomizeState(obj);    
  }
  handleCheckNumber() {
    let obj = this.props.state.customizeState;
    obj.number = !obj.number;
    this.props.state.updateCustomizeState(obj);    
  }
  handleCheckInput() {
    let obj = this.props.state.customizeState;
    obj.input = !obj.input;
    this.props.state.updateCustomizeState(obj);
  }
  handleCheckInterruption() {
    let obj = this.props.state.customizeState;
    obj.interruption = !obj.interruption;
    this.props.state.updateCustomizeState(obj);
  }
  handleCheckEvent() {
    let obj = this.props.state.customizeState;
    obj.event = !obj.event;
    this.props.state.updateCustomizeState(obj);    
  }
  handleCheckWord() {
    let obj = this.props.state.customizeState;
    obj.word = !obj.word;
    this.props.state.updateCustomizeState(obj);    
  }
  render() {
    return (
      <div 
      onMouseUp={this.handleMouseUp}
      ref="undoCustomizeArea"
      onMouseMove={this.handleMouseMove} style={this.props.style}>
       <input
          type="checkbox"
          checked={this.props.state.customizeState.space}
          onChange={this.handleCheckSpace}
        />スペース<br />
        <input
          type="checkbox"
          checked={this.props.state.customizeState.indention}
          onChange={this.handleCheckIndention}
        />改行<br />
        <input
          type="checkbox"
          checked={this.props.state.customizeState.symbol}
          onChange={this.handleCheckSymbol}
        />記号<br />
          <input
          type="checkbox"
          checked={this.props.state.customizeState.number}
          onChange={this.handleCheckNumber}
        />数字<br />
        <input
          type="checkbox"
          checked={this.props.state.customizeState.input}
          onChange={this.handleCheckInput}
        />実行<br />
        <input
          type="checkbox"
          checked={this.props.state.customizeState.interruption}
          onChange={this.handleCheckInterruption}
        />中断<br />
        <input
          type="checkbox"
          checked={this.props.state.customizeState.event}
          onChange={this.handleCheckEvent}
        />イベント<br />
        <input
          type="checkbox"
          checked={this.props.state.customizeState.word}
          onChange={this.handleCheckWord}
        />単語<br />
      </div>
    );
  }
}
