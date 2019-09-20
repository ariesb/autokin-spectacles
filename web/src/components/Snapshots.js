import React from 'react';

export const Snapshots = ({screens, host}) => {
    
    return (
        <div className="snapshots">
            {screens.map(screen => {
                let status = ((screen.diff != null && screen.diff.diff !== 0) ? ( screen.acted ? (screen.acted.as.replace(' ', '')) : 'pending') : 'passed');
                return (
                    <a href={`${host}/${screen.source}`} target="_new" key={screen.source}>
                        <img className={`snap-image ${status}`} src={`${host}/${screen.source}`} alt={`${host}/${screen.source}`} />
                    </a>
                );
            })}            
        </div>
    );
}
