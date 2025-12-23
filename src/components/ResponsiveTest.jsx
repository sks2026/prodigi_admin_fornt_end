import React, { useState, useEffect } from 'react';

const ResponsiveTest = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDeviceType = () => {
    const width = screenSize.width;
    if (width < 480) return 'Mobile (Small)';
    if (width < 768) return 'Mobile';
    if (width < 1024) return 'Tablet';
    return 'Desktop';
  };

  const getBreakpoint = () => {
    const width = screenSize.width;
    if (width < 480) return '< 480px';
    if (width < 640) return '480px - 640px';
    if (width < 768) return '640px - 768px';
    if (width < 1024) return '768px - 1024px';
    if (width < 1280) return '1024px - 1280px';
    return '> 1280px';
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '16px',
      borderRadius: '12px',
      zIndex: 9999,
      fontSize: '14px',
      fontFamily: 'monospace',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      minWidth: '200px',
    }}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '16px' }}>
        📱 Screen Info
      </div>
      <div style={{ marginBottom: '4px' }}>
        <strong>Device:</strong> {getDeviceType()}
      </div>
      <div style={{ marginBottom: '4px' }}>
        <strong>Width:</strong> {screenSize.width}px
      </div>
      <div style={{ marginBottom: '4px' }}>
        <strong>Height:</strong> {screenSize.height}px
      </div>
      <div style={{ marginBottom: '4px' }}>
        <strong>Breakpoint:</strong> {getBreakpoint()}
      </div>
      <div style={{ 
        marginTop: '12px', 
        paddingTop: '8px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.3)',
        fontSize: '11px',
        opacity: 0.8
      }}>
        Resize to test responsiveness
      </div>
    </div>
  );
};

export default ResponsiveTest;
