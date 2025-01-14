import React from 'react';
import ReactDOM from 'react-dom/client'; // React 18+ 使用 react-dom/client
import './style.css'; // 全局样式
import App from './App'; // 主组件

// 获取 HTML 中的根节点
const root = ReactDOM.createRoot(document.getElementById('root'));

// 渲染 React 应用到根节点
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);