import {
  IExecuteFunctions,
  IHttpRequestMethods,
  INodeExecutionData,
  NodeConnectionTypes,
  NodeOperationError,
  type INodeType,
  type INodeTypeDescription,
} from 'n8n-workflow';

import {
  operations as userOperations,
  resources as userResources,
  userNode,
} from './resources/user';

import { ENV } from '../../env';
import { getAccessToken } from '../../shared/authentication';
import { credentials } from '../../shared/constants';
import {
  operations as organizationOperations,
  resources as organizationResources,
  organizationNode,
} from './resources/organization';

export class KeloolaAccounting implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Keloola Accounting',
    name: 'keloolaAccounting',
    icon: 'file:accounting.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Keloola Accounting API',
    defaults: {
      name: 'Keloola Accounting',
    },
    usableAsTool: true,
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [{ name: credentials.name, required: true }],
    requestDefaults: {
      baseURL: ENV.ACCOUNTING_BASE_URL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
    properties: [
      // eslint-disable-next-line n8n-nodes-base/node-param-default-missing
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          ...Object.values(userResources),
          ...Object.values(organizationResources),
        ],
        default: userResources.user.value,
      },
      ...userNode,
      ...organizationNode,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    const token = await getAccessToken(this, ENV.AUTH_BASE_URL);

    let url = '';
    let method: IHttpRequestMethods = 'GET';

    if (resource === userResources.user.value) {
      switch (operation) {
        case userOperations.currentUser.value:
          url = `${ENV.ACCOUNTING_BASE_URL}/user`;
          method = 'GET';
          break;

        default:
          url = '';
          method = 'GET';
          break;
      }
    }

    if (resource === organizationResources.organization.value) {
      switch (operation) {
        case organizationOperations.get.value:
          url = `${ENV.ACCOUNTING_BASE_URL}/users/permission`;
          method = 'POST';
          break;

        default:
          url = '';
          method = 'GET';
          break;
      }
    }

    if (url === '') {
      throw new NodeOperationError(this.getNode(), `No operation found for ${resource}`);
    }

    const response = await this.helpers.httpRequest({
      method,
      url,
      headers: { Authorization: `Bearer ${token}` },
    });

    return [this.helpers.returnJsonArray(response)];
  }
}
