/* eslint-disable jsx-a11y/label-has-associated-control */
import { GetServerSideProps, NextPage } from 'next';
import { useRef, useMemo, useState, ReactNode, ChangeEvent } from 'react';

import Layout from '@/components/Layout';
import { IBeverage, IEvent, IEventOrder } from '@/models/interface/IEvent';
import EventClientModel from '@/models/event.client.model';
import BeverageClientModel from '@/models/beverage.client.model';

import getStringValueFromQuery from '@/utils/get_value_from_query';
import { getFormatDate, getYYYYMMDDhhmm } from '@/utils/time_helper';
import { useAuth } from '@/context/auth_user.context';
import BeverageFindItem from '@/components/beverage_item';
import useDialog from '@/hooks/use_dialog';

type OrderWithDocID = IEventOrder & { docId: string };

interface MenuAndOrders {
  menu: IBeverage & { option?: string };
  orders: OrderWithDocID[];
}

interface Props {
  event: IEvent | null;
  orders: OrderWithDocID[];
  beverages: IBeverage[];
}

function reduceOrder({ orders, beverages: originBeverages }: { orders: OrderWithDocID[]; beverages: IBeverage[] }) {
  const beverages = originBeverages.reduce((acc, cur) => {
    acc.set(cur.id, cur);
    return acc;
  }, new Map<string, IBeverage>());
  const orderInfos = orders.reduce((acc, cur) => {
    const key = `${cur.beverageId},${cur.option}`;
    const beverage = beverages.get(cur.beverageId);
    if (acc.has(key)) {
      const findValue = acc.get(key);
      if (findValue) {
        const updateValue = { ...findValue, orders: [...findValue.orders, cur] };
        acc.set(key, updateValue);
      }
      return acc;
    }
    if (beverage) {
      const addValue: MenuAndOrders = {
        orders: [cur],
        menu: {
          ...beverage,
          option: cur.option,
        },
      };
      acc.set(key, addValue);
    }
    return acc;
  }, new Map<string, MenuAndOrders>());
  return {
    orderInfos,
    mapBeverages: beverages,
  };
}

