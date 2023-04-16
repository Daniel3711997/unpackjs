import { render } from '@testing-library/react';

import { Profile } from 'app/containers/Profile/Profile';

test('example', () => {
    // prettier-ignore
    const {
        container
    } = render(<Profile />);

    expect(container).toMatchSnapshot();
});
