import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Provider } from 'react-redux';
import { SocketProvider } from './context/SocketContext'
import App from './App.jsx';
import store from './store/store';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <SocketProvider>

    <App />
    </SocketProvider>
  </Provider>
);
