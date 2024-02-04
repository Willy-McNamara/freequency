import React from 'react';
import { createRoot } from 'react-dom/client';
import router from './routes';
import { RouterProvider, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>,
  );
} else {
  console.error("Root element with id 'root' not found.");
}
