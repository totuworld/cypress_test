import Ajv from 'ajv';
import { JSONSchema6 } from 'json-schema';
import debug from '../../utils/debug_log';

const log = debug('masa:models:req_validator');

function validateParamWithData<T>(
  param: any,
  schema: JSONSchema6,
): {
  result: boolean;
  data: T;
  errorMessage?: string;
} {
  try {
    const jsonValidator = new Ajv({
      coerceTypes: true,
      useDefaults: true,
      removeAdditional: true,
    });
    const validate = jsonValidator.compile(schema);
    const data = param;
    const valid = validate(data);
    if (valid === false) {
      log(validate.errors);
    }
    const result = typeof valid === 'boolean' ? valid : false;
    return {
      result,
      data,
      errorMessage: typeof valid === 'boolean' && !valid && !!validate.errors ? validate.errors[0].message : '',
    };
  } catch (err) {
    log(err);
    return {
      result: false,
      data: param,
      errorMessage: 'catch validate error',
    };
  }
}

export default validateParamWithData;
