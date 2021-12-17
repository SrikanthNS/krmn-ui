import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import store from './store';
import { HashRouter } from "react-router-dom";


ReactDOM.render(
  <Provider store={store}>
    <HashRouter basename="/#">
      <App />
    </HashRouter>
  </Provider>,
  document.getElementById('root')
);