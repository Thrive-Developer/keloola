import { INodeProperties } from 'n8n-workflow';

export const resources = {
  purchaseDelivery: {
    name: 'Purchase Delivery',
    value: 'purchaseDelivery',
  },
};

export const operations = {
  getAll: {
    name: 'Get Many',
    value: 'getAll',
    action: 'Get many purchase deliveries',
    description: 'Get all purchase deliveries',
  },
  get: {
    name: 'Get',
    value: 'get',
    action: 'Get a purchase delivery',
    description: 'Get a purchase delivery by ID',
  },
  createGrn: {
    name: 'Create Manual GRN',
    value: 'createGrn',
    action: 'Create Good Receive Note manually',
    description: 'Create a Good Receive Note manually (without Purchase Order)',
  },
};

const showOnlyForPurchaseDelivery = {
  resource: [resources.purchaseDelivery.value],
};

export const purchaseDeliveryNode: INodeProperties[] = [
  // eslint-disable-next-line n8n-nodes-base/node-param-default-missing
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: showOnlyForPurchaseDelivery,
    },
    options: [...Object.values(operations)],
    default: operations.getAll.value,
  },
  // ----------------------------------
  //         getAll
  // ----------------------------------
  {
    displayName: 'Page',
    name: 'page',
    type: 'number',
    default: 1,
    displayOptions: {
      show: {
        ...showOnlyForPurchaseDelivery,
        operation: [operations.getAll.value],
      },
    },
    description: 'Page number',
  },
  {
    displayName: 'Per Page',
    name: 'per_page',
    type: 'number',
    default: 15,
    displayOptions: {
      show: {
        ...showOnlyForPurchaseDelivery,
        operation: [operations.getAll.value],
      },
    },
    description: 'Number of items per page',
  },
  {
    displayName: 'Search',
    name: 'search',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        ...showOnlyForPurchaseDelivery,
        operation: [operations.getAll.value],
      },
    },
    description: 'Search by keyword',
  },
  {
    displayName: 'Status',
    name: 'status',
    type: 'options',
    options: [
      { name: 'All', value: 'all' },
      { name: 'Draft', value: 'draft' },
      { name: 'Partially Received', value: 'partially_received' },
      { name: 'Received', value: 'received' },
      { name: 'Sent', value: 'sent' },
      { name: 'Void', value: 'void' },
    ],
    default: 'all',
    displayOptions: {
      show: {
        ...showOnlyForPurchaseDelivery,
        operation: [operations.getAll.value],
      },
    },
    description: 'Purchase status',
  },
  // ----------------------------------
  //         get
  // ----------------------------------
  {
    displayName: 'ID',
    name: 'id',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        ...showOnlyForPurchaseDelivery,
        operation: [operations.get.value],
      },
    },
    description: 'The ID of the purchase delivery',
  },
  // ----------------------------------
  //         createGrn
  // ----------------------------------
  {
    displayName: 'Received Date',
    name: 'received_date',
    type: 'dateTime',
    required: true,
    default: '',
    displayOptions: {
      show: {
        ...showOnlyForPurchaseDelivery,
        operation: [operations.createGrn.value],
      },
    },
    description: 'Date goods were received (Format: YYYY-MM-DD)',
  },
  {
    displayName: 'Vendor ID',
    name: 'vendor',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        ...showOnlyForPurchaseDelivery,
        operation: [operations.createGrn.value],
      },
    },
  },
  {
    displayName: 'Products',
    name: 'products',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    default: {},
    displayOptions: {
      show: {
        ...showOnlyForPurchaseDelivery,
        operation: [operations.createGrn.value],
      },
    },
    options: [
      {
        displayName: 'Item',
        name: 'item',
        values: [
          {
            displayName: 'Product ID',
            name: 'product_id',
            type: 'string',
            default: '',
            required: true,
          },
          {
            displayName: 'Received Quantity',
            name: 'received_qty',
            type: 'number',
            default: 1,
            required: true,
            description: 'Quantity received',
          },
          {
            displayName: 'Description',
            name: 'description',
            type: 'string',
            default: '',
          },
        ],
      },
    ],
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        ...showOnlyForPurchaseDelivery,
        operation: [operations.createGrn.value],
      },
    },
    options: [
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        placeholder: 'name@email.com',
        default: '',
        description: 'Vendor email',
      },
      {
        displayName: 'Memo',
        name: 'memo',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Reference No',
        name: 'reference_no',
        type: 'string',
        default: '',
        description: 'Reference number',
      },
      {
        displayName: 'Stock Officer ID',
        name: 'stock_officer_id',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Transaction No',
        name: 'transaction_no',
        type: 'string',
        default: '',
        description: 'Transaction number',
      },
    ],
  },
];

export { router } from './router';
