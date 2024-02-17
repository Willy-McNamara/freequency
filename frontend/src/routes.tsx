import * as React from 'react';
import axios from 'axios';
import { createBrowserRouter } from 'react-router-dom';
import Feed from './pages/Feed';
import Root from './Root';
import Profile from './pages/Profile';
import Practice from './pages/Practice';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    loader: async () => {
      /*
      grabs data for given user (id provided via auth? prob need to do something with routing...)
      */
      const payload = await axios
        .get('http://localhost:3000/initialRender')
        .catch((err) => {
          return err;
        });
      console.log('logging payload from root loader :', payload);
      return payload.data;
    },
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
