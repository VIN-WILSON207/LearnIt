import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  className,
  ...props
}) => {
  const variantClass = styles[variant];
  const sizeClass = styles[size];
  
  return (
    <button
      className={`${styles.button} ${variantClass} ${sizeClass} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};
