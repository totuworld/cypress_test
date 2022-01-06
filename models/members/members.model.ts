import FirebaseAdmin from '../commons/firebase_admin.model';
import { InMemberInfo } from './in_member_info';

// eslint-disable-next-line camelcase
async function memberFind(args: { user_id: string }): Promise<InMemberInfo | null> {
  const ref = FirebaseAdmin.getInstance().Firestore.collection('members');
  try {
    const userInfoSnap = await ref.doc(args.user_id).get();
    // 정보가 존재하지 않으면 null 반환
    if (userInfoSnap.exists === false) {
      return null;
    }
    return userInfoSnap.data() as InMemberInfo;
  } catch (err) {
    return null;
  }
}

async function memberAdd(args: InMemberInfo): Promise<InMemberInfo | null> {
  const ref = FirebaseAdmin.getInstance().Firestore.collection('members');
  try {
    await ref.doc(args.uid).set({
      ...args,
      id: args.uid,
    });
    return args;
  } catch (err) {
    return null;
  }
}

export default { memberFind, memberAdd };
