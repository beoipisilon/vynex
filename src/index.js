import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import axios from 'axios';

const root = ReactDOM.createRoot(document.getElementById('root'));

const baseURL = process.env.REACT_APP_YT_URL || '/api/youtube';
axios.defaults.baseURL = baseURL;

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
