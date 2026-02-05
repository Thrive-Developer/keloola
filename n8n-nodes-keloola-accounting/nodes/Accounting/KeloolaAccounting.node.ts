import {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodePropertyOptions,
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
  exchangeNode,
  resources as exchangeResources,
  router as exchangeRouter,
} from './resources/exchange';
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
import { taxNode, resources as taxResources, router as taxRouter } from './resources/tax';
import {
  operations as organizationOperations,
  resources as organizationResources,
  organizationNode,
} from './resources/organization';
import {
  productNode,
  resources as productResources,
  router as productRouter,
} from './resources/product';
import {
  journalNode,
  resources as journalResources,
  router as journalRouter,
} from './resources/journal';

import { ENV } from '../../env';
import { getAccessToken } from '../../shared/authentication';
import { credentials } from '../../shared/constants';

export class KeloolaAccounting implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Keloola Accounting',
    name: 'keloolaAccounting',
    icon: 'file:../../icons/accounting.svg',
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
          ...Object.values(taxResources),
          ...Object.values(productResources),
          ...Object.values(journalResources),
          ...Object.values(exchangeResources),
        ],
        default: userResources.user.value,
      },
      ...userNode,
      ...organizationNode,
      ...unitNode,
      ...categoryNode,
      ...chartOfAccountNode,
      ...taxNode,
      ...productNode,
      ...journalNode,
      ...exchangeNode,
    ],
  };

  methods = {
    loadOptions: {
      async getCurrencies(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const token = await getAccessToken(this, ENV.AUTH_BASE_URL);

        const response = await this.helpers.httpRequest({
          method: 'GET',
          url: `${ENV.ACCOUNTING_BASE_URL}/exchange`,
          headers: { Authorization: `Bearer ${token}` },
          json: true,
        });

        if (!Array.isArray(response)) {
          return [];
        }

        // Assuming response has code, name, uuid
        return response.map((currency: IDataObject) => ({
          name: `${currency.code} - ${currency.name}`,
          value: currency.uuid as string,
        }));
      },
    },
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

    if (resource === taxResources.tax.value) {
      const routing = await taxRouter(this, operation);
      url = routing.url;
      method = routing.method;
      body = routing.body;
    }

    if (resource === productResources.product.value) {
      const routing = await productRouter(this, operation);
      url = routing.url;
      method = routing.method;
      body = routing.body;
    }

    if (resource === journalResources.journal.value) {
      const routing = await journalRouter(this, operation);
      url = routing.url;
      method = routing.method;
      body = routing.body;
    }

    if (resource === exchangeResources.exchange.value) {
      const routing = await exchangeRouter(this, operation);
      url = routing.url;
      method = routing.method;
      body = routing.body;
    }

    if (url === '') {
      throw new NodeOperationError(this.getNode(), `No operation found for ${resource}`);
    }

    try {
      const response = await this.helpers.httpRequest({
        method,
        url,
        body,
        headers: { Authorization: `Bearer ${token}` },
      });

      return [this.helpers.returnJsonArray(response)];
    } catch (error) {
      if (error.response) {
        throw new NodeOperationError(
          this.getNode(),
          `${JSON.stringify(error.response.data || error.message)}`,
          {
            description: `Status: ${error.response.status}\nURL: ${url}\nMethod: ${method}\nBody: ${JSON.stringify(body, null, 2)}`,
          },
        );
      }
      throw error;
    }
  }
}
