import React from 'react';
import styles from './toast.module.scss';

const DEFAULT_TOAST_TEXT = '토스트가 한줄로 노출되는 최대';

interface Props {
  text?: string;
  isVisible?: boolean;
  onClick?: () => void;
}

const Toast: React.FC<Props> = ({ text = DEFAULT_TOAST_TEXT, isVisible = false, onClick }) => (
  <div className={styles.toast_root}>
    {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events*/}
    <div
      className={`${styles.toast} ${isVisible ? styles.visible : ''}`}
      onClick={() => {
        if (onClick) onClick();
      }}
    >
      <span className={styles.toast_text}>{text}</span>
    </div>
  </div>
);

export default Toast;
