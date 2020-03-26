import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter, Route } from 'react-router-dom'
import { createBrowserHistory } from "history"
import AutorBox from './Autor';
import Home from './Home';
import LivroAdmin from './Livro';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  (
    <BrowserRouter history={createBrowserHistory}>
      <div>
        <App>
          <Route exact path="/" component={ Home }/>
          <Route path="/autor" component={AutorBox} />
          <Route path="/livro" component={ LivroAdmin }/>
        </App>
      </div>
    </BrowserRouter> 
  ),
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();