import 'tailwindcss/tailwind.css';
import '../styles/input.css';
import { AppProps } from 'next/app';

import { AuthUserProvider } from '@/context/auth_user.context';
import { DialogContextProvider } from '@/components/common/dialog_context';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <AuthUserProvider>
      <DialogContextProvider>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...pageProps} />
      </DialogContextProvider>
    </AuthUserProvider>
  );
}

export default MyApp;
