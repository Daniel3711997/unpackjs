import { render } from '@testing-library/react';

import { Profile } from '@app/app/containers/Profile/Profile';
import { App } from '@app/app/root';

test('example', () => {
    // prettier-ignore
    const {
        container
    } = render(<App Component={Profile}/>);

    expect(container).toMatchSnapshot();
});
