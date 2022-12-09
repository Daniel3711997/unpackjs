import { Profile } from './Profile';
import { createContainer } from 'helpers/app';

const renderContainer = createContainer({
    container: Profile,
    element: 'rootProfile',
});

renderContainer();
