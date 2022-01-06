import { JSONSchema6 } from 'json-schema';

export const JSCUpdateMenuList: JSONSchema6 = {
  definitions: {
    IBeverage: {
      properties: {
        id: {
          type: 'string',
        },
        title: {
          type: 'string',
        },
        alias: {
          type: 'string',
        },
      },
      required: ['id', 'title'],
      type: 'object',
    },
  },
  properties: {
    params: {
      properties: {
        menuListId: {
          type: 'string',
        },
      },
      required: ['menuListId'],
    },
    body: {
      properties: {
        title: {
          type: 'string',
        },
        desc: {
          type: 'string',
        },
        menus: {
          type: 'array',
          items: {
            $ref: '#/definitions/IBeverage',
          },
        },
      },
      required: [],
      type: 'object',
    },
  },
  required: ['params', 'body'],
  type: 'object',
};