const EventPage: NextPage<Props> = ({ event: propsEvent, orders: propsOrders, beverages: PropsBeverages }) => {
  const { showToast, openConfirmModal } = useDialog();
  const [event, updateEvent] = useState<IEvent | null>(propsEvent);
  const { loading, authUser } = useAuth();
  const [orders, updateOrders] = useState(propsOrders);
  const [beverages, updateBeverages] = useState(propsEvent?.menus ?? PropsBeverages);
  const [matchOrders, updateMatchOrders] = useState<MenuAndOrders[]>([]);
  const [matchBeverages, updateMatchBeverages] = useState<IBeverage[]>([]);
  const [searchText, updateSearchText] = useState('');
  const confirmInputRef = useRef<HTMLInputElement>(null);
  const [toggleMenuList, updateToggleMenuList] = useState(false);
  const memoizedOrders = useMemo(() => reduceOrder({ orders, beverages }), [orders, beverages]);
  const memoizedMyOrder = useMemo(() => {
    if (authUser === null) {
      return {
        myOrder: undefined,
        myBeverage: undefined,
      };
    }
    const myOrder = orders.find((fv) => fv.guestId === authUser?.uid);
    const myBeverage = myOrder === undefined ? null : beverages.find((fv) => fv.id === myOrder.beverageId);
    return {
      myOrder,
      myBeverage,
    };
  }, [orders, beverages, authUser]);
  if (event === null) {
    return <div>null</div>;
  }
  const orderItems: ReactNode[] = [];
  memoizedOrders.orderInfos.forEach((v) => {
    orderItems.push(
      <li className="flex justify-center items-center p-2 border rounded-md">
        <p className="flex-grow">
          <b>{v.menu.title}</b>
          <br />
          {v.menu.option}
        </p>
        <span className="">{v.orders.length} 개</span>
      </li>,
    );
  });

  function onChangeInput(e: ChangeEvent<HTMLInputElement>) {
    const searchValue = e.currentTarget.value;
    updateSearchText(searchValue);

    if (memoizedOrders.mapBeverages.size > 0 && searchValue.length > 0) {
      const searchedList = [...memoizedOrders.mapBeverages.values()].filter((fv) => {
        if (fv.title.indexOf(searchValue) >= 0) {
          return true;
        }
        if (!!fv.alias && fv.alias.indexOf(searchValue) >= 0) {
          return true;
        }
        return false;
      });
      updateMatchBeverages(searchedList);
    }
    if (memoizedOrders.orderInfos.size > 0 && searchValue.length > 0) {
      const valueList = [...memoizedOrders.orderInfos.values()];
      const searchedList = valueList.filter(
        (fv) =>
          fv.menu.title.indexOf(searchValue) >= 0 ||
          (fv.menu.alias !== undefined && fv.menu.alias.indexOf(searchValue) >= 0),
      );
      updateMatchOrders(searchedList);
    }
    if (searchValue.length <= 0) {
      updateMatchBeverages([]);
      updateMatchOrders([]);
    }
  }

  async function onClickSearchedBeverage(beverage: IBeverage, option?: string) {
    if (event === null || authUser === null) return;
    try {
      // 해당 음료로 내 주문을 변경하도록 요청한다.
      const resp = await EventClientModel.addOrder({
        eventId: event.id,
        order: {
          guestId: authUser.uid,
          beverageId: beverage.id,
          option,
        },
      });
      if (resp.status !== 200) {
        openConfirmModal({
          message: '음료 변경에 문제가 발생했습니다. 이벤트 정보를 갱신합니다.',
          hideCancel: true,
          onAccept: async () => {
            updateSearchText('');
            updateMatchOrders([]);
            updateMatchBeverages([]);
            const loadedEventInfo = await EventClientModel.findEvent({ eventId: event.id });
            if (loadedEventInfo.status === 200 && loadedEventInfo.payload !== undefined) {
              updateEvent(loadedEventInfo.payload);
            }
          },
        });
        return;
      }
      openConfirmModal({
        message: `${beverage.title} 주문 완료`,
        hideCancel: true,
      });
      const newOrderList = await EventClientModel.orders({ eventId: event.id });
      if (newOrderList.status === 200 && newOrderList.payload !== undefined) {
        updateOrders(newOrderList.payload);
      }
      updateSearchText('');
      updateMatchOrders([]);
      updateMatchBeverages([]);
    } catch (err) {
      console.log(err);
    }
  }

  function openInputOptionDialog(beverage: IBeverage) {
    openConfirmModal({
      message: (
        <div className="p-4">
          {beverage.title} 의 옵션을 입력해주세요
          <input
            ref={confirmInputRef}
            type="text"
            name="beverageOption"
            placeholder="옵션을 입력해주세요"
            className="pt-3 pb-2 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-black border-gray-200"
          />
        </div>
      ),
      rejectBtnText: '닫기',
      acceptBtnText: '추가',
      onAccept: async () => {
        const optionText = confirmInputRef.current?.value.trim() ?? '';
        await onClickSearchedBeverage(beverage, optionText);
      },
    });
  }

  function searchBeverages() {
    const orderFindItems = matchOrders.map((mv) => (
      <BeverageFindItem
        key={`${mv.menu.id}_${mv.orders[0].guestId}`}
        count={mv.orders.length}
        title={mv.menu.title}
        option={mv.menu.option}
        isOwned={
          memoizedMyOrder.myOrder?.beverageId === mv.menu.id && memoizedMyOrder.myOrder?.option === mv.menu.option
        }
        handleOnClick={() => {
          onClickSearchedBeverage(mv.menu, mv.menu.option);
        }}
      />
    ));
    const beverageItems = matchBeverages.map((mv) => (
      <BeverageFindItem
        key={mv.id}
        title={mv.title}
        handleOnClick={() => {
          openInputOptionDialog(mv);
        }}
      />
    ));
    const orderAndBeverageItems = [...orderFindItems, ...beverageItems];
    if (orderAndBeverageItems.length <= 0 && searchText.length >= 2 && propsEvent?.menus === undefined) {
      return (
        <p>
          검색된 음료나 주문이 없습니다.
          <br /> 해당 음료를 새로 등록하시려면{' '}
          <button
            className="rounded-xl bg-blue-300 text-white pl-2 pr-2"
            type="button"
            onClick={async () => {
              const resp = await BeverageClientModel.add({ title: searchText });
              if (resp.status !== 200 || resp.payload === undefined) {
                showToast('신규 음료 등록에 실패했습니다. 잠시 후 다시 시도하세요');
                return;
              }
              openInputOptionDialog(resp.payload);
              const beverageListResp = await BeverageClientModel.findAll({ page: 1, limit: 99 });
              if (beverageListResp.status === 200 && beverageListResp.payload !== undefined) {
                updateBeverages(beverageListResp.payload);
              }
            }}
          >
            등록
          </button>{' '}
          버튼을 클릭해주세요.
        </p>
      );
    }
    if (orderAndBeverageItems.length <= 0 && searchText.length >= 1 && propsEvent?.menus !== undefined) {
      return (
        <p>
          메뉴가 한정된 주문서입니다.{' '}
          <button
            type="button"
            className="rounded-xl bg-blue-300 text-white pl-2 pr-2"
            onClick={() => {
              openConfirmModal({
                message: (
                  <ul className="p-5">
                    {propsEvent.menus?.map((mv) => (
                      <li key={mv.id}>{mv.title}</li>
                    ))}
                  </ul>
                ),
                hideCancel: true,
                acceptBtnText: '닫기',
              });
            }}
          >
            메뉴판 보기
          </button>{' '}
          버튼을 클릭해주세요
        </p>
      );
    }
    return orderAndBeverageItems;
  }

  const displaySearchResult = searchBeverages();

  return (
    <Layout>
      <div className="mx-auto max-w-xl px-6 py-12 bg-white border-0 shadow-lg sm:rounded-3xl">
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <div className="mb-8">
          <p>{event.desc}</p>
          {event.lastOrder && <p>마감시각: {getYYYYMMDDhhmm(getFormatDate(new Date(event.lastOrder)))}</p>}
          {event.closed && <p className="p-4 mt-2 text-white text-xl rounded-xl bg-red-500">마감된 주문입니다.</p>}
        </div>
        {loading === false && authUser !== null && event.ownerId === authUser.uid && event.closed === false && (
          <button
            type="button"
            className="w-full bg-red-500 rounded-md p-2 text-white mb-4"
            onClick={async () => {
              const updateResp = await EventClientModel.closeEvent({ eventId: event.id });
              if (updateResp.status === 200 && updateResp.payload !== undefined) {
                updateEvent(updateResp.payload);
              }
            }}
          >
            주문 마감하기
          </button>
        )}
        <div className="mb-4">
          <p>전체 {orders.length} 잔</p>
          {memoizedMyOrder.myOrder && (
            <p>
              내 주문: {memoizedMyOrder.myBeverage?.title}
              <button
                type="button"
                className="rounded-xl bg-blue-300 text-white pl-2 pr-2"
                onClick={async () => {
                  if (authUser === null) return;
                  await EventClientModel.deleteOrder({ eventId: event.id, guestId: authUser.uid });
                  const newOrderList = await EventClientModel.orders({ eventId: event.id });
                  if (newOrderList.status === 200 && newOrderList.payload !== undefined) {
                    updateOrders(newOrderList.payload);
                  }
                }}
              >
                주문 취소
              </button>
            </p>
          )}
        </div>
        {propsEvent?.menus !== undefined && (
          <button
            type="button"
            className="rounded-xl bg-blue-300 text-white pl-2 pr-2"
            onClick={() => {
              updateToggleMenuList((prev) => !prev);
            }}
          >
            메뉴판 {!toggleMenuList ? '보기' : '닫기'}
          </button>
        )}
        {toggleMenuList && propsEvent?.menus !== undefined && (
          <ul className="relative z-0 w-full mb-1">
            {propsEvent.menus.map((mv) => (
              <BeverageFindItem
                key={mv.id}
                title={mv.title}
                handleOnClick={() => {
                  openInputOptionDialog(mv);
                }}
              />
            ))}
          </ul>
        )}
        <div className="relative">
          <div className="relative z-0 w-full mb-1">
            <input
              type="text"
              name="name"
              placeholder=" "
              value={searchText}
              disabled={event.closed || authUser === null}
              className="pt-3 pb-2 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-black border-gray-200"
              onChange={onChangeInput}
            />
            <label
              htmlFor="name"
              className="absolute duration-300 top-3 -z-1 origin-0 text-gray-500 flex justify-center items-center"
            >
              <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path d="M9.145 18.29c-5.042 0-9.145-4.102-9.145-9.145s4.103-9.145 9.145-9.145 9.145 4.103 9.145 9.145-4.102 9.145-9.145 9.145zm0-15.167c-3.321 0-6.022 2.702-6.022 6.022s2.702 6.022 6.022 6.022 6.023-2.702 6.023-6.022-2.702-6.022-6.023-6.022zm9.263 12.443c-.817 1.176-1.852 2.188-3.046 2.981l5.452 5.453 3.014-3.013-5.42-5.421z" />
              </svg>
              음료 검색
            </label>
          </div>
          <ul className="bg-white  w-full absolute z-10">{displaySearchResult}</ul>
        </div>
        <div className="relative z-0 w-full mb-1">
          <ul>{orderItems}</ul>
        </div>
      </div>
    </Layout>
  );
};

