import { useRef, useState } from 'react';
import Toast from '@/components/common/toast';

/**
 *  Toast에 관련된 로직(점점 흐려지기 보여지기)들을 담당
 *  직접 호출하기 보다는 useContext(DialogContext)를 이용하는게 편함
 */
export const useToast = (): [(text?: string, duration?: number) => void, React.ReactElement | null] => {
  const [toggleToast, updateToggleToast] = useState<boolean>(false);
  const [isVisible, setVisible] = useState<boolean>(false);
  const [text, setText] = useState<string>('');
  const callbackRef = useRef<ReturnType<typeof setTimeout> | null>(null); // setTimeout으로 추후 실행될 콜백을 Ref로 저장해둔다. (보통 흐리게 할 때 사용)

  const hideToast = () => {
    // 점점 흐려지게 하기
    setVisible(false);
    callbackRef.current = setTimeout(() => {
      updateToggleToast(false);
      // DOM에서 컴포넌트 안보이게 하기
    }, 500);
  };

  const showToast = (toastText?: string, duration = 5000) => {
    setText(toastText ?? '');
    updateToggleToast(true);

    setTimeout(() => setVisible(true), 0);
    if (callbackRef.current) {
      // 아직 토스트가 사라지지 않은 상태에서 showToast를 실행시킬 때, 기존의 예정된 타이머를 취소시킨다.
      clearTimeout(callbackRef.current);
    }
    callbackRef.current = setTimeout(() => {
      hideToast();
    }, duration);
  };

  return [showToast, toggleToast ? Toast({ text, isVisible, onClick: () => hideToast() }) : null];
};

export default useToast;
