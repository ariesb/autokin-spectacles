import React, {useState, useEffect} from 'react';
import Screenshot from '../components/Screenshot';
import Moment from 'react-moment';
import ScreenSplitter from '../components/ScreenSplitter';

export const Job = ({screen, base, host, action, view}) => {
    const [screenView, setScreenView] = useState(0);
    
    const handleMakeAsBase = () => {
        action({
            source: screen.source,
            action: 'new base'
        });
        setScreenView(0);
    };

    const handleMarkAsFailed = () => {
        action({
            source: screen.source,
            action: 'failed'
        });
        setScreenView(0);
    };

    const toggleView = () => {
        if (!screen.acted) {
            setScreenView(screenView === 0 ? 1 : 0);
        }
    };

    const deriveActions = (screen) => {
        if (screen.acted) {
            return (
                <div className={`content ${screen.acted.as.replace(' ', '')}`}>
                    <div className="extra-status">
                        <img className="avatar float-right" src={screen.acted.user.avatarUrl || ''} alt="" />
                        <div className="details">
                            <div className="display-name">{screen.acted.user.displayName || screen.acted.by}</div>
                            <Moment className="display-time" fromNow>{screen.acted.when}</Moment>
                        </div>
                    </div>
                    <div className="label-status">Marked as {screen.acted.as}</div>
                </div>
            );
        }

        return (
            <div className="content">
                <div className="act-buttons">
                    <div className="makenew act-button" onClick={handleMakeAsBase}>Accept as New Base</div>
                    <div className="failit act-button" onClick={handleMarkAsFailed}>Marked as Failed</div>
                </div>
            </div>
        );
    };

    let diffImage = screen.diff.size ? 
        <Screenshot size={true}
            label="Different Image Dimension" extra={`Δ ${(screen.diff.percentage * 100).toFixed(2)}%`} />
        : <Screenshot host={host} image={screen.source.replace('.png', '_diff.png')}
            label="Difference / Merged" extra={`Δ ${screen.diff.percentage.toFixed(2)}%`} />;
    
    let screenViewMarkup  = screenView === 0 
        ? <div className="screenshots">
            <Screenshot host={base} image={screen.source} label="Base Image" />
            <Screenshot base={base} host={host} image={screen.source} actions={deriveActions(screen)} clicker={screen.acted ? null : toggleView} />
            {diffImage}
        </div>
        : <div className="split-images">
            <div className="screen-compare">
                <div className="act-buttons">
                    <div className="toggle act-button" onClick={toggleView}>Toggle View</div>
                    <div className="makenew act-button" onClick={handleMakeAsBase}>Accept as New Base</div>
                    <div className="failit act-button" onClick={handleMarkAsFailed}>Marked as Failed</div>
                </div>
            </div>
            <ScreenSplitter base={base} host={host} image={screen.source} />
          </div>;

    return (
        <div className="job-row" key={screen.source} id={screen.source.replace('.png', '')}>
            <div className="job-row-header">
                <span className="screen">{screen.source.replace('.png', '').replace(/-/g,' ')}</span>
            </div>
            <div className="screenshots-comparisons">
                {screenViewMarkup}
            </div>
        </div>
    );
}   
