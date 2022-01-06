import React from 'react';
import { DialogContext } from '@/components/common/dialog_context';

export const useDialog = () => React.useContext(DialogContext);

export default useDialog;
