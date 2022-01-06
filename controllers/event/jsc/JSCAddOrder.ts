import { JSONSchema6 } from 'json-schema';

export const JSCAddOrder: JSONSchema6 = {
  definitions: {
    IEventOrder: {
      properties: {
        beverageId: {
          description: '주문 상품',
          type: 'string',
        },
        guestId: {
          description: '주문자',
          type: 'string',
        },
        option: {
          description: '주문에 관한 추가 요청',
          type: 'string',
        },
      },
      required: ['beverageId', 'guestId'],
      type: 'object',
    },
  },
  properties: {
    body: {
      properties: {
        order: { $ref: '#/definitions/IEventOrder' },
      },
      required: ['order'],
      type: 'object',
    },
    params: {
      properties: {
        eventId: {
          type: 'string',
        },
      },
      required: ['eventId'],
      type: 'object',
    },
  },
  required: ['body', 'params'],
  type: 'object',
};
