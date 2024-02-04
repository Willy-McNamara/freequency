import * as React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Feed from './pages/Feed';
import Root from './Root';
import Profile from './pages/Profile';
import Practice from './pages/Practice';

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
        element: <Practice />,
      },
      {
        path: 'Profile',
        element: <Profile />,
      },
    ],
  },
]);

export default router;
