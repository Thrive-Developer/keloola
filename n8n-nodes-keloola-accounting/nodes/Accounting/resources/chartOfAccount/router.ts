import { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { ENV } from '../../../../env';
import { operations } from './index';

function getOptionalFields(executeFunctions: IExecuteFunctions, body: IDataObject): IDataObject {
  const tax = executeFunctions.getNodeParameter('tax', 0, '') as string;
  if (tax) body.tax = tax;
  const account = executeFunctions.getNodeParameter('account', 0, '') as string;
  if (account) body.account = account;
  const description = executeFunctions.getNodeParameter('description', 0, '') as string;
  if (description) body.description = description;
  const currency = executeFunctions.getNodeParameter('currency', 0, '') as string;
  if (currency) body.currency = currency;
  return body;
}

export async function router(
  executeFunctions: IExecuteFunctions,
  operation: string,
): Promise<{ url: string; method: IHttpRequestMethods; body: IDataObject }> {
  let url = '';
  let method: IHttpRequestMethods = 'GET';
  let body: IDataObject = {};

  switch (operation) {
    case operations.getAll.value: {
      const page = executeFunctions.getNodeParameter('page', 0, 1) as number;
      url = `${ENV.ACCOUNTING_BASE_URL}/chart-of-account?page=${page}`;
      method = 'GET';
      break;
    }

    case operations.getTypes.value:
      url = `${ENV.ACCOUNTING_BASE_URL}/chart-of-account-type`;
      method = 'GET';
      break;

    case operations.create.value:
      url = `${ENV.ACCOUNTING_BASE_URL}/chart-of-account`;
      method = 'POST';
      body = {
        name: executeFunctions.getNodeParameter('name', 0) as string,
        code: executeFunctions.getNodeParameter('code', 0) as number,
        type: executeFunctions.getNodeParameter('type', 0) as string,
        details: executeFunctions.getNodeParameter('details', 0) as string,
      };
      body = getOptionalFields(executeFunctions, body);
      break;

    case operations.get.value:
      url = `${ENV.ACCOUNTING_BASE_URL}/chart-of-account/${executeFunctions.getNodeParameter('id', 0)}`;
      method = 'GET';
      break;

    case operations.update.value:
      url = `${ENV.ACCOUNTING_BASE_URL}/chart-of-account/${executeFunctions.getNodeParameter('id', 0)}`;
      method = 'PUT';
      body = {
        name: executeFunctions.getNodeParameter('name', 0) as string,
        code: executeFunctions.getNodeParameter('code', 0) as number,
        type: executeFunctions.getNodeParameter('type', 0) as string,
        details: executeFunctions.getNodeParameter('details', 0) as string,
        is_enable: executeFunctions.getNodeParameter('isEnable', 0, true) as boolean,
      };
      body = getOptionalFields(executeFunctions, body);
      break;

    case operations.delete.value:
      url = `${ENV.ACCOUNTING_BASE_URL}/chart-of-account/delete/${executeFunctions.getNodeParameter('id', 0)}`;
      method = 'DELETE';
      break;

    default:
      url = '';
      method = 'GET';
      break;
  }

  return { url, method, body };
}
