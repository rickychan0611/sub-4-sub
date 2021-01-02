import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { remote } from 'electron'
// import ElectronBrowserView from './ElectronBrowserView'
import BrowserView from 'react-electron-browser-view';

// const win = remote.getCurrentWindow()
// console.log(win)
// const options = {
//   // webPreferences: this.props.webpreferences || {}
// }

// let view = new remote.BrowserView(options)
//     win.addBrowserView(view)
//     view.setBounds({ x: 0, y: 0, width: 300, height: 300 })
//     view.setAutoResize({
//       horizontal: true,
//       vertical: true
//     })
let view;

const Hello = () => {
  return (
    <div style={{minHeight: 600, width: 400, padding: 30, paddingRight: 60, marginBottom: 20}}>
      <BrowserView
        // src={urlToPlay}
        src={"https://www.google.com"}
        className="browser"
        // preload={preload}
        // Keep instance reference so we can execute methods
        ref={(viewRef) => {
          view = viewRef
        }}
        devtools={false}
        onDidAttach={() => {
          // setAttached(true)
          console.log("BrowserView attached");
        }}
        onUpdateTargetUrl={() => {
          // console.log("Updating url");
          // setAttached(false)
        }}
        onDidFinishLoad={() => {
          // setAttached(true)
          // console.log("Updated url");
        }}
        style={{
          height: 600,
          width: 400,
        }}
        disablewebsecurity={true}
      />
      hello
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Hello} />
      </Switch>
    </Router>
  );
}
