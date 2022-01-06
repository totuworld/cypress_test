import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import { useAuth } from '../context/auth_user.context';

interface Props {
  title?: string;
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ title, children }) => {
  const printTitle = title ?? '커피 브레이크';
  const { loading, authUser, signInWithGoogle, signOut } = useAuth();
  return (
    <div>
      <Head>
        <title>{printTitle}</title>
        <link rel="shortcut icon" href="/static/favicon.ico" />
      </Head>
      <div className="mx-auto max-w-xl flex-1 flex flex-col mb-4">
        <nav className="px-4 flex justify-between bg-white h-16 border-b-2">
          <ul className="flex items-center space-x-2">
            <li>
              <Link href="/events/create">주문서 만들기</Link>
            </li>
          </ul>
          <ul className="flex items-center space-x-2">
            <li className="text-2xl">
              <Link href="/events">☕</Link>
            </li>
          </ul>
          <ul className="flex items-center space-x-2">
            {!loading && authUser && (
              <li className="w-14">
                <button type="button" onClick={signOut}>
                  로그아웃
                </button>
              </li>
            )}
            <li className="w-14">
              {(loading || authUser === null) && (
                <button type="button" onClick={signInWithGoogle}>
                  로그인
                </button>
              )}
              {!loading && authUser !== null && (
                <img className="p-1 h-full w-full rounded-full mx-auto" src={authUser.photoURL ?? ''} alt="profile" />
              )}
            </li>
          </ul>
        </nav>
      </div>
      {children}
    </div>
  );
};

export default Layout;
