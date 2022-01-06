import { NextApiRequest as Request, NextApiResponse as Response } from 'next';
import FirebaseAdmin from '../../models/commons/firebase_admin.model';
import { Beverages } from '../../models/beverages.model';
import validateParamWithData from '../../models/commons/req_validator';
import { IAddBeverageReq } from './interface/IAddBeverage';
import { JSCAddBeverage } from './jsc/JSCAddBeverage';

export default class BeverageController {
  static async addBeverage(req: Request, res: Response) {
    const token = req.headers.authorization;
    if (token === undefined) {
      return res.status(400).end();
    }
    try {
      await FirebaseAdmin.getInstance().Auth.verifyIdToken(token);
    } catch (err) {
      return res.status(400).end();
    }
    const validateReq = validateParamWithData<IAddBeverageReq>(
      {
        body: req.body,
      },
      JSCAddBeverage,
    );
    if (validateReq.result === false) {
      return res.status(400).json({
        text: validateReq.errorMessage,
      });
    }
    try {
      const result = await Beverages.add({ ...validateReq.data.body });
      return res.json(result);
    } catch (err) {
      return res.status(500).send(err.toString());
    }
  }

  static async findAllBeverage(_: Request, res: Response) {
    try {
      const result = await Beverages.findAll();
      return res.json(result);
    } catch (err) {
      return res.status(500).send(err.toString());
    }
  }
}
