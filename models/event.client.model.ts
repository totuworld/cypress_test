import debug from '../utils/debug_log';
import { requester } from '../services/requester';

import { IEvent, IEventOrder } from './interface/IEvent';
import { IAddEventReq } from '../controllers/event/interface/IAddEventReq';
import FirebaseAuthClient from './commons/firebase_auth_client.model';

const log = debug('masa:model:Event_client');

type OrderWithDocID = IEventOrder & { docId: string };

export default class EventClientModel {
  static async findAllEvent({ host = '' }: { host?: string }) {
    try {
      const resp = await requester<IEvent[]>({
        option: {
          url: `${host}/api/events`,
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

  static async findEvent({ eventId, host = '' }: { eventId: string; host?: string }) {
    console.log({ host });
    try {
      const resp = await requester<IEvent>({
        option: {
          url: `${host}/api/events/${eventId}`,
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

  static async addEvent(data: IAddEventReq['body']) {
    try {
      const token = await FirebaseAuthClient.getInstance().Auth.currentUser?.getIdToken();
      log(data);
      const resp = await requester<IEvent>({
        option: {
          url: '/api/events',
          method: 'post',
          headers: {
            authorization: token,
          },
          data,
        },
      });
      return resp;
    } catch (err) {
      return {
        status: 500,
      };
    }
  }

  static async closeEvent({ eventId }: { eventId: string }) {
    try {
      const token = await FirebaseAuthClient.getInstance().Auth.currentUser?.getIdToken();
      const resp = await requester<IEvent>({
        option: {
          url: `/api/events/${eventId}`,
          method: 'put',
          headers: {
            authorization: token,
          },
          data: {
            closed: true,
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

  static async orders({ eventId, host = '' }: { eventId: string; host?: string }) {
    try {
      const resp = await requester<OrderWithDocID[]>({
        option: {
          url: `${host}/api/events/${eventId}/orders`,
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

  static async addOrder({ eventId, order }: { eventId: string; order: IEventOrder }) {
    try {
      const token = await FirebaseAuthClient.getInstance().Auth.currentUser?.getIdToken();
      const resp = await requester<OrderWithDocID>({
        option: {
          url: `/api/events/${eventId}/orders`,
          method: 'post',
          headers: {
            authorization: token,
          },
          data: {
            order,
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

  static async deleteOrder({ eventId, guestId }: { eventId: string; guestId: string }) {
    try {
      const token = await FirebaseAuthClient.getInstance().Auth.currentUser?.getIdToken();
      const resp = await requester<void>({
        option: {
          url: `/api/events/${eventId}/orders/${guestId}`,
          method: 'delete',
          headers: {
            authorization: token,
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
