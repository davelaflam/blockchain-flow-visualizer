import React from 'react';

import { CustomControlButtonProps } from '../types';

/**
 * Custom control button for zoom controls
 */
const CustomControlButton: React.FC<CustomControlButtonProps> = ({ onClick, title, children }) => {
  return (
    <div
      onClick={onClick}
      onKeyDown={e => {
        // Handle keyboard events (Enter and Space)
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      title={title}
      style={{
        width: 28,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        backgroundColor: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '4px',
        margin: '2px 0',
        cursor: 'pointer',
      }}
    >
      {children}
    </div>
  );
};

export default CustomControlButton;
