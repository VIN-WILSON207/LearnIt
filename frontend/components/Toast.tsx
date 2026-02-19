'use client';

import React, { useEffect } from 'react';
import styles from './Toast.module.css';
import { FiCheck, FiX, FiAlertCircle, FiInfo } from 'react-icons/fi';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 3000, onClose }) => {
    useEffect(() => {
        if (duration <= 0) {
            return;
        }
        const timer = setTimeout(() => onClose(id), duration);
        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const icons = {
        success: <FiCheck />,
        error: <FiX />,
        warning: <FiAlertCircle />,
        info: <FiInfo />,
    };

    return (
        <div className={`${styles.toast} ${styles[type]}`}>
            <span className={styles.icon}>{icons[type]}</span>
            <span className={styles.message}>{message}</span>
            <button className={styles.closeBtn} onClick={() => onClose(id)}>
                ✕
            </button>
        </div>
    );
};

export default Toast;
