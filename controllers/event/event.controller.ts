import { NextApiRequest as Request, NextApiResponse as Response } from 'next';

import debug from '../../utils/debug_log';
import validateParamWithData from '../../models/commons/req_validator';

import { IAddEventReq } from './interface/IAddEventReq';
import { IAddOrderReq } from './interface/IAddOrderReq';
import { IFindEventReq } from './interface/IFindEventReq';
import { IRemoveOrderReq } from './interface/IRemoveOrderReq';
import { IUpdateEventReq } from './interface/IUpdateEventReq';
import { JSCAddEvent } from './jsc/JSCAddEvent';
import { JSCAddOrder } from './jsc/JSCAddOrder';
import { JSCFindEvent } from './jsc/JSCFindEvent';
import { JSCRemoveOrder } from './jsc/JSCRemoveOrder';
import { JSCUpdateEvent } from './jsc/JSCUpdateEvent';
import { Events } from '../../models/events.model';
import FirebaseAdmin from '../../models/commons/firebase_admin.model';

const log = debug('massa:controller:event');

export default class EventController {
  static async addEvent(req: Request, res: Response) {
    const token = req.headers.authorization;
    if (token === undefined) {
      return res.status(400).end();
    }
    try {
      await FirebaseAdmin.getInstance().Auth.verifyIdToken(token);
    } catch (err) {
      return res.status(400).end();
    }
    log(req.body);
    const validateReq = validateParamWithData<IAddEventReq>(
      {
        body: req.body,
      },
      JSCAddEvent,
    );
    if (validateReq.result === false) {
      return res.status(400).json({
        text: validateReq.errorMessage,
      });
    }

    // 이벤트 생성
    try {
      const reqParams = {
        ...validateReq.data.body,
        desc: validateReq.data.body.desc !== undefined ? validateReq.data.body.desc : '',
      };
      const result = await Events.add(reqParams);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500);
    }
  }

  static async updateEvent(req: Request, res: Response) {
    const token = req.headers.authorization;
    if (token === undefined) {
      return res.status(400).end();
    }
    let userId = '';
    try {
      const decodedIdToken = await FirebaseAdmin.getInstance().Auth.verifyIdToken(token);
      userId = decodedIdToken.uid;
    } catch (err) {
      return res.status(400).end();
    }
    const validateReq = validateParamWithData<IUpdateEventReq>(
      {
        params: req.query,
        body: req.body,
      },
      JSCUpdateEvent,
    );
    log(req.body);
    if (validateReq.result === false) {
      return res.status(400).json({
        text: validateReq.errorMessage,
      });
    }

    // 이벤트 수정
    try {
      const eventInfo = await Events.find({
        eventId: validateReq.data.params.eventId,
      });
      log({ ownerId: eventInfo.ownerId, userId });
      if (eventInfo.ownerId !== userId) {
        return res.status(401).json({
          text: '이벤트 수정 권한이 없습니다',
        });
      }
      const reqParams = {
        ...validateReq.data.body,
        id: validateReq.data.params.eventId,
      };
      log(validateReq.data.body);
      const result = await Events.update(reqParams);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500);
    }
  }

  static async findAllEvent(_: Request, res: Response) {
    try {
      const result = await Events.findAll();

      res.json(result);
    } catch (err) {
      return res.status(404).end();
    }
  }

  static async findEvent(req: Request, res: Response) {
    const validateReq = validateParamWithData<IFindEventReq>(
      {
        params: req.query,
      },
      JSCFindEvent,
    );
    if (validateReq.result === false) {
      return res.status(400).json({
        text: validateReq.errorMessage,
      });
    }
    try {
      const result = await Events.find({
        eventId: validateReq.data.params.eventId,
      });
      // 주문 마감 시간이 없다면 바로 결과 반환
      if (result.lastOrder === undefined) {
        return res.json(result);
      }
      const now = new Date();
      const closedDate = new Date(result.lastOrder);
      if (now.getTime() >= closedDate.getTime()) {
        return res.json({ ...result, closed: true });
      }
      res.json(result);
    } catch (err) {
      return res.status(404).end();
    }
  }

  static async addOrder(req: Request, res: Response) {
    const token = req.headers.authorization;
    if (token === undefined) {
      return res.status(400).end();
    }
    try {
      await FirebaseAdmin.getInstance().Auth.verifyIdToken(token);
    } catch (err) {
      return res.status(400).end();
    }
    const validateReq = validateParamWithData<IAddOrderReq>(
      {
        params: req.query,
        body: req.body,
      },
      JSCAddOrder,
    );
    if (validateReq.result === false) {
      return res.status(400).send({
        text: validateReq.errorMessage,
      });
    }
    try {
      const info = await Events.find({
        eventId: validateReq.data.params.eventId,
      });
      if (info.closed === true) {
        return res.status(400).send('event closed');
      }
      const result = await Events.addOrder({
        eventId: validateReq.data.params.eventId,
        order: validateReq.data.body.order,
      });
      return res.json(result);
    } catch (err) {
      return res.status(500).send(err.toString());
    }
  }

  static async deleteOrder(req: Request, res: Response) {
    const token = req.headers.authorization;
    if (token === undefined) {
      return res.status(400).end();
    }
    try {
      await FirebaseAdmin.getInstance().Auth.verifyIdToken(token);
    } catch (err) {
      return res.status(400).end();
    }
    const validateReq = validateParamWithData<IRemoveOrderReq>(
      {
        params: req.query,
      },
      JSCRemoveOrder,
    );
    if (validateReq.result === false) {
      return res.status(400).json({
        text: validateReq.errorMessage,
      });
    }
    try {
      const info = await Events.find({
        eventId: validateReq.data.params.eventId,
      });
      if (info.closed === true) {
        return res.status(400).send('event closed');
      }
      await Events.removeOrder({
        eventId: validateReq.data.params.eventId,
        guestId: validateReq.data.params.guestId,
      });
      return res.end();
    } catch (err) {
      return res.status(500).send(err.toString());
    }
  }

  static async findOrders(req: Request, res: Response) {
    const validateReq = validateParamWithData<IFindEventReq>(
      {
        params: req.query,
      },
      JSCFindEvent,
    );
    if (validateReq.result === false) {
      return res.status(400).json({
        text: validateReq.errorMessage,
      });
    }
    try {
      await Events.find({
        eventId: validateReq.data.params.eventId,
      });
      const result = await Events.findOrders({
        eventId: validateReq.data.params.eventId,
      });
      return res.json(result);
    } catch (err) {
      return res.status(500).send(err.toString());
    }
  }
}
