import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
  index?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 1500, index = 0 }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for exit animation to complete
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#27AE60';
      case 'error':
        return '#E74C3C';
      case 'warning':
        return '#F39C12';
      case 'info':
        return '#3498DB';
      default:
        return '#2C3E50';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: getBackgroundColor(),
        color: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '320px',
        maxWidth: '420px',
        transform: isLeaving ? 'translateX(100%) scale(0.95)' : 'translateX(0) scale(1)',
        opacity: isLeaving ? 0 : 1,
        transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
        animation: !isLeaving ? 'slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
        pointerEvents: 'auto',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span style={{ fontSize: '1.5rem' }}>{getIcon()}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '1.2rem',
          padding: '0',
          opacity: 0.8,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
      >
        ✕
      </button>
      <style>
        {`
          @keyframes slideIn {
            0% {
              transform: translateX(100%) scale(0.9);
              opacity: 0;
            }
            70% {
              transform: translateX(-8px) scale(1.02);
              opacity: 0.8;
            }
            100% {
              transform: translateX(0) scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Toast;