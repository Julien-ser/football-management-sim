import { mount } from 'cypress/react';
import App from '../src/App';

export { mount };

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  return true;
});
