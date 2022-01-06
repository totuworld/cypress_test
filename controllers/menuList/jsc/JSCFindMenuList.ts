import { JSONSchema6 } from 'json-schema';

export const JSCFindMenuList: JSONSchema6 = {
  properties: {
    params: {
      properties: {
        menuListId: {
          type: 'string',
        },
      },
      required: ['menuListId'],
    },
  },
  required: ['params'],
  type: 'object',
};
