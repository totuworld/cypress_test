import { JSONSchema6 } from 'json-schema';

export const JSCUpdateEvent: JSONSchema6 = {
  properties: {
    params: {
      properties: {
        eventId: {
          type: 'string',
        },
      },
      required: ['eventId'],
    },
    body: {
      properties: {
        desc: {
          type: 'string',
        },
        lastOrder: {
          format: 'date-time',
          type: 'string',
        },
        title: {
          type: 'string',
        },
        closed: {
          type: 'boolean',
        },
      },
      type: 'object',
    },
  },
  required: ['params', 'body'],
  type: 'object',
};
