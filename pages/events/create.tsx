/* eslint-disable jsx-a11y/label-has-associated-control,jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events */
import { GetServerSideProps, NextPage } from 'next';
import { useState, useEffect } from 'react';

import Layout from '@/components/Layout';
import FirebaseAuthClient from '@/models/commons/firebase_auth_client.model';
import { getFormatDate, gethhmmss, getYYYYMMDD } from '@/utils/time_helper';
import useDialog from '@/hooks/use_dialog';
import EventClientModel from '@/models/event.client.model';
import { IAddEventReq } from '@/controllers/event/interface/IAddEventReq';
import { IBeverage } from '@/models/interface/IEvent';
import BeverageClientModel from '@/models/beverage.client.model';
import { IMenuListItem } from '@/models/interface/IMenuListItem';
import MenuListClientModel from '@/models/menuList.client.model';
import { useAuth } from '@/context/auth_user.context';
import CreateMenuList from '@/components/createMenuList';

interface Props {
  beverages: IBeverage[];
}

const EventCreatePage: NextPage<Props> = ({ beverages }) => {
  const { showToast } = useDialog();
  const [title, updateTitle] = useState('');
  const [desc, updateDesc] = useState('');
  const [checkedClosedDate, updateCheckedClosedDate] = useState(false);
  const [checkedMenu, updateCheckedMenu] = useState(false);

  const [menuList, updateMenuList] = useState<IMenuListItem[]>([]);
  const [selectedMenuList, updateSelectedMenuList] = useState<IMenuListItem | undefined>(undefined);

  const now = new Date();
  const after2hour = new Date();
  after2hour.setHours(after2hour.getHours() + 2);
  const [closedDate, updateClosedDate] = useState(getYYYYMMDD(getFormatDate(now)));
  const [closedTime, updateClosedTime] = useState(gethhmmss(getFormatDate(after2hour)));

  const { authUser } = useAuth();

  useEffect(() => {
    if (authUser === null) return;
    MenuListClientModel.findAll({}).then((resp) => {
      if (resp.payload !== undefined && resp.payload.length >= 0) {
        updateMenuList(resp.payload);
      }
    });
  }, [authUser]);

  async function onSubmit() {
    if (FirebaseAuthClient.getInstance().Auth.currentUser === null) {
      showToast('로그인이 필요합니다');
      return;
    }
    const trimTitle = title.trim();
    if (trimTitle.length <= 1) {
      showToast('주문서 이름을 2자 이상 입력하세요');
      return;
    }
    if (checkedClosedDate && (closedDate.length < 10 || closedTime.length < 8)) {
      showToast('마감일자와 시간은 2021-08-09 09:01:11 형식으로 입력하세요.');
      return;
    }
    if (checkedMenu && selectedMenuList === undefined) {
      showToast('메뉴판을 선택해주세요.');
      return;
    }
    const addEventData: IAddEventReq['body'] = {
      title: trimTitle,
      desc: desc.trim(),
      owner: {
        uid: FirebaseAuthClient.getInstance().Auth.currentUser!.uid,
        displayName: FirebaseAuthClient.getInstance().Auth.currentUser!.displayName ?? '',
        email: FirebaseAuthClient.getInstance().Auth.currentUser!.email ?? '',
        photoURL: FirebaseAuthClient.getInstance().Auth.currentUser!.photoURL ?? '',
      },
    };
    if (checkedClosedDate) {
      addEventData.lastOrder = new Date(`${closedDate} ${closedTime}`);
    }
    if (checkedClosedDate === false) {
      const after7Days = new Date();
      after7Days.setDate(after7Days.getDate() + 7);
      addEventData.lastOrder = after7Days;
    }
    if (checkedMenu && selectedMenuList !== undefined) {
      addEventData.menus = selectedMenuList.menu;
    }
    const resp = await EventClientModel.addEvent(addEventData);
    if (resp.status === 200 && resp.payload !== undefined) {
      showToast('주문서가 만들어졌습니다. 1초 후 이동합니다.');
      setTimeout(() => {
        window.location.href = `/events/${resp.payload?.id}`;
      }, 1000);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-xl px-6 py-12 bg-white border-0 shadow-lg sm:rounded-3xl">
        <h1 className="text-2xl font-bold mb-8">주문서 생성</h1>
        <div className="relative z-0 w-full mb-5">
          <input
            type="text"
            name="name"
            placeholder=" "
            required
            value={title}
            onChange={(e) => {
              const { value } = e.currentTarget;
              updateTitle(value);
            }}
            className="pt-3 pb-2 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-black border-gray-200"
          />
          <label htmlFor="name" className="absolute duration-300 top-3 -z-1 origin-0 text-gray-500">
            주문서 이름 *
          </label>
          <span className="text-sm text-red-600 hidden" id="error">
            주문서 이름이 필요합니다
          </span>
        </div>
        <div className="relative z-0 w-full mb-5">
          <input
            type="text"
            name="desc"
            placeholder=" "
            value={desc}
            onChange={(e) => {
              const { value } = e.currentTarget;
              updateDesc(value);
            }}
            className="pt-3 pb-2 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-black border-gray-200"
          />
          <label htmlFor="desc" className="absolute duration-300 top-3 -z-1 origin-0 text-gray-500">
            설명
          </label>
        </div>
        <fieldset className="relative z-0 w-full p-px mb-5">
          <div className="block pt-3 pb-2 space-x-4">
            <label>
              <input
                type="checkbox"
                name="checkbox"
                checked={checkedClosedDate}
                onChange={() => {
                  updateCheckedClosedDate(!checkedClosedDate);
                }}
                className="mr-2 text-black border-2 border-gray-300 focus:border-gray-300 focus:ring-black"
              />
              마감시간 설정
            </label>
          </div>
          <span className="text-sm text-red-600 hidden" id="error">
            Option has to be selected
          </span>
        </fieldset>
        {checkedClosedDate && (
          <div className="flex flex-row space-x-4">
            <div className="relative z-0 w-full mb-5">
              <input
                type="text"
                name="date"
                placeholder=" "
                onClick={(e) => {
                  e.currentTarget.setAttribute('type', 'date');
                }}
                value={closedDate}
                onChange={(e) => {
                  const value = e.currentTarget.value.trim();
                  if (/[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(value)) {
                    updateClosedDate(value);
                  }
                }}
                className="pt-3 pb-2 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-black border-gray-200"
              />
              <label htmlFor="date" className="absolute duration-300 top-3 -z-1 origin-0 text-gray-500">
                주문 마감일
              </label>
              <span className="text-sm text-red-600 hidden" id="error">
                주문 마감일을 설정하세요.
              </span>
            </div>
            <div className="relative z-0 w-full">
              <input
                type="text"
                name="time"
                placeholder=" "
                value={closedTime}
                onClick={(e) => {
                  e.currentTarget.setAttribute('type', 'time');
                }}
                onChange={(e) => {
                  const value = e.currentTarget.value.trim();
                  if (/[0-9]{2}:[0-9]{2}:[0-9]{2}/.test(value)) {
                    updateClosedTime(value);
                  }
                }}
                className="pt-3 pb-2 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-black border-gray-200"
              />
              <label htmlFor="time" className="absolute duration-300 top-3 -z-1 origin-0 text-gray-500">
                마감시간
              </label>
              <span className="text-sm text-red-600 hidden" id="error">
                주문 마감시간을 설정하세요.
              </span>
            </div>
          </div>
        )}
        <fieldset className="relative z-0 w-full p-px mb-5">
          <div className="block pt-3 pb-2 space-x-4">
            <label>
              <input
                type="checkbox"
                name="checkbox"
                checked={checkedMenu}
                onChange={() => {
                  updateCheckedMenu(!checkedMenu);
                }}
                className="mr-2 text-black border-2 border-gray-300 focus:border-gray-300 focus:ring-black"
              />
              메뉴판 설정 하기
            </label>
          </div>
          <span className="text-sm text-red-600 hidden" id="error">
            Option has to be selected
          </span>
        </fieldset>
        {checkedMenu && (
          <>
            {selectedMenuList && <p>{`선택된 메뉴판: ${selectedMenuList.title}`}</p>}
            <CreateMenuList
              beverages={beverages}
              menuList={menuList}
              onSelectMenuList={(list) => {
                updateSelectedMenuList(list);
              }}
            />
          </>
        )}
        <button
          id="button"
          type="button"
          onClick={onSubmit}
          className="w-full px-6 py-3 mt-3 text-lg text-white transition-all duration-150 ease-linear rounded-lg shadow outline-none bg-pink-500 hover:bg-pink-600 hover:shadow-lg focus:outline-none"
        >
          주문서 만들기
        </button>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    const beverages = await BeverageClientModel.findAll({ page: 1, limit: 90, host: process.env.DOMAIN_HOST });
    return {
      props: {
        beverages: beverages.payload ?? [],
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        beverages: [],
      },
    };
  }
};

export default EventCreatePage;
