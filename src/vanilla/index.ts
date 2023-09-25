import { loadSuspense } from '@app/helpers/suspense';

import '@app/styles/main.scss';

loadSuspense();

console.log('Hello world');

/**
 * Do not remove this helper function as it is used by the build process
 */
if (module.hot) module.hot.accept();
