import React from "react";
import ReactDOM from "react-dom";
import brace from "brace";
import AceEditor from "react-ace";

import "brace/mode/html";
import "brace/mode/javascript";
import "brace/mode/glsl";
import "brace/mode/css";
import "brace/theme/dawn";

import { inject, observer } from "mobx-react";

@inject("state")
@observer
export default class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.width = window.innerWidth;
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
  componentWillUpdate() {
    this.props.state.updateDontExecute(true);
    const text = this.props.state.editor.getValue();
    this.props.state.updateActiveText(text);
  }
  componentDidUpdate(nextProps) {
    this.editor.setValue(nextProps.state.activeTextFile.text);
  }
  componentDidMount() {
    this.editor = this.refs.aceEditor.editor;
    this.props.state.updateEditor(this.editor);
    const self = this;
    const AceUndoManager = this.editor.session.$undoManager;
    self.sequenceTime = new Date().getTime();
    AceUndoManager.execute = function(options) {
      const activeId = self.props.state.activeTextFile.id;      
      if (self.props.state.dontExecute === false) {
        var deltaSets = options.args[0];
        this.$doc = options.args[1];        
        if (new Date().getTime() - self.sequenceTime > 2000) {
          this.$undoStack[activeId].push([
            {
              group: "doc",
              deltas: [
                {
                  start: deltaSets[0].deltas[0].start,
                  end: deltaSets[0].deltas[0].start,
                  action: "interruption",
                  lines: [""]
                }
              ]
            }
          ]);
        }
        self.sequenceTime = new Date().getTime();
        this.$undoStack[activeId].push(deltaSets);
        this.$redoStack[activeId] = [];
        if (this.dirtyCounter[activeId] < 0) {
          this.dirtyCounter[activeId] = NaN;
        }
        this.dirtyCounter[activeId]++;
      } else {
        self.props.state.updateDontExecute(false);
      }
    };
    AceUndoManager.undo = function(dontSelect) {
      const activeId = self.props.state.activeTextFile.id;      
      const $undoStackLength = this.$undoStack[activeId].length;
      const deltaSets = [];
      let space = false;
      let indention = false;
      let interruption = false;
      let run = false;
      for (let i = $undoStackLength - 1; i >= 0; i--) {
        let delta;
        if (!space && !indention && !interruption && !run) {
          delta = this.$undoStack[activeId].pop();
          deltaSets.push(delta);
        } else {
          break;
        }
        if (self.props.state.customizeState.space) {
          if (
            delta[0].deltas[0].action === "insert" &&
            JSON.stringify(delta[0].deltas[0].lines) === JSON.stringify([" "])
          ) {
            space = true;
          }
        }
        if (self.props.state.customizeState.indention) {
          if (
            delta[0].deltas[0].action === "insert" &&
            JSON.stringify(delta[0].deltas[0].lines) ===
              JSON.stringify(["", ""])
          ) {
            indention = true;
          }
        }
        if (self.props.state.customizeState.interruption) {
          if (delta[0].deltas[0].action === "interruption") {
            interruption = true;
          }
        }
        if (self.props.state.customizeState.input) {
          if (delta[0].deltas[0].action === "run") {
            run = true;
          }
        }
      }
      if (deltaSets.length > 0) {
        for (let i = 0; i < deltaSets.length; i++) {
          this.$doc.undoChanges(deltaSets[i], dontSelect);
        }
        this.$redoStack[activeId].push(deltaSets.reverse());
        this.dirtyCounter[activeId]--;
      }
    };
    AceUndoManager.redo = function(dontSelect) {
      const activeId = self.props.state.activeTextFile.id;      
      const deltaSets = this.$redoStack[activeId].pop();
      if (deltaSets) {
        for (let i = 0; i < deltaSets.length; i++) {
          this.$doc.redoChanges(
            this.$deserializeDeltas(deltaSets[i]),
            dontSelect
          );
          this.$undoStack[activeId].push(deltaSets[i]);
        }
        this.dirtyCounter[activeId]++;
      }
    };

    AceUndoManager.init=function(){
      this.$undoStack=[];
      this.$redoStack=[];
      this.dirtyCounter=[];
     }
     AceUndoManager.reset = function() {      
       const activeId = self.props.state.activeTextFile.id;      
       this.$undoStack[activeId] = [];
       this.$redoStack[activeId] = [];
       this.dirtyCounter[activeId] = 0;
     };

    AceUndoManager.hasUndo = function() {
      const activeId = self.props.state.activeTextFile.id;      
      return this.$undoStack[activeId].length > 0;
    };
    AceUndoManager.hasRedo = function() {
      const activeId = self.props.state.activeTextFile.id;      
      return this.$redoStack[activeId].length > 0;
    };
    AceUndoManager.markClean = function() {
      const activeId = self.props.state.activeTextFile.id;      
      this.dirtyCounter[activeId] = 0;
    };
    AceUndoManager.isClean = function() {
      const activeId = self.props.state.activeTextFile.id;      
      return this.dirtyCounter[activeId] === 0;
    };

    this.undoManager = AceUndoManager;
    this.keyboardHandler = this.editor.getKeyboardHandler();
    this.undoManager.init();
    this.undoManager.reset();
    this.keyboardHandler.addCommand({
      name: "undo-event",
      bindKey: { win: "Ctrl+z", mac: "Command+z" },
      exec: () => {
        try {
          this.undoManager.undo();
        } catch (e) {
          console.log(e);
        }
      },
      readOnly: true
    });
    this.keyboardHandler.addCommand({
      name: "redo-event",
      bindKey: { win: "Ctrl+Shift+z", mac: "Command+Shift+z" },
      exec: () => {
        try {
          this.undoManager.redo();
        } catch (e) {
          console.log(e);
        }
      },
      readOnly: true
    });
    this.keyboardHandler.addCommand({
      name: "unbra-event",
      bindKey: { win: "Alt+z", mac: "Option+z" },
      exec: () => {
        try {
          this.undoManager.unbra();
        } catch (e) {
          console.log(e);
        }
      },
      readOnly: true
    });
    this.keyboardHandler.addCommand({
      name: "rebra-event",
      bindKey: { win: "Alt+Shift+z", mac: "Option+Shift+z" },
      exec: () => {
        try {
          this.undoManager.rebra();
        } catch (e) {
          console.log(e);
        }
      },
      readOnly: true
    });
    window.addEventListener("resize", this.handleResize);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }
  handleMouseMove(e) {
    if (this.props.state.renderingObject.length > this.props.num + 1) {
      if (this.props.state.renderingObject[this.props.num + 1].scrolling) {
        const width = this.props.state.renderingObject[this.props.num].width;
        const diff = width - e.nativeEvent.clientX;
        const nextElementWidth = this.props.state.renderingObject[
          this.props.num + 1
        ].width;
        this.props.state.sizeChange(this.props.num, width - diff);
        this.props.state.sizeChange(
          this.props.num + 1,
          nextElementWidth + diff
        );
      }
    }
  }
  handleMouseUp() {
    if (this.props.state.renderingObject.length > this.props.num + 1) {
      this.props.state.scrolling(this.props.num + 1, false);
    }
  }
  render() {
    return (
      <div onMouseMove={this.handleMouseMove} onMouseUp={this.handleMouseUp}>
        <AceEditor
          ref="aceEditor"
          style={this.props.style}
          mode={this.props.state.activeTextFile.type}
          theme="dawn"
          fontSize={23}
          editorProps={{
            $blockScrolling: Infinity
          }}
        />
      </div>
    );
  }
}
