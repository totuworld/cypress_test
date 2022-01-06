/* eslint-disable jsx-a11y/label-has-associated-control,jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events */
import React, { ChangeEvent, useState } from 'react';
import SearchBeverage from '@/components/search_beverage';
import { IMenuListItem } from '@/models/interface/IMenuListItem';
import { IBeverage } from '@/models/interface/IEvent';
import useDialog from '@/hooks/use_dialog';
import MenuListClientModel from '@/models/menuList.client.model';

interface Props {
  beverages: IBeverage[];
  menuList: IMenuListItem[];
  onSelectMenuList: (list: IMenuListItem) => void;
}

const DisplayMenuList: React.FC<{
  mv: IMenuListItem;
  onSelectMenuList: (list: IMenuListItem) => void;
  onClickModify: (origin: IMenuListItem) => void;
}> = ({ mv, onSelectMenuList, onClickModify }) => {
  const { title, menu } = mv;
  const [toggle, updateToggle] = useState(false);
  return (
    <li className="pl-8 pr-2 py-1 border-b-2 last:border-b-0 border-gray-100 relative hover:bg-gray-50 hover:text-gray-900">
      <div className="flex justify-center items-center">
        <p className="flex-grow">
          <b>{title}</b>
          <br />
          {`${menu.length} 개 메뉴`}
          <button
            className="w-16 rounded-sm ml-2 pl-2 pr-2 text-white bg-gray-500 focus:outline-none"
            type="button"
            onClick={() => {
              updateToggle(!toggle);
            }}
          >
            {toggle ? '닫기' : '펼치기'}
          </button>
        </p>
        <button
          className="rounded-sm p-2 mr-2 text-white bg-gray-500 focus:outline-none"
          type="button"
          onClick={() => {
            onClickModify(mv);
          }}
        >
          수정
        </button>
        <button
          className="rounded-sm p-2 mr-2 text-white bg-pink-500 focus:outline-none"
          type="button"
          onClick={() => {
            onSelectMenuList(mv);
          }}
        >
          선택
        </button>
      </div>
      {toggle && menu.map((menuMv) => menuMv.title).join(', ')}
    </li>
  );
};

const CreateMenuList: React.FC<Props> = ({ beverages: PropsBeverages, menuList: PropsMenuList, onSelectMenuList }) => {
  const { showToast } = useDialog();
  const [beverages, updateBeverages] = useState(PropsBeverages);
  const [menuList, updateMenuList] = useState(PropsMenuList);
  const [selectedMenus, updateSelectedMenus] = useState<IBeverage[]>([]);

  const [togglePopup, updateTogglePopup] = useState(false);

  const [mutationMode, updateMutationMode] = useState<'CREATE' | 'MODIFY'>('CREATE');
  const [modifyId, updateModifyId] = useState<string | undefined>(undefined);

  const [searchText, updateSearchText] = useState('');
  const [menuListName, updateMenuListName] = useState('');
  const [searchedMenuList, updateSearchedMenuList] = useState<IMenuListItem[]>([]);
  function onChangeInput(e: ChangeEvent<HTMLInputElement>) {
    const searchValue = e.currentTarget.value;
    updateSearchText(searchValue);

    if (searchValue.length > 0 && menuList.length > 0) {
      const filteredMenuList = menuList.filter((fv) => fv.title.indexOf(searchValue) >= 0);
      updateSearchedMenuList(filteredMenuList);
    }
  }

  async function onSubmit() {
    // 메뉴판 이름이 2자 이상 입력되었는지 확인
    if (menuListName.length < 2) {
      showToast('메뉴판 이름을 2자 이상 입력하세요');
      return;
    }
    if (selectedMenus.length <= 0) {
      showToast('메뉴를 최소 1개 이상 선택하세요');
      return;
    }
    const action =
      mutationMode === 'CREATE'
        ? MenuListClientModel.create({ menuListName, beverages: selectedMenus })
        : MenuListClientModel.update({ id: modifyId!, menuListName, beverages: selectedMenus });
    const resp = await action;
    if (mutationMode === 'CREATE' && resp.payload !== undefined) {
      updateMenuList((origin) => [...origin, resp.payload!]);
    }
    if (mutationMode === 'MODIFY') {
      updateMenuList((origin) => {
        const findMenuListIndex = origin.findIndex((ofv) => ofv.id === modifyId);

        if (findMenuListIndex === -1) {
          return origin;
        }
        const updateOrigin = [...origin];
        updateOrigin.splice(findMenuListIndex, 1, {
          ...origin[findMenuListIndex],
          title: menuListName,
          menu: selectedMenus,
        });
        return updateOrigin;
      });
    }
    if (resp.status === 200) {
      updateTogglePopup(false);
      updateMenuListName('');
      updateSelectedMenus([]);
    }
  }

  const printedMenuList = (() => {
    const usedList = searchedMenuList.length > 0 ? searchedMenuList : menuList;
    return usedList.map((mv) => (
      <DisplayMenuList
        key={`all-menu-list-${mv.id}`}
        mv={mv}
        onSelectMenuList={onSelectMenuList}
        onClickModify={() => {
          updateModifyId(mv.id);
          updateMenuListName(mv.title);
          updateSelectedMenus(mv.menu);
          updateMutationMode('MODIFY');
          updateTogglePopup(true);
        }}
      />
    ));
  })();
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
            메뉴판 검색
          </label>
        </div>
        <div className="relative z-0 w-full mb-1">
          <ul>{printedMenuList}</ul>
        </div>
      </div>
      {!togglePopup && (
        <button
          type="button"
          className="w-full px-6 py-3 mt-3 mb-5 text-lg text-gray-300 transition-all duration-150 ease-linear rounded-lg border-dotted border-4 border-light-blue-500 hover:shadow-lg hover:outline-none focus:outline-none"
          onClick={() => {
            updateMutationMode('CREATE');
            updateMenuListName('');
            updateSelectedMenus([]);
            updateTogglePopup(true);
          }}
        >
          새로운 메뉴판 만들기
        </button>
      )}
      {togglePopup && (
        <div className="px-6 py-3 rounded-lg border-dotted border-4">
          <div className="relative">
            <div className="relative z-0 w-full mb-4">
              <input
                type="text"
                name="menuListName"
                placeholder=" "
                value={menuListName}
                className="pt-3 pb-2 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-black border-gray-200"
                onChange={(e) => {
                  updateMenuListName(e.currentTarget.value);
                }}
              />
              <label htmlFor="menuListName" className="absolute duration-300 top-3 -z-1 origin-0 text-gray-500">
                {mutationMode === 'CREATE' ? '등록' : '수정'}할 메뉴판 이름 *
              </label>
            </div>
          </div>
          <SearchBeverage
            beverages={beverages}
            updateBeverages={updateBeverages}
            selectedMenus={selectedMenus}
            updateSelectedMenus={updateSelectedMenus}
          />
          <div className="flex space-x-2 mt-4 mb-2">
            <button
              className="bg-gray-500 text-white p-2 rounded-xl focus:outline-none"
              type="button"
              onClick={() => {
                updateTogglePopup(false);
              }}
            >
              닫기
            </button>
            <button
              className="bg-pink-500 text-white p-2 rounded-xl focus:outline-none"
              type="button"
              onClick={onSubmit}
            >
              메뉴판 {mutationMode === 'CREATE' ? '등록' : '수정'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateMenuList;
