import { JSONSchema6 } from 'json-schema';

export const JSCAddBeverage: JSONSchema6 = {
  properties: {
    body: {
      properties: {
        title: {
          type: 'string',
        },
        alias: {
          type: 'string',
        },
      },
      required: ['title'],
      type: 'object',
    },
  },
  required: ['body'],
  type: 'object',
};
