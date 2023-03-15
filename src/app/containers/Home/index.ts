import { createContainer } from 'helpers/app';

import { Home } from './Home';

const renderContainer = createContainer({
    element: 'root',
    container: Home,
});

renderContainer();
