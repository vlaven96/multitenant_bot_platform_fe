import React from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
}

const Notification: React.FC<NotificationProps> = ({ message, type, visible }) => {
  if (!visible) return null;

  return (
    <div className={`notification ${type}`}>
      {message}
    </div>
  );
};

export default Notification; 