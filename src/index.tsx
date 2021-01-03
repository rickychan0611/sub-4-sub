import React from 'react';
import { render } from 'react-dom';
import App from './App';
import './App.global.css';
import removeViews from './removeViews';

removeViews();
render(<App />, document.getElementById('root'));
