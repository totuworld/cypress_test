export interface IUpdateEventReq {
  params: {
    eventId: string;
  };
  body: {
    title?: string;
    desc?: string;
    private?: boolean;
    lastOrder?: Date;
    closed?: boolean;
  };
}
