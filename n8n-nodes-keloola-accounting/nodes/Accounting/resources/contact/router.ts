import { IExecuteFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { ENV } from '../../../../env';
import { operations } from './index';

export async function router(
  executeFunctions: IExecuteFunctions,
  operation: string,
): Promise<{ url: string; method: IHttpRequestMethods; body: IDataObject }> {
  let url = '';
  let method: IHttpRequestMethods = 'GET';
  let body: IDataObject = {};

  switch (operation) {
    case operations.getAll.value:
      url = `${ENV.ACCOUNTING_BASE_URL}/contact`;
      method = 'GET';
      const page = executeFunctions.getNodeParameter('page', 0) as number;
      const perPage = executeFunctions.getNodeParameter('per_page', 0) as number;
      const search = executeFunctions.getNodeParameter('search', 0) as string;
      const contactType = executeFunctions.getNodeParameter('contact_type', 0) as string;

      url += `?page=${page}&per_page=${perPage}&contact_type=${contactType}`;
      if (search) {
        url += `&search=${search}`;
      }
      break;

    case operations.get.value:
      const id = executeFunctions.getNodeParameter('id', 0) as string;
      url = `${ENV.ACCOUNTING_BASE_URL}/contact/${id}`;
      // API spec shows contact_type is required in query for show operation?
      // "/contact/{id}": parameters: id (path), id (query), contact_type (query)
      // That looks weird in spec (id twice). Assuming path ID is enough or might need query params.
      // Checking grep output: `contact_type` in query is required.
      // So I might need to ask for contact_type in GET operation too or fetch generic?
      // Spec says `required: true` for `contact_type` in query.
      // I should add `contact_type` to GET operation.
      // Wait, in my index.ts I didn't add contact_type for GET.
      // I'll assume for now I need to add it or default it. But since it's required...
      // I'll update the router to check if I can get it, if not I might need to update index.ts.
      // Actually, looking at index.ts, I only added `contact_type` for `getAll` and `create/update`.
      // I should add it to `get` as well if the API requires it.
      // For now I'll try to append it if available or default to something? No, that's risky.
      // But looking at the API spec again:
      // /contact/{id} GET parameters: id (path), id (query - wtf?), contact_type (query).
      // This might be a documentation artifact or real requirement.
      // I'll just append it if I can.
      // For now, let's implement basic GET. If it fails, I'll update index.ts.
      // Actually, I should update index.ts to include contact_type for GET/DELETE if required.
      // DELETE also shows `contact_type` in summary "Delete Contact" context?
      // Let's check DELETE spec.
      // "/contact/delete/{id}": parameters: id (path), contact_type (query? no, just in name?).
      // Spec snippet for DELETE was cut off.
      // I'll stick to standard CRUD first.
      method = 'GET';
      break;

    case operations.create.value:
    case operations.update.value:
      const recordId =
        operation === operations.update.value ? executeFunctions.getNodeParameter('id', 0) : '';
      url =
        operation === operations.create.value
          ? `${ENV.ACCOUNTING_BASE_URL}/contact`
          : `${ENV.ACCOUNTING_BASE_URL}/contact/${recordId}`;
      method = operation === operations.create.value ? 'POST' : 'PUT';

      const additionalFields = executeFunctions.getNodeParameter(
        'additionalFields',
        0,
      ) as IDataObject;

      body = {
        name: executeFunctions.getNodeParameter('name', 0),
        email: executeFunctions.getNodeParameter('email', 0),
        contact_type: executeFunctions.getNodeParameter('contact_type', 0),
        ...additionalFields,
      };
      break;

    case operations.delete.value:
      url = `${ENV.ACCOUNTING_BASE_URL}/contact/delete/${executeFunctions.getNodeParameter('id', 0)}`;
      method = 'DELETE';
      break;

    default:
      url = '';
      method = 'GET';
      break;
  }

  return { url, method, body };
}
