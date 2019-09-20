import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import configureStore from 'redux-mock-store'
import Profile from './Profile'; 
import { Provider } from 'react-redux';
import { BrowserRouter as Router, NavLink } from 'react-router-dom';

const mockStore = configureStore();
let store, wrapper;

beforeEach(() => {
    const session = {
        data: {
            displayName: 'Autokin Spectacles',
            avatarUrl: 'http://',
            username: 'spectacles'
        }
    }
    const initialState = { session }
    store = mockStore(initialState);
    wrapper = mount(<Provider store={store}><Router><Profile /></Router></Provider>);
})

it('renders Profile component', () => {
    expect(wrapper.find('.profile-head')).to.have.lengthOf(1);
    expect(wrapper.find(NavLink)).to.have.lengthOf(1);
});