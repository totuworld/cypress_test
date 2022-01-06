import { IBeverage } from './IEvent';

export interface IMenuListItem {
  id: string;
  /** 메뉴판 이름 */
  title: string;
  /** 메뉴판에 대한 설명 */
  desc?: string;
  /** 메뉴판 소유자 */
  ownerId: string;
  /** 메뉴 목록 */
  menu: IBeverage[];
}
