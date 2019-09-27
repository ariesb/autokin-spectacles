import React, { useState, useRef, useEffect } from 'react';

export default (props) => {
    const [sliderStyle, setSliderStyle] = useState({});
    const [overlayStyle, setOverlayStyle] = useState({});
    const [containerStyle, setContainerStyle] = useState({});


    const sliderRef = useRef();
    const overlayRef = useRef();
    const baseRef = useRef();

    useEffect(() => {
        window.addEventListener("mousemove", handleSliderMove);
        window.addEventListener("touchmove", handleSliderMove);

        let centerX = (overlayRef.current.getBoundingClientRect().width / 2);
        setOverlayStyle({ width: centerX + 'px' });
        setSliderStyle({
            left: centerX - (sliderRef.current.offsetWidth / 2) + 'px',
            top: '20px'
        });
        setContainerStyle({
            height: overlayRef.current.getBoundingClientRect().height + 'px'
        });

        return () => {
            window.removeEventListener("mousemove", handleSliderMove);
            window.removeEventListener("touchmove", handleSliderMove);
        }
    }, []);

    const sliderPosition = (event) => {
        event = event || window.event;
        let rect = overlayRef.current.getBoundingClientRect();
        let x = (event.pageX - rect.left) - window.pageXOffset;
        let y = (event.pageY - rect.top) - window.pageYOffset;
        return { x, y };
    };

    const handleSliderMove = (event) => {
        let pos = sliderPosition(event)
        if (pos.x < 0) pos.x = 0;

        let rect = baseRef.current.getBoundingClientRect();
        if (pos.x > rect.width) pos.x = ((rect.x + rect.width) - rect.left);
        if (pos.y < 0) pos.y = 0;
        if (pos.y > rect.height) pos.y = rect.height;
        moveSplit(pos);
    };

    const moveSplit = (pos) => {
        setOverlayStyle({ width: pos.x + 'px' });
        setSliderStyle({
            left: pos.x - (sliderRef.current.offsetWidth / 2) + 'px',
            top: pos.y - (sliderRef.current.offsetHeight / 2) + 'px'
        });
    };

    const { base, host, image } = props;
    return (
        <div className="splitter-container" style={containerStyle}>
            <div className="splitter-image" ref={baseRef}>
                <img src={`${host}/${image}`} width="auto" height="auto"/>
            </div>
            <div ref={sliderRef}
                className="splitter-slider marker-ripple"
                style={sliderStyle}
            ></div>
            <div className="splitter-image splitter-overlay" ref={overlayRef} style={overlayStyle}>
                <img src={`${base}/${image}`} width="auto" height="auto" />
            </div>
        </div>
    );
}