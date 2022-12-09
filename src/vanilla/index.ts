import 'styles/main.scss';

import { loadSuspense } from 'helpers/suspense';

loadSuspense();

console.log('Hello world');

// $(() => {
//     console.log('jQuery is ready!');
// });

/**
 * Do not remove this helper function as it is used by the build process
 */
if (module.hot) module.hot.accept();
