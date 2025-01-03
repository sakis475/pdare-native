import { Alert } from 'react-native';
// import * as Sentry from '@sentry/react-native';

export const errorHandler = (error: Error, isFatal?: boolean) => {
  console.log('error-handler', error, isFatal);
};
