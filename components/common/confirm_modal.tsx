import { ReactNode } from 'react';
import styles from './confirm_modal.module.scss';

export interface ConfirmModalProps {
  /** 컨텐츠 영역에 출력할 메시지 */
  message?: string | ReactNode;
  /** 확인 버튼 텍스트, 기본값 네 */
  acceptBtnText?: string;
  /** 취소 버튼 텍스트, 기본값 아니오 */
  rejectBtnText?: string;
  /** 확인 버튼 클릭 시 동작할 함수 */
  onAccept: () => void;
  /** 취소 버튼 클릭 시 동작할 함수 */
  onReject: () => void;
  /** 취소 버튼 숨기기 옵션 */
  hideCancel?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  message = '',
  acceptBtnText = '네',
  rejectBtnText = '아니오',
  onAccept,
  onReject,
  hideCancel = false,
}) => {
  const body =
    typeof message === 'string' ? (
      <div className={styles.modalCardBody}>
        <p className={styles.modalCardContents}>{message}</p>
      </div>
    ) : (
      message
    );
  return (
    <div className={styles.modalRoot}>
      <div className={styles.modalContentWrap}>
        <div className={styles.modalInside}>
          <div className={styles.modalCard}>
            {body}
            <div className={styles.modalCardButtons}>
              {hideCancel === true ? null : (
                <button
                  type="button"
                  tabIndex={0}
                  onClick={() => {
                    onReject();
                  }}
                >
                  {rejectBtnText}
                </button>
              )}
              <button
                type="button"
                tabIndex={0}
                onClick={() => {
                  onAccept();
                }}
                style={{ fontWeight: 'bold' }}
              >
                {acceptBtnText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
