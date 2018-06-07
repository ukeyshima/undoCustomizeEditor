import React from "react";
import ReactDOM from "react-dom";
import { inject, observer } from "mobx-react";

@inject("state")
@observer
export default class LoadButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fontColor: "#000"
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e) {    
    const file = e.target.files;
    const reader = new FileReader();
    reader.readAsText(file[0]);
    reader.onload = () => {      
      this.props.state.editor.setValue(reader.result);
    };    
    delete this.inputFile; 
  }
  handleClick() {
    this.inputFile = document.createElement("input");
    this.inputFile.type = "file";
    this.inputFile.addEventListener("change",  this.handleChange);
    const e = document.createEvent("MouseEvents");
    e.initMouseEvent(
      "click",
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    );    
    this.inputFile.dispatchEvent(e);
  }
  handleMouseLeave() {
    this.setState({
      fontColor: "#000"
    });
  }
  handleMouseEnter() {
    this.setState({
      fontColor: "#e38"
    });
  }
  render() {
    return (
      <React.Fragment>
        <button
          style={{
            color: this.state.fontColor
          }}
          onClick={this.handleClick}
          onMouseLeave={this.handleMouseLeave}
          onMouseEnter={this.handleMouseEnter}
        >
          load
        </button>
      </React.Fragment>
    );
  }
}
