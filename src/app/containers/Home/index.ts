import { Home } from './Home';
import { createContainer } from 'helpers/app';

const renderContainer = createContainer({
    element: 'root',
    container: Home,
});

renderContainer();
