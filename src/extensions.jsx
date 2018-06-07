import React from "react";
import ReactDOM from "react-dom";

export default class Extensions extends React.Component {
  constructor(props) {
    super(props);
    this.extensions = ["js", "css", "glsl"];
    this.state = {
      fontColor: ["#000", "#000", "#000"]
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }

  handleMouseEnter(i) {
    let fontColor = this.state.fontColor;
    fontColor[i] = "#e38";
    this.setState({
      fontColor: fontColor
    });
  }
  handleMouseLeave(i) {
    let fontColor = this.state.fontColor;
    fontColor[i] = "#000";
    this.setState({
      fontColor: fontColor
    });
  }
  handleClick(i) {
    this.props.selectionchange(this.extensions[i]);
    this.props.extensionchange(this.extensions[i]);
    this.props.handleextensionsclick();
  }
  render() {
    return (
      <div id="extensions">
        <ul
          style={{
            margin: 0,
            padding: 0
          }}
        >
          {this.extensions.map((e, i) => {
            return (
              <li key={e}>
                <p
                  className="extension"
                  style={{
                    color: this.state.fontColor[i]
                  }}
                  onClick={() => this.handleClick(i)}
                  onMouseEnter={() => this.handleMouseEnter(i)}
                  onMouseLeave={() => this.handleMouseLeave(i)}
                >
                  {e}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
