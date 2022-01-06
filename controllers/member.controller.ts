import { NextApiRequest, NextApiResponse } from 'next';

import { IncomingHttpHeaders } from 'http';
import validateParamWithData from '../models/commons/req_validator';
import { InMemberInfo } from '../models/members/in_member_info';
import JSCMemberAdd from '../models/members/jsc/member.add.jsc';
import JSCMemberFind from '../models/members/jsc/member.find.jsc';
import membersModel from '../models/members/members.model';

import FirebaseAdmin from '../models/commons/firebase_admin.model';
import debug from '../utils/debug_log';
import getStringValueFromQuery from '../utils/get_value_from_query';

const log = debug('masa:controller:members');

/** 멤버 조회 */
async function find({ query, res }: { query: NextApiRequest['query']; res: NextApiResponse }): Promise<void> {
  const userId = getStringValueFromQuery({ query, field: 'id' });
  if (userId === undefined) {
    return res.status(400).end();
  }
  // 요청한 값 확인
  const { result, data } = validateParamWithData<{ id: string }>({ id: userId }, JSCMemberFind);
  if (result === false) {
    return res.status(400).end();
  }
  // db 조회
  const resp = await membersModel.memberFind({ user_id: data.id });
  log(resp);
  if (resp === undefined || resp === null) {
    return res.status(404).end();
  }
  return res.json(resp);
}

/** 멤버 추가 */
async function add({
  headers,
  body,
  res,
}: {
  headers: IncomingHttpHeaders;
  body: InMemberInfo;
  res: NextApiResponse;
}): Promise<void> {
  const token = headers.authorization;
  if (token === undefined) {
    return res.status(400).end();
  }
  try {
    await FirebaseAdmin.getInstance().Auth.verifyIdToken(token);
  } catch (err) {
    return res.status(400).end();
  }

  const { result, data, errorMessage } = validateParamWithData<{
    body: InMemberInfo;
  }>({ body }, JSCMemberAdd);
  if (result === false) {
    return res.status(400).end(errorMessage);
  }
  // 이미 사용자가 존재하는지 확인
  const findResp = await membersModel.memberFind({ user_id: data.body.uid });
  if (!(findResp === undefined || findResp === null)) {
    return res.json(findResp);
  }
  log(body);

  // 새로 추가
  const addResp = await membersModel.memberAdd({ ...body });
  if (addResp === null) {
    return res.status(500).end();
  }
  return res.json(addResp);
}

export default { find, add };
