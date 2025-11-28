import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SiteConfigProvider } from './contexts/SiteConfigContext';
import { OrderProvider } from './contexts/OrderContext';
import { MetricsProvider } from './contexts/MetricsContext';
import { CurrencyProvider } from './contexts/CurrencyContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <SiteConfigProvider>
        <ThemeProvider>
          <ProductProvider>
            <OrderProvider>
              <MetricsProvider>
                <CurrencyProvider>
                  <App />
                </CurrencyProvider>
              </MetricsProvider>
            </OrderProvider>
          </ProductProvider>
        </ThemeProvider>
      </SiteConfigProvider>
    </AuthProvider>
  </React.StrictMode>
);