import * as React from 'react';
import axios from 'axios';
import { createBrowserRouter } from 'react-router-dom';
import Feed from './pages/Feed';
import Root from './Root';
import Profile from './pages/Profile';
import Practice from './pages/Practice';
import Login from './pages/Login';
import ErrorBoundary from './ErrorBoundary';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    loader: async ({ request }) => {
      const payload = await axios.get(`/initialRender`).catch((err) => {
        // should probably navigate to login here
        return 'error - navigate to login';
      });
      if (typeof payload === 'string') {
        return payload;
      }
      return payload.data;
    },
    // errorElement: <ErrorBoundary />,
    children: [
      {
        path: '',
        element: <Feed />,
      },
      {
        path: 'feed',
        element: <Feed />,
      },
      {
        path: 'practice',
        element: <Practice />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
]);

export default router;
