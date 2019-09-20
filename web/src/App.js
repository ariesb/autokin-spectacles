import React from 'react';
import './App.css';
import { Provider } from 'react-redux';
import AppWrapper from './routes/AppWrapper';
import configureStore from './configureStore';
import { CookiesProvider, withCookies } from 'react-cookie';


const store = configureStore();

function App({cookies}) {
  return (
    <CookiesProvider>
      <Provider store={store}>
        <AppWrapper cookies={cookies}/>
      </Provider>
    </CookiesProvider>
  );
}

export default withCookies(App);
