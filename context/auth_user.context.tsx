import { createContext, useContext } from 'react';
import useFirebaseAuth, { InAuthUser } from '../hooks/use_firebase_auth';

interface InAuthUserContext {
  authUser: InAuthUser | null;
  loading: boolean;
  signInWithGoogle: () => void;
  signOut: () => void;
}

const AuthUserContext = createContext<InAuthUserContext>({
  authUser: null,
  loading: true,
  signInWithGoogle: async () => ({ user: null, credential: null }),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  signOut: () => {},
});

export function AuthUserProvider({ children }: { children: React.ReactNode }) {
  const auth = useFirebaseAuth();
  return <AuthUserContext.Provider value={auth}>{children}</AuthUserContext.Provider>;
}
// custom hook to use the authUserContext and access authUser and loading
export const useAuth = () => useContext(AuthUserContext);
