import * as React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Feed from './pages/Feed';
import Root from './Root';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        path: 'Feed',
        element: <Feed />,
      },
      {
        path: 'Practice',
        element: <div>Practice</div>,
      },
      {
        path: 'Profile',
        element: <div>Profile</div>,
      },
    ],
  },
]);

export default router;
