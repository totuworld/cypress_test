import { IBeverage } from '@/models/interface/IEvent';
import React from 'react';

interface Props {
  count?: number;
  option?: string;
  isOwned?: boolean;
  handleOnClick?(): void;
  buttonTitle?: string;
}

type TProps = Props & Pick<IBeverage, 'title'>;

const BeverageFindItem: React.FC<TProps> = ({
  count,
  title,
  option,
  isOwned,
  handleOnClick,
  buttonTitle = '주문하기',
}) => {
  const badge = count !== undefined ? <span>{count} 개</span> : null;
  return (
    <li className="pl-8 pr-2 py-1 border-b-2 last:border-b-0 border-gray-100 relative hover:bg-gray-50 hover:text-gray-900 flex justify-center items-center">
      <p className="flex-grow">
        <b>{title}</b>
        <br />
        {option}
      </p>
      {badge}
      {!isOwned && (
        <button
          className="rounded-xl bg-blue-500 p-2 text-white"
          type="button"
          onClick={() => {
            handleOnClick !== undefined && handleOnClick();
          }}
        >
          {buttonTitle}
        </button>
      )}
    </li>
  );
};

export default BeverageFindItem;
