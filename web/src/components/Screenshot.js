import React from 'react';

export default ({ size, base, host, image, label, extra, actions, clicker }) => {
    let content = label ? <div className="content"><div className="extra-label">{extra}</div><div className="label">{label}</div></div> : actions;
    let imageData = size ? <div className="emptyImage">Image dimension does not match.</div>
        : <img className={clicker ? 'inspector' : ''} src={`${host}/${image}`} alt={`${image}`}/>;
    return (
        <div className="screen-card">
            <div className="loader" style={{ zIndex: 0, top: '40%' }} />
            <div className="image" onClick={clicker}>
               {imageData}               
            </div>
            {content}
        </div> 
    );
}