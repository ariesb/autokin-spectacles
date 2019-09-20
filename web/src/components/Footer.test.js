import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import Footer from './Footer';

it('renders without crashing', () => {
    shallow(<Footer />);
});

it('renders Footer component', () => {
    const wrapper = shallow(<Footer />);
    expect(wrapper.find('.app-footer')).to.have.lengthOf(1);
    expect(wrapper.find('.footer-link')).to.have.lengthOf(1);
});