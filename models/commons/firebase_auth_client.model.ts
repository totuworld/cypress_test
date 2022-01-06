import firebase from 'firebase/app';
import 'firebase/auth';

import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

const FirebaseCredentials = {
  apiKey: publicRuntimeConfig.publicApiKey,
  authDomain: publicRuntimeConfig.authDomain,
  projectId: publicRuntimeConfig.projectId,
};

export default class FirebaseAuthClient {
  public static instance: FirebaseAuthClient;

  private auth: firebase.auth.Auth;

  public constructor() {
    if (!!firebase.apps.length === false) {
      console.log('firebase initializeApp');
      firebase.initializeApp(FirebaseCredentials);
    }
    this.auth = firebase.auth();
    console.log('firebase auth client constructor');
  }

  public static getInstance(): FirebaseAuthClient {
    if (!FirebaseAuthClient.instance) {
      FirebaseAuthClient.instance = new FirebaseAuthClient();
    }
    return FirebaseAuthClient.instance;
  }

  public get Auth(): firebase.auth.Auth {
    return this.auth;
  }
}
