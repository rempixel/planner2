import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './index.scss';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.querySelector('#root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
