export interface IEvent {
  /** event id */
  id: string;
  /** 이름 */
  title: string;
  /** 간단한 설명 */
  desc: string;
  /** 마지막 주문이 가능한 시간 */
  lastOrder?: Date;
  /** owner id */
  ownerId: string;
  /** owner의 display name */
  ownerName: string;
  /** 주문 마감 여부 */
  closed: boolean;
  /** 메뉴를 특정한 경우 추가된다 */
  menus?: IBeverage[];
}

export interface IEventOrder {
  /** 주문자 */
  guestId: string;
  /** 주문 상품 */
  beverageId: string;
  /** 주문에 관한 추가 요청 */
  option?: string;
}

export interface IBeverage {
  id: string;
  /** 이름 */
  title: string;
  alias?: string;
}
