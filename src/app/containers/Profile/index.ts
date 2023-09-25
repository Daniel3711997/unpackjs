import { createContainer } from '@app/helpers/app';

import { Profile } from './Profile';

const renderContainer = createContainer({
    container: Profile,
    element: 'rootProfile',
});

renderContainer();
