import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  children,
  className,
  ...props
}) => {
  const variantClass = styles[variant];
  const sizeClass = styles[size];
  const fullWidthClass = fullWidth ? styles.fullWidth : '';

  return (
    <button
      className={`${styles.button} ${variantClass} ${sizeClass} ${fullWidthClass} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

