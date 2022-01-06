import debug from '../utils/debug_log';
import { IBeverage } from './interface/IEvent';

import FirebaseAdmin from './commons/firebase_admin.model';

const COLLECTION_NAME = 'beverages';

const log = debug('masa:model:beverages');
class BeveragesType {
  private BEVERAGE_NAMES = 'names';

  private beverages: IBeverage[];

  private BeveragesStore: FirebaseFirestore.CollectionReference;

  constructor() {
    this.beverages = [];
    this.BeveragesStore = FirebaseAdmin.getInstance().Firestore.collection(COLLECTION_NAME);
  }

  BeverageDoc(beverageId: string) {
    return this.BeveragesStore.doc(beverageId);
  }

  /** 음료 전체 조회 */
  async findAll(): Promise<IBeverage[]> {
    if (this.beverages.length > 0) {
      return this.beverages;
    }
    const snaps = await this.BeveragesStore.get();
    const datas = snaps.docs
      .filter((fv) => fv.id !== this.BEVERAGE_NAMES)
      .map((mv) => {
        const returnData = {
          ...mv.data(),
          id: mv.id,
        } as IBeverage;
        return returnData;
      });
    this.beverages = datas;
    return this.beverages;
  }

  async addToCache(data: IBeverage) {
    if (this.beverages.length > 0) {
      this.beverages.push(data);
      return this.beverages;
    }
    const snaps = await this.BeveragesStore.get();
    const datas = snaps.docs
      .filter((fv) => fv.id !== this.BEVERAGE_NAMES)
      .map((mv) => {
        const returnData = {
          ...mv.data(),
          id: mv.id,
        } as IBeverage;
        return returnData;
      });
    this.beverages = [...datas, data];
    return this.beverages;
  }

  /** 음료 조회 */
  async find({ beverageId }: { beverageId: string }): Promise<IBeverage> {
    const eventSnap = await this.BeverageDoc(beverageId).get();
    return {
      ...eventSnap.data(),
      id: eventSnap.id,
    } as IBeverage;
  }

  /** 음료 생성 */
  async add(args: { title: string; alias?: string }) {
    log(args);
    const namesDocRef = this.BeverageDoc(this.BEVERAGE_NAMES);
    const namesDoc = await namesDocRef.get();
    // 기존에 추가되어있는지 확인
    if (namesDoc.exists === true) {
      const nameArr = namesDoc.data() as {
        names: { title: string; id: string }[];
      };
      if (nameArr.names) {
        const findBeverage = nameArr.names.find((fv) => fv.title === args.title);
        if (findBeverage) {
          return findBeverage;
        }
      }
    }
    // 추가
    const result = await this.BeveragesStore.add({
      title: args.title,
      alias: args.alias ?? '',
    });
    const addData = { title: args.title, id: result.id };
    await this.addToCache(addData);
    await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
      // names 문서를 불러온다.
      const doc = await transaction.get(namesDocRef);
      const nameArr =
        doc.exists === false // names 문서나?
          ? { names: [] } // 없다면 빈 배열을 가진다.
          : // 있다면 data에서 값을 읽어드린다.
            (namesDoc.data() as {
              names: { title: string; id: string }[];
            });
      const newNameArr = [...nameArr.names, { title: args.title, id: result.id }];
      // addToCache와 상관없이 읽어드린 db 문서를 기준으로 값을 넣는다.
      transaction.set(namesDocRef, { names: newNameArr });
    });
    return {
      id: result.id,
      title: args.title,
    };
  }
}

export const Beverages = new BeveragesType();
