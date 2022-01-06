import { JSONSchema6 } from 'json-schema';

export const JSCAddEvent: JSONSchema6 = {
  definitions: {
    IUsersItem: {
      properties: {
        id: {
          type: 'string',
        },
        displayName: {
          type: 'string',
        },
        email: {
          type: 'string',
        },
        photoURL: {
          type: 'string',
        },
      },
      required: ['uid', 'displayName', 'email', 'photoURL'],
      type: 'object',
    },
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
        desc: {
          type: 'string',
          default: '',
        },
        lastOrder: {
          format: 'date-time',
          type: 'string',
        },
        owner: {
          $ref: '#/definitions/IUsersItem',
        },
        title: {
          type: 'string',
        },
        menus: {
          type: 'array',
          items: {
            $ref: '#/definitions/IBeverage',
          },
        },
      },
      required: ['owner', 'title'],
      type: 'object',
    },
  },
  required: ['body'],
  type: 'object',
};
