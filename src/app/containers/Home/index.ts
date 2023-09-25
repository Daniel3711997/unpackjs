import { createContainer } from '@app/helpers/app';

import { Home } from './Home';

const renderContainer = createContainer({
    element: 'root',
    container: Home,
});

renderContainer();
