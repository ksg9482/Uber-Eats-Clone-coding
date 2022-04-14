import React from 'react';
import ReactDOM, {createRoot} from 'react-dom/client';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql
} from "@apollo/client";
import {App} from './components/app';
import reportWebVitals from './reportWebVitals';
import "./styles/styles.css"
import { client } from './apollo';
import { HelmetProvider } from 'react-helmet-async'
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ApolloProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
