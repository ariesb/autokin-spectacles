import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import ControlCenter from './ControlCenter';

it('renders without crashing', () => {
    shallow(<ControlCenter />);
});

it('renders header component', () => {
    const wrapper = shallow(<ControlCenter />);
    expect(wrapper.find('.control-center')).to.have.lengthOf(1);
});