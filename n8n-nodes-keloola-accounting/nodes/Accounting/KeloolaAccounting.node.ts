import {
  IExecuteFunctions,
  IHttpRequestMethods,
  INodeExecutionData,
  NodeConnectionTypes,
  NodeOperationError,
  type IDataObject,
  type INodeType,
  type INodeTypeDescription,
} from 'n8n-workflow';

import {
  operations as userOperations,
  resources as userResources,
  userNode,
} from './resources/user';
import { resources as unitResources, router as unitRouter, unitNode } from './resources/unit';
import {
  categoryNode,
  resources as categoryResources,
  router as categoryRouter,
} from './resources/category';
import {
  chartOfAccountNode,
  resources as chartOfAccountResources,
  router as chartOfAccountRouter,
} from './resources/chartOfAccount';
import {
  operations as organizationOperations,
  resources as organizationResources,
  organizationNode,
} from './resources/organization';

import { ENV } from '../../env';
import { getAccessToken } from '../../shared/authentication';
import { credentials } from '../../shared/constants';

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
          ...Object.values(unitResources),
          ...Object.values(categoryResources),
          ...Object.values(chartOfAccountResources),
        ],
        default: userResources.user.value,
      },
      ...userNode,
      ...organizationNode,
      ...unitNode,
      ...categoryNode,
      ...chartOfAccountNode,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    const token = await getAccessToken(this, ENV.AUTH_BASE_URL);

    let url = '';
    let method: IHttpRequestMethods = 'GET';
    let body: IDataObject = {};

    if (resource === userResources.user.value) {
      switch (operation) {
        case userOperations.currentUser.value:
          url = `${ENV.AUTH_BASE_URL}/user`;
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

    if (resource === unitResources.unit.value) {
      const routing = await unitRouter(this, operation);
      url = routing.url;
      method = routing.method;
      body = routing.body;
    }

    if (resource === categoryResources.category.value) {
      const routing = await categoryRouter(this, operation);
      url = routing.url;
      method = routing.method;
      body = routing.body;
    }

    if (resource === chartOfAccountResources.chartOfAccount.value) {
      const routing = await chartOfAccountRouter(this, operation);
      url = routing.url;
      method = routing.method;
      body = routing.body;
    }

    if (url === '') {
      throw new NodeOperationError(this.getNode(), `No operation found for ${resource}`);
    }

    const response = await this.helpers.httpRequest({
      method,
      url,
      body,
      headers: { Authorization: `Bearer ${token}` },
    });

    return [this.helpers.returnJsonArray(response)];
  }
}
