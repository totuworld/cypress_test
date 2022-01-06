import firebase from 'firebase/app';
import { useState, useEffect } from 'react';
import FirebaseAuthClient from '../models/commons/firebase_auth_client.model';
import { memberAdd, memberFind } from '../models/members/members.client.service';
import { InMemberInfo } from '../models/members/in_member_info';

export interface InAuthUser {
  uid: string;
  email: string | null;
  photoURL: string | null;
}

function formatAuthUser(user: firebase.User): InAuthUser {
  return {
    uid: user.uid,
    email: user.email,
    photoURL: user.photoURL,
  };
}

export default function useFirebaseAuth() {
  const [authUser, setAuthUser] = useState<InAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const authStateChanged = async (authState: firebase.User | null) => {
    if (!authState) {
      setAuthUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const formattedUser = formatAuthUser(authState);
    setAuthUser(formattedUser);
    setLoading(false);
  };

  const clear = () => {
    setAuthUser(null);
    setLoading(true);
  };

  async function signInWithGoogle(): Promise<void> {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const signInResult = await FirebaseAuthClient.getInstance().Auth.signInWithPopup(provider);

      if (signInResult.user) {
        const idToken = await signInResult.user.getIdToken();
        const findResp = await memberFind({ member_id: signInResult.user.uid, isServer: false });

        if (!(findResp.status === 200 && findResp.payload && findResp.payload.uid === signInResult.user.uid)) {
          const { uid, displayName, email, photoURL } = signInResult.user;
          const data: InMemberInfo = {
            uid,
            displayName: displayName || undefined,
            email: email || undefined,
            photoURL: photoURL || undefined,
          };
          await memberAdd({
            data,
            token: idToken,
            isServer: false,
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  const signOut = () => FirebaseAuthClient.getInstance().Auth.signOut().then(clear);

  useEffect(() => {
    console.log('useEffect');
    // listen for Firebase state change
    const unsubscribe = FirebaseAuthClient.getInstance().Auth.onAuthStateChanged(authStateChanged);

    // unsubscribe to the listener when unmounting
    return () => unsubscribe();
  }, []);

  return {
    authUser,
    loading,
    signInWithGoogle,
    signOut,
  };
}
