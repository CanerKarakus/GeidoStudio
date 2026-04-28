import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Button.module.scss';
import clsx from 'clsx';
import { ArrowUpRight } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', // primary, outline, iconOnly
  to, 
  href,
  className,
  icon = true,
  onClick,
  type = 'button',
  ...props
}) => {
  const btnClass = clsx(
    styles.button,
    styles[variant],
    className
  );

  const content = (
    <>
      {children && <span className={styles.text}>{children}</span>}
      {icon && (
        <span className={styles.iconWrapper}>
          <ArrowUpRight size={18} strokeWidth={2.5} />
        </span>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={btnClass} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={btnClass} target="_blank" rel="noopener noreferrer" {...props}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={btnClass} onClick={onClick} {...props}>
      {content}
    </button>
  );
};

export default Button;
