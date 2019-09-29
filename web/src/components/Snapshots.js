import React from 'react';
import { HashLink as Link } from 'react-router-hash-link';

export const Snapshots = ({screens, host}) => {
    
    return (
        <div className="snapshots">
            {screens.map(screen => {
                let status = screen.diff === null ? 'new base'
                    : (((screen.diff != null && screen.diff.diff !== 0) ? 
                    ( screen.acted ? screen.acted.as : 'pending') : 'passed'));
                let bgImage = `url(${host}/${screen.source})`;
                let imageName = screen.source.replace('.png', '').replace(/-/g,' ');
                let avatar = screen.acted ? <img className="avatar float-right" src={screen.acted.user.avatarUrl || ''} alt="" /> : '';
                let statusDesc = status === 'pending' ? <Link className="statusName" to={`#${screen.source.replace('.png', '')}`}><span >{status}</span></Link> : <span className="statusName">{status}</span>;
                
                return (
                    <div className="snap-card">
                        <div className="loader" style={{ zIndex: 0, top: '35%' }} />    
                        <div className="image" style={{backgroundImage: bgImage }}>                           
                        </div>
                        <div className="content">
                            <div>{imageName}</div>
                        </div>
                        <div className={`content status ${status.replace(' ', '')}`}>
                            {avatar}
                            {statusDesc}
                        </div>
                    </div>        
                );
            })}            
        </div>
    );
}

