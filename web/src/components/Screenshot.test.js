import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import Screenshot from './Screenshot';

it('renders without crashing', () => {
    shallow(<Screenshot />);
});

it('renders Screenshot component', () => {
    const wrapper = shallow(<Screenshot />);
    expect(wrapper.find('.display-image')).to.have.lengthOf(1);
    expect(wrapper.find('.display-image img')).to.have.lengthOf(1);
    expect(wrapper.find('.display-image label')).to.have.lengthOf(1);
});