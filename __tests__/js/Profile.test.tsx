import { render } from '@testing-library/react';

import { Profile } from 'app/containers/Profile/Profile';
import { App } from 'app/root';

test('example', () => {
    // prettier-ignore
    const {
        container
    } = render(<App Component={Profile}/>);

    expect(container).toMatchSnapshot();
});
