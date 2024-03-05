import * as React from 'react';
import axios from 'axios';
import { createBrowserRouter } from 'react-router-dom';
import Feed from './pages/Feed';
import Root from './Root';
import Profile from './pages/Profile';
import Practice from './pages/Practice';
import Login from './pages/Login';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    loader: async ({ request }) => {
      const payload = await axios
        .get('http://localhost:3000/initialRender')
        .catch((err) => {
          console.log('error in root loader :', err);
          return 'error - navigate to login';
        });
      console.log('logging payload from root loader :', payload);
      if (typeof payload === 'string') {
        return payload;
      }
      return payload.data;
    },
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
