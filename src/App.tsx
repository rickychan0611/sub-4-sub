import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { remote } from 'electron'
import ContextProvider from "./context/Context"
import Home from "./pages/Home";
import View from "./pages/View";
import Register from "./pages/Register";
import Activate from "./pages/Activate";
import Edit from "./pages/Edit";


export default function App() {
  return (
    <Router>
      <ContextProvider>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/home" component={Home} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/view" component={View} />
        <Route exact path="/activate" component={Activate} />
        <Route exact path="/edit" component={Edit} />
      </Switch>
      </ContextProvider>
    </Router>
  );
}
