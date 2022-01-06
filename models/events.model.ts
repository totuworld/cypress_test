import debug from '../utils/debug_log';

import FirebaseAdmin from './commons/firebase_admin.model';
import { IBeverage, IEvent, IEventOrder } from './interface/IEvent';
import { InMemberInfo } from './members/in_member_info';

type OrderWithDocID = IEventOrder & { docId: string };

const COLLECTION_NAME = 'events';

const log = debug('masa:model:Events');
class EventType {
  private orders: Map<string, OrderWithDocID[]>;

  private EventsStore: FirebaseFirestore.CollectionReference;

  constructor() {
    this.orders = new Map();
    this.EventsStore = FirebaseAdmin.getInstance().Firestore.collection(COLLECTION_NAME);
  }

  EventDoc(eventId: string) {
    return this.EventsStore.doc(eventId);
  }

  OrdersCollection(eventId: string) {
    return this.EventsStore.doc(eventId).collection('orders');
  }

  async findAll(): Promise<IEvent[]> {
    const eventListSnap = await this.EventsStore.get();

    const data = eventListSnap.docs;
    const now = new Date();

    const allEvent: IEvent[] = data.reduce((acc: IEvent[], doc) => {
      const innerData = doc.data() as IEvent;
      // 마지막 주문 시간이 있나?
      if (innerData.lastOrder !== undefined) {
        const closedDate = new Date(innerData.lastOrder);
        if (now.getTime() >= closedDate.getTime()) {
          // 마지막 주문 시간이 지났다.
          return acc;
        }
      }
      if (innerData.closed !== undefined && innerData.closed === false) {
        acc.push({ ...innerData, id: doc.id });
      }
      return acc;
    }, []);
    return allEvent;
  }

  /** 이벤트 조회 */
  async find({ eventId }: { eventId: string }): Promise<IEvent & { id: string }> {
    try {
      const eventSnap = await this.EventDoc(eventId).get();
      log(eventSnap.exists);
      if (eventSnap.exists === false) {
        throw new Error('not exist event');
      }
      return {
        ...eventSnap.data(),
        id: eventId,
      } as IEvent & { id: string };
    } catch (err) {
      log(err);
      throw err;
    }
  }

  /** 이벤트 생성 */
  async add(args: {
    title: string;
    desc: string;
    owner: InMemberInfo;
    lastOrder?: Date;
    menus?: IBeverage[];
  }): Promise<IEvent> {
    log(args);
    try {
      const addData: Omit<IEvent, 'id'> = {
        title: args.title,
        desc: args.desc,
        ownerId: args.owner.uid,
        ownerName: args.owner.displayName ?? '',
        closed: false,
      };
      if (args.lastOrder) {
        addData.lastOrder = args.lastOrder;
      }
      if (args.menus !== undefined) {
        addData.menus = args.menus;
      }
      const result = await this.EventsStore.add(addData);
      return {
        id: result.id,
        title: args.title,
        desc: args.desc,
        lastOrder: args.lastOrder,
        ownerId: args.owner.uid,
        ownerName: args.owner.displayName ?? '',
        menus: args.menus ?? [],
        closed: false,
      };
    } catch (err) {
      log(err);
      throw err;
    }
  }

  async update(args: {
    id: string;
    title?: string;
    desc?: string;
    private?: boolean;
    lastOrder?: Date;
    closed?: boolean;
  }) {
    const findResult = await this.find({ eventId: args.id });
    log(findResult);
    if (findResult === undefined || findResult === null) {
      throw new Error('not exist event');
    }
    try {
      const updateData = {
        ...findResult,
        ...args,
      };
      const eventSnap = this.EventDoc(args.id);
      await eventSnap.update(updateData);
      const updateFindResult = await this.find({ eventId: args.id });
      return updateFindResult;
    } catch (err) {
      log(err);
      throw err;
    }
  }

  /** 주문 목록 */
  async findOrders({ eventId }: { eventId: string }) {
    if (this.orders.has(eventId)) {
      log('findOrders - cache get');
      return this.orders.get(eventId);
    }
    return this.updateCache({ eventId });
  }

  async updateCache({ eventId }: { eventId: string }) {
    const orderCollection = this.OrdersCollection(eventId);
    const allQueueSnap = await orderCollection.get();
    const datas = allQueueSnap.docs.map((mv) => {
      const returnData = {
        ...mv.data(),
        docId: mv.id,
      } as OrderWithDocID;
      return returnData;
    });
    log('findOrders - cache set');
    this.orders.set(eventId, datas);
    return datas;
  }

  /** 주문 추가 */
  async addOrder(args: { eventId: string; order: IEventOrder }) {
    const eventDoc = this.EventDoc(args.eventId);
    const orderCollection = this.OrdersCollection(args.eventId);
    const oldDoc = orderCollection.doc(args.order.guestId);

    await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
      const doc = await transaction.get(eventDoc);
      if (doc.exists === false) {
        throw new Error('not exist event');
      }
      const docData = doc.data() as IEvent;
      if (docData.closed !== undefined && docData.closed === true) {
        throw new Error('closed event');
      }
      if (docData.lastOrder !== undefined) {
        const now = new Date();
        const closedDate = new Date(docData.lastOrder);
        if (now.getTime() >= closedDate.getTime()) {
          throw new Error('closed event');
        }
      }
      await transaction.set(oldDoc, {
        ...args.order,
        id: args.order.guestId,
      });
    });
    const returnData = {
      ...args.order,
      id: args.order.guestId,
      docId: args.order.guestId,
    } as OrderWithDocID;
    if (this.orders.has(args.eventId) === false) {
      await this.findOrders({ eventId: args.eventId });
    }
    const updateArr = this.orders.get(args.eventId);
    // 기존에 데이터가 없다면?
    if (updateArr === undefined) {
      this.orders.set(args.eventId, [returnData]);
      return returnData;
    }
    const findIdx = updateArr.findIndex((fv) => fv.guestId === args.order.guestId);
    // 이미 주문한 내용이 있는가?
    if (findIdx >= 0) {
      updateArr[findIdx] = returnData;
    } else {
      updateArr.push(returnData);
    }
    this.orders.set(args.eventId, updateArr);
    return returnData;
  }

  /** 주문 제거 */
  async removeOrder(args: { eventId: string; guestId: string }) {
    // 주문 마감 여부는 이미 체크했다는 전제
    if (this.orders.has(args.eventId) === false) {
      await this.findOrders({ eventId: args.eventId });
    }
    const updateArr = this.orders.get(args.eventId);
    // 기존에 데이터가 없다면?
    if (updateArr === undefined) {
      return;
    }
    const findIdx = updateArr.findIndex((fv) => fv.guestId === args.guestId);
    // 주문이 있을 때만!
    if (findIdx >= 0) {
      await this.OrdersCollection(args.eventId).doc(args.guestId).delete();
      await this.updateCache({ eventId: args.eventId });
    }
  }
}

export const Events = new EventType();
