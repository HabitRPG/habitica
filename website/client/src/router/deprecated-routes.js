import { NotFoundPage } from './shared-route-imports';

export const DEPRECATED_ROUTES = {
  path: '/groups',
  component: NotFoundPage,
  children: [
    { name: 'tavern', path: 'tavern' },
    {
      name: 'myGuilds',
      path: 'myGuilds',
    },
    {
      name: 'guildsDiscovery',
      path: 'discovery',
    },
    {
      name: 'guild',
      path: 'guild/:groupId',
      props: true,
    },
  ],
};
