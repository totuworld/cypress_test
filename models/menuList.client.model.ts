import debug from '../utils/debug_log';
import { requester } from '../services/requester';

import FirebaseAuthClient from './commons/firebase_auth_client.model';
import { IMenuListItem } from './interface/IMenuListItem';
import { IBeverage } from './interface/IEvent';

const log = debug('masa:model:MenuListClientModel');

export default class MenuListClientModel {
  static async findAll({ host = '' }: { host?: string }) {
    const token = await FirebaseAuthClient.getInstance().Auth.currentUser?.getIdToken();
    console.log(token);
    try {
      const resp = await requester<IMenuListItem[]>({
        option: {
          url: `${host}/api/menuList`,
          method: 'get',
          headers: {
            authorization: token,
          },
        },
      });
      log('findAll');
      return resp;
    } catch (err) {
      return {
        status: 500,
      };
    }
  }

  static async create({
    menuListName,
    beverages,
    host = '',
  }: {
    menuListName: string;
    beverages: IBeverage[];
    host?: string;
  }) {
    const token = await FirebaseAuthClient.getInstance().Auth.currentUser?.getIdToken();
    try {
      const resp = await requester<IMenuListItem>({
        option: {
          url: `${host}/api/menuList`,
          method: 'post',
          headers: {
            authorization: token,
          },
          data: {
            title: menuListName,
            menu: beverages,
          },
        },
      });
      return resp;
    } catch (err) {
      return {
        status: 500,
      };
    }
  }

  static async update({
    id,
    menuListName,
    beverages,
    host = '',
  }: {
    id: string;
    menuListName: string;
    beverages: IBeverage[];
    host?: string;
  }) {
    const token = await FirebaseAuthClient.getInstance().Auth.currentUser?.getIdToken();
    try {
      const resp = await requester<IMenuListItem>({
        option: {
          url: `${host}/api/menuList/${id}`,
          method: 'put',
          headers: {
            authorization: token,
          },
          data: {
            title: menuListName,
            menu: beverages,
          },
        },
      });
      return resp;
    } catch (err) {
      return {
        status: 500,
      };
    }
  }
}
