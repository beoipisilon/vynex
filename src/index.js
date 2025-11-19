import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import axios from 'axios';

const root = ReactDOM.createRoot(document.getElementById('root'));
if (process.env.REACT_APP_YT_URL) {
  axios.defaults.baseURL = process.env.REACT_APP_YT_URL;
}
if (process.env.REACT_APP_YT_API) {
  axios.defaults.headers.common['Authorization'] = process.env.REACT_APP_YT_API;
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
