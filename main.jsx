import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// index.htmlにある "root" という場所に、App.jsxの内容を映し出します
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