/*
  메뉴를 검색할 수 있다
  검색된 메뉴나 기존에 있던 메뉴를 선택해서 자신의 메뉴를 정할 수 있다
  자신의 선택 정보가 상단에 표시된다

  메뉴 선택 시 옵션을 추가 기입할 수 있다

  총 몇잔의 주문이 들어갔는지 보인다
  각 메뉴별로 몇 잔인지 보인다
  각 메뉴별로 사용자가 지정한 옵션이 보인다

  이벤트 생성자나 이벤트 매니저는 주문 마감 버튼이 보인다

  주문이 마감되면 검색창이 비활성화된다
  주문이 마감되면 다른 메뉴를 클릭해서 자신의 메뉴를 변경할 수 없다

  [x] 주문 마감 버튼을 누르면 주문마감 처리해야함.

  [x] 전체 음료와 guest 주문을 reduce해야함
  [x] 검색창에 명칭을 입력하면 음료가 검색되어야함.
  [x] 검색된 음료를 클릭하면 자신의 음료를 변경할 수 있어야함
    [x] 이때 기존 주문과 같은걸 누르면 그게 그대로 반영됨.
    [x] 기존에 없던 주문이면 option을 입력받아 처리한다.
    * 신규 음료는 새로운 이름으로 등록한 뒤, 옵션을 넣을 수 있어야한다.
*/

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const eventId = getStringValueFromQuery({ query, field: 'event_id' });
  console.log({ eventId });
  if (eventId === undefined) {
    return {
      props: {
        event: null,
        orders: [],
        beverages: [],
      },
    };
  }
  try {
    const [event, orders, beverages] = await Promise.all([
      EventClientModel.findEvent({ eventId, host: process.env.DOMAIN_HOST }),
      EventClientModel.orders({ eventId, host: process.env.DOMAIN_HOST }),
      BeverageClientModel.findAll({ page: 1, limit: 90, host: process.env.DOMAIN_HOST }),
    ]);
    return {
      props: {
        event: event.payload ?? null,
        orders: orders.payload ?? [],
        beverages: beverages.payload ?? [],
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        event: null,
        orders: [],
        beverages: [],
      },
    };
  }
};

export default EventPage;
