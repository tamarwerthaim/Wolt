import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

/* Find the root HTML element and initialize the React application here */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* StrictMode helps catch common bugs and warnings during development */}
    <App />
  </React.StrictMode>,
)