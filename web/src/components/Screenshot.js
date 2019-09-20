import React from 'react';

export default ({image, label}) => {
    return (
        <div className="display-image">
            <img src={`${image}`} alt={`${image}`}/>
            <label>{label}</label>
        </div>
    );
}