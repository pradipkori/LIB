import React, { useEffect } from 'react';
import { useStore } from '../store';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useStore(state => state);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 4000); // Auto remove after 4 seconds
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: <CheckCircle size={20} className="toast-icon success" />,
    error: <AlertCircle size={20} className="toast-icon error" />,
    info: <Info size={20} className="toast-icon info" />
  };

  return (
    <div className={`toast-item toast-${toast.type}`}>
      <div className="toast-content">
        {icons[toast.type] || icons.info}
        <span className="toast-message">{toast.message}</span>
      </div>
      <button onClick={onRemove} className="toast-close">
        <X size={16} />
      </button>
    </div>
  );
}
