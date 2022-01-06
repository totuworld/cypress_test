import { JSONSchema6 } from 'json-schema';

export const JSCRemoveOrder: JSONSchema6 = {
  properties: {
    params: {
      properties: {
        eventId: {
          type: 'string',
        },
        guestId: {
          description: '주문자',
          type: 'string',
        },
      },
      required: ['eventId', 'guestId'],
      type: 'object',
    },
  },
  required: ['params'],
  type: 'object',
};
