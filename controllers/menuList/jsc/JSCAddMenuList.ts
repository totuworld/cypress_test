import { JSONSchema6 } from 'json-schema';

export const JSCAddMenuList: JSONSchema6 = {
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
    body: {
      properties: {
        title: {
          type: 'string',
        },
        desc: {
          type: 'string',
        },
        menu: {
          type: 'array',
          items: {
            $ref: '#/definitions/IBeverage',
          },
        },
      },
      required: ['title', 'menu'],
      type: 'object',
    },
  },
  required: ['body'],
  type: 'object',
};
