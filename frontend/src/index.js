import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Auth0Provider } from '@auth0/auth0-react';

const root = ReactDOM.createRoot(document.getElementById('root'));

const domain = "dev-swmpt647q7ufjna7.us.auth0.com";
const clientId = "EOUHHW8ogpwiL8lB3DjqmEqsFRLVLCvz";

// Optional: add audience if you want to request access tokens for your API
// const audience = "YOUR_API_IDENTIFIER";

const onRedirectCallback = (appState) => {
  window.history.replaceState(
    {},
    document.title,
    appState?.returnTo || window.location.pathname
  );
};

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        // audience // uncomment and set if you have an API to secure
      }}
      onRedirectCallback={onRedirectCallback}
      // optional: cacheLocation="localstorage" // enables persistence across tabs or refreshes
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);

reportWebVitals();
