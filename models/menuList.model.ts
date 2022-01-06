import FirebaseAdmin from './commons/firebase_admin.model';
import { IBeverage } from './interface/IEvent';
import { IMenuListItem } from './interface/IMenuListItem';

const COLLECTION_NAME = 'menu_list';

class MenuListType {
  private menuList: IMenuListItem[];

  private MenuListStore: FirebaseFirestore.CollectionReference;

  constructor() {
    this.menuList = [];
    this.MenuListStore = FirebaseAdmin.getInstance().Firestore.collection(COLLECTION_NAME);
  }

  MenuListDoc(menuListId: string) {
    return this.MenuListStore.doc(menuListId);
  }

  /** 특정 사용자의 메뉴판 목록 조회  */
  async findAllByOwnerId({ ownerId }: { ownerId: string }) {
    if (this.menuList.length > 0) {
      return this.menuList.filter((fv) => fv.ownerId === ownerId);
    }
    const snaps = await this.MenuListStore.where('ownerId', '==', ownerId).get();
    const data = snaps.docs.map((mv) => {
      const returnData = {
        ...mv.data(),
        id: mv.id,
      } as IMenuListItem;
      return returnData;
    });
    return data;
  }

  async find({ menuListId }: { menuListId: string }): Promise<IMenuListItem> {
    if (this.menuList.length > 0) {
      const findData = this.menuList.find((fv) => fv.id === menuListId);
      if (findData !== undefined) return findData;
    }
    const doc = await this.MenuListDoc(menuListId).get();
    return {
      ...doc.data(),
      id: doc.id,
    } as IMenuListItem;
  }

  async add({ title, desc, ownerId, menu }: Omit<IMenuListItem, 'id'>): Promise<IMenuListItem> {
    const addData: Omit<IMenuListItem, 'id'> = {
      title,
      ownerId,
      menu,
    };
    if (desc !== undefined) {
      addData.desc = desc;
    }
    // 추가
    const result = await this.MenuListStore.add(addData);
    return {
      id: result.id,
      title,
      desc,
      ownerId,
      menu,
    };
  }

  async update({
    ownerId,
    id,
    title,
    desc,
    menu,
  }: {
    ownerId: string;
    id: string;
    title?: string;
    desc?: string;
    menu?: IBeverage[];
  }) {
    const docRef = this.MenuListDoc(id);
    await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      if (doc.exists === false) {
        throw new Error('not exist');
      }
      const oldDoc = doc.data() as Omit<IMenuListItem, 'id'>;
      if (ownerId !== oldDoc.ownerId) {
        throw new Error('수정할 권한이 없음');
      }
      const setData: Omit<IMenuListItem, 'id'> = {
        ...oldDoc,
      };
      if (title !== undefined) {
        setData.title = title;
      }
      if (desc !== undefined) {
        setData.desc = desc;
      }
      if (menu !== undefined) {
        setData.menu = menu;
      }
      await transaction.set(docRef, setData);
    });
  }

  async delete({ menuListId }: { menuListId: string }) {
    await this.MenuListDoc(menuListId).delete();
  }
}

export const MenuListModel = new MenuListType();
