import debug from '../utils/debug_log';
import { requester } from '../services/requester';

import FirebaseAuthClient from './commons/firebase_auth_client.model';
import { IBeverage } from './interface/IEvent';

const log = debug('masa:model:Beverage_client');

export default class BeverageClientModel {
  static async findAll({ page, limit, host = '' }: { page: number; limit: number; host?: string }) {
    try {
      const resp = await requester<IBeverage[]>({
        option: {
          url: `${host}/api/beverages?page=${page}&limit=${limit}`,
          method: 'get',
        },
      });
      return resp;
    } catch (err) {
      return {
        status: 500,
      };
    }
  }

  static async add({ title, alias = '' }: { title: string; alias?: string }) {
    try {
      const token = await FirebaseAuthClient.getInstance().Auth.currentUser?.getIdToken();
      log(title);
      const resp = await requester<IBeverage>({
        option: {
          url: '/api/beverages',
          method: 'post',
          headers: {
            authorization: token,
          },
          data: {
            title,
            alias,
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
