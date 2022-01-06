import React, { PropsWithChildren } from 'react';
import useConfirmModal from '@/hooks/use_confirm_modal';
import { ConfirmModalProps } from '@/components/common/confirm_modal';
import useToast from '@/hooks/use_toast';

interface DialogContextProps {
  showToast: (toastMsg?: string, duration?: number) => void;
  openConfirmModal: (props: Partial<ConfirmModalProps>) => void;
}

const doNothing = () => null;

/**
 * 토스트, 확인모달 등의 인터렉션을 위한 컴포넌트들은 각 페이지 마다 하나씩 있기 보다는
 * DOM 최상단에만 마운트하는 것이 바람직할 것 같다.
 * const {showToast, openConfirmModal} = useDialog() 로 사용 가능!
 */

export const DialogContext = React.createContext<DialogContextProps>({
  showToast: doNothing,
  openConfirmModal: doNothing,
});

export const DialogContextProvider: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
  const [showToast, Toast] = useToast();
  const [openConfirmModal, ConfirmModal] = useConfirmModal();
  return (
    <DialogContext.Provider value={{ showToast, openConfirmModal }}>
      {Toast}
      {ConfirmModal}
      {children}
    </DialogContext.Provider>
  );
};

export default {};
