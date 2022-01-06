import { NextApiRequest, NextApiResponse } from 'next';
import debug from '../../../utils/debug_log';

import memberController from '../../../controllers/member.controller';

const log = debug('masa:api:members:index');

/** 멤버 root */
export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // eslint-disable-next-line no-console
  const { method } = req;
  log(method);
  if (method !== 'POST') {
    res.status(404).end();
  }
  if (method === 'POST') {
    await memberController.add({ headers: req.headers, body: req.body, res });
  }
}
