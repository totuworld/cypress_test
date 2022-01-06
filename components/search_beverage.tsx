/* eslint-disable jsx-a11y/label-has-associated-control */
import { useMemo, useState, ChangeEvent, Dispatch, SetStateAction } from 'react';

import { IBeverage } from '@/models/interface/IEvent';
import BeverageFindItem from '@/components/beverage_item';
import BeverageClientModel from '@/models/beverage.client.model';
import useDialog from '@/hooks/use_dialog';

function reduceOrder({ beverages: originBeverages }: { beverages: IBeverage[] }) {
  const beverages = originBeverages.reduce((acc, cur) => {
    acc.set(cur.id, cur);
    return acc;
  }, new Map<string, IBeverage>());
  return {
    mapBeverages: beverages,
  };
}

interface Props {
  beverages: IBeverage[];
  updateBeverages: Dispatch<SetStateAction<IBeverage[]>>;
  selectedMenus: IBeverage[];
  updateSelectedMenus: Dispatch<SetStateAction<IBeverage[]>>;
}

const SearchBeverage: React.FC<Props> = ({ beverages, updateBeverages, selectedMenus, updateSelectedMenus }) => {
  const { showToast } = useDialog();
  const [searchText, updateSearchText] = useState('');
  const [matchBeverages, updateMatchBeverages] = useState<IBeverage[]>([]);
  const memoizedOrders = useMemo(() => reduceOrder({ beverages }), [beverages]);

  function getMatchedBeverageList({
    searchValue,
    orderMap,
  }: {
    searchValue: string;
    orderMap: Map<string, IBeverage>;
  }) {
    return [...orderMap.values()].filter((fv) => {
      if (fv.title.indexOf(searchValue) >= 0) {
        return true;
      }
      if (!!fv.alias && fv.alias.indexOf(searchValue) >= 0) {
        return true;
      }
      return false;
    });
  }

  function onChangeInput(e: ChangeEvent<HTMLInputElement>) {
    const searchValue = e.currentTarget.value;
    updateSearchText(searchValue);

    if (memoizedOrders.mapBeverages.size > 0 && searchValue.length > 0) {
      const searchedList = getMatchedBeverageList({ searchValue, orderMap: memoizedOrders.mapBeverages });
      updateMatchBeverages(searchedList);
    }
    if (searchValue.length <= 0) {
      updateMatchBeverages([]);
    }
  }

  function appendSelectedMenu(menu: IBeverage) {
    // 기존에 선택된 메뉴인지 확인.
    const findIndex = selectedMenus.findIndex((fv) => fv.id === menu.id);
    if (findIndex >= 0) {
      showToast('이미 선택된 메뉴입니다.');
      return;
    }
    updateSearchText('');
    updateMatchBeverages([]);
    updateSelectedMenus((prev) => [...prev, menu]);
  }

  function removeSelectedMenu(menu: IBeverage) {
    updateSelectedMenus((prev) => prev.filter((fv) => fv.id !== menu.id));
  }

  function searchBeverages() {
    const beverageItems = matchBeverages.map((mv) => (
      <BeverageFindItem
        key={mv.id}
        title={mv.title}
        handleOnClick={() => {
          appendSelectedMenu(mv);
        }}
        buttonTitle="메뉴 추가"
      />
    ));
    const orderAndBeverageItems = [...beverageItems];
    if (orderAndBeverageItems.length <= 0 && searchText.length >= 2) {
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
              const beverageListResp = await BeverageClientModel.findAll({ page: 1, limit: 99 });
              if (beverageListResp.status === 200 && beverageListResp.payload !== undefined) {
                updateBeverages(beverageListResp.payload);
                const newOrderMap = reduceOrder({ beverages: beverageListResp.payload });
                const searchedList = getMatchedBeverageList({
                  searchValue: searchText,
                  orderMap: newOrderMap.mapBeverages,
                });
                updateMatchBeverages(searchedList);
              }
            }}
          >
            등록
          </button>{' '}
          버튼을 클릭해주세요.
        </p>
      );
    }
    return orderAndBeverageItems;
  }

  const displaySearchResult = searchBeverages();
  const menus = selectedMenus.map((menu) => (
    <li className="flex justify-center items-center p-2 border rounded-md">
      <p className="flex-grow">
        <b>{menu.title}</b>
      </p>
      <button
        className="rounded-full w-5 h-5 bg-red-500 text-white leading-5"
        type="button"
        onClick={() => {
          removeSelectedMenu(menu);
        }}
      >
        X
      </button>
    </li>
  ));

  return (
    <>
      <div className="relative">
        <div className="relative z-0 w-full mb-1">
          <input
            type="text"
            name="name"
            placeholder=" "
            value={searchText}
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
            메뉴 검색
          </label>
        </div>
        <ul className="bg-white  w-full absolute z-10">{displaySearchResult}</ul>
      </div>
      <div className="relative z-0 w-full mb-1">
        <ul>{menus}</ul>
      </div>
    </>
  );
};

export default SearchBeverage;
