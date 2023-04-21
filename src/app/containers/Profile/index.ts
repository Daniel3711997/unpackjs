import { createContainer } from 'helpers/app';

import { Profile } from './Profile';

const renderContainer = createContainer({
    container: Profile,
    element: 'rootProfile',
});

renderContainer();

export { Profile };

export { renderContainer as renderProfile };
