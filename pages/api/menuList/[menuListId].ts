import MenuListController from '@/controllers/menuList/menu_list.controller';
import { NextApiRequest, NextApiResponse } from 'next';
import debug from '../../../utils/debug_log';

const log = debug('masa:api:menuList:[userId]:[menuListId]');

export default async function handle(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // eslint-disable-next-line no-console
  const { method } = req;
  log(method);
  const supportMethod = ['PUT'];
  if (supportMethod.indexOf(method!) === -1) {
    return res.status(400).end();
  }
  if (method === 'PUT') {
    await MenuListController.updateMenuList(req, res);
  }
}
