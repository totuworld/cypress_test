import { requester, Resp } from '../../services/requester';
import { getBaseUrl } from '../../utils/get_baseurl';
import { InMemberInfo } from './in_member_info';

// eslint-disable-next-line camelcase
export async function memberFind(args: { member_id: string; isServer: boolean }): Promise<Resp<InMemberInfo | null>> {
  const { isServer } = args;
  const hostAndPort: string = getBaseUrl(isServer);
  const url = `${hostAndPort}/api/members/${args.member_id}`;
  try {
    const resp = await requester<InMemberInfo | null>({
      option: {
        url,
        method: 'get',
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
}

export async function memberAdd(args: {
  data: InMemberInfo;
  token: string;
  isServer: boolean;
}): Promise<Resp<InMemberInfo | null>> {
  const { isServer } = args;
  const hostAndPort: string = getBaseUrl(isServer);
  const url = `${hostAndPort}/api/members`;
  try {
    const resp = await requester<InMemberInfo | null>({
      option: {
        url,
        method: 'post',
        data: args.data,
        headers: { authorization: args.token },
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
}
