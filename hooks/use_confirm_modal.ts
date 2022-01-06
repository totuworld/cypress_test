import React, { useState } from 'react';
import ConfirmModal, { ConfirmModalProps } from '@/components/common/confirm_modal';

/**
 * 확인 모달에 대한 로직들 담고 있음.
 * 직접 호출하기 보다는 useContext(DialogContext)를 이용하는게 편함
 */
export default function useConfirmModal(): [
  (props: Partial<ConfirmModalProps>) => void,
  React.ReactElement<ConfirmModalProps> | null,
] {
  const [toggleModal, updateToggleModal] = useState(false);
  const [modalProps, setModalProps] = useState<ConfirmModalProps | null>(null);
  const closeModal = () => updateToggleModal(false);
  const doNothing = () => null;
  const openModal = ({
    message,
    onAccept = doNothing,
    onReject = doNothing,
    hideCancel,
    acceptBtnText,
    rejectBtnText,
  }: Partial<ConfirmModalProps>): void => {
    setModalProps({
      message,
      onAccept: () => {
        closeModal();
        onAccept();
      },
      onReject: () => {
        closeModal();
        onReject();
      },
      hideCancel,
      acceptBtnText,
      rejectBtnText,
    });
    updateToggleModal(true);
  };

  // TODO: Partial<ConfirmModalProps>에 대한 개선 필요. 프롭스에 대한 타입이 일관적이지가 않고 잔 코드가 너무 많음.

  return [openModal, toggleModal ? ConfirmModal(modalProps as ConfirmModalProps) : null];
}
