import { IBeverage } from '@/models/interface/IEvent';
import { InMemberInfo } from '../../../models/members/in_member_info';

export interface IAddEventReq {
  body: {
    title: string;
    owner: InMemberInfo;
    desc?: string;
    lastOrder?: Date;
    closed?: boolean;
    menus?: IBeverage[];
  };
}
