import React from 'react';
import Screenshot from '../components/Screenshot';

export const Job = ({screen, base, host, action}) => {
    const handleMakeAsBase = () => {
        action({
            source: screen.source,
            action: 'new base'
        });
    }

    const handleMarkAsFailed = () => {
        action({
            source: screen.source,
            action: 'failed'
        });
    }

    const deriveActions = (screen) => {
        if (screen.acted) {
            return (
                <div className="acted">Marked as {screen.acted.as} by {screen.acted.by} on {new Intl.DateTimeFormat('en-GB', {
                    dateStyle: 'long',
                    timeStyle: 'medium'
                }).format(new Date(screen.acted.when))}.</div>
            );
        }

        return (
            <div className="job-row-actions">
                <button className="action-button" onClick={handleMakeAsBase}>Make As New Base</button>
                <button className="action-button" onClick={handleMarkAsFailed}>Mark As Failed</button>
            </div>
        );
    };

    return (
        <div className="job-row" key={screen.source}>
            <div className="job-row-header">
                <span className="screen">{screen.source}</span>
                <span className="percentage">{(screen.diff.percentage * 100).toFixed(2)}%</span>
            </div>
            <Screenshot image={`${base}/${screen.source}`} label="Base"/>
            <Screenshot image={`${host}/${screen.source}`} label="Test" />
            <Screenshot image={`${host}/${screen.source.replace('.png', '_diff.png')}`} label="Difference"/>
            {deriveActions(screen)}
        </div>
    );
}
