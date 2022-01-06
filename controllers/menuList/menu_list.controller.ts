import { NextApiRequest as Request, NextApiResponse as Response } from 'next';
import { IBeverage } from '../../models/interface/IEvent';
import { IMenuListItem } from '../../models/interface/IMenuListItem';
import { MenuListModel } from '../../models/menuList.model';
import FirebaseAdmin from '../../models/commons/firebase_admin.model';
import validateParamWithData from '../../models/commons/req_validator';
import { JSCFindMenuList } from './jsc/JSCFindMenuList';
import { JSCAddMenuList } from './jsc/JSCAddMenuList';
import { JSCUpdateMenuList } from './jsc/JSCUpdateMenuList';

export default class MenuListController {
  static async findAllByOwnerId(req: Request, res: Response) {
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
    if (userId === '') {
      return res.status(401).json({
        text: '조회할 권한이 없습니다',
      });
    }
    try {
      const menuListResp = await MenuListModel.findAllByOwnerId({ ownerId: userId });
      return res.status(200).json(menuListResp);
    } catch (err) {
      return res.status(500).send(err.toString());
    }
  }

  static async findMenuList(req: Request, res: Response) {
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
    const validateReq = validateParamWithData<{ params: { menuListId: string } }>(
      {
        params: req.query,
      },
      JSCFindMenuList,
    );
    if (validateReq.result === false) {
      return res.status(400).json({
        text: validateReq.errorMessage,
      });
    }
    try {
      const result = await MenuListModel.find({
        menuListId: validateReq.data.params.menuListId,
      });
      if (userId !== result.ownerId) {
        return res.status(401).json({
          text: '조회할 권한이 없습니다',
        });
      }
      res.json(result);
    } catch (err) {
      return res.status(500).send(err.toString());
    }
  }

  static async addMenuList(req: Request, res: Response) {
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
    const validateReq = validateParamWithData<{ body: Pick<IMenuListItem, 'title' | 'desc' | 'menu'> }>(
      {
        body: req.body,
      },
      JSCAddMenuList,
    );
    if (validateReq.result === false) {
      return res.status(400).json({
        text: validateReq.errorMessage,
      });
    }
    try {
      console.log(validateReq.data.body);
      const result = await MenuListModel.add({ ...validateReq.data.body, ownerId: userId });
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).send(err.toString());
    }
  }

  static async updateMenuList(req: Request, res: Response) {
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
    const validateReq = validateParamWithData<{
      params: { menuListId: string };
      body: { title?: string; desc?: string; menu?: IBeverage[] };
    }>(
      {
        params: req.query,
        body: req.body,
      },
      JSCUpdateMenuList,
    );
    if (validateReq.result === false) {
      return res.status(400).json({
        text: validateReq.errorMessage,
      });
    }
    try {
      const { title, desc, menu } = validateReq.data.body;
      await MenuListModel.update({ ownerId: userId, id: validateReq.data.params.menuListId, title, desc, menu });
      return res.status(200).end();
    } catch (err) {
      return res.status(500).send(err.toString());
    }
  }
}
