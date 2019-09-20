import React from 'react';
import Profile from './Profile';

export default (props) => {
    return (
        <div className="control-center">
            <div className="spectacles-head"><div className="spectacles-org"></div></div>
            <Profile />
        </div>
    );
}