import React from 'react';
import { useRouteError } from 'react-router';

export const ErrorBoundary = () => {
  let error = useRouteError();
  console.error(error);
  // Uncaught ReferenceError: path is not defined
  return <div>Dang!</div>;
};
