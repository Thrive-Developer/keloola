import type { INodeProperties } from 'n8n-workflow';

const showOnlyForUsers = {
  resource: ['user'],
};

export const userDescription: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: showOnlyForUsers,
    },
    options: [
      {
        name: 'Get Current User',
        value: 'currentUser',
        action: 'Get current user',
        description: 'Get the current user logged in',
      },
    ],
    default: 'currentUser',
  },
];
