import React from 'react';

export default ({ size, base, host, image, label, extra, actions }) => {
    let content = label ? <div className="content"><div className="extra-label">{extra}</div><div className="label">{label}</div></div> : actions;
    let imageData = size ? <div className="emptyImage">Image dimension does not match.</div>
        : <img src={`${host}/${image}`} alt={`${image}`} />;
    return (
        <div className="screen-card">
            <div className="image">
               {imageData}
            </div>
            {content}
        </div> 
    );
}