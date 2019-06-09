import React from 'react';
import { BrowserRouter as Router, Switch,  Route } from "react-router-dom";

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css' 

import Main from './pages/Main'
import Post from './pages/Post'
import Auth from './pages/Auth'

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Main} />
        <Route exact path="/login" component={Main} />
        <Route exact path="/signUp" component={Auth} />
        <Route exact path="/post/:id" component={Post} />
        <Route exact path="/reply" component={Main} />
      </Switch>
    </Router>
  );
}

export default App;
