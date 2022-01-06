import { NextApiRequest, NextApiResponse } from 'next';
import debug from '../../../utils/debug_log';

import beverageController from '../../../controllers/beverage/beverage.controller';

const log = debug('masa:api:beverages:index');

/** 음료 root */
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // eslint-disable-next-line no-console
  const { method } = req;
  log(method);
  if (!(method === 'POST' || method === 'GET')) {
    res.status(404).end();
  }
  if (method === 'GET') {
    await beverageController.findAllBeverage(req, res);
  }
  if (method === 'POST') {
    await beverageController.addBeverage(req, res);
  }
}
