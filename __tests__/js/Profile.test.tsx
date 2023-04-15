import { render } from '@testing-library/react';

import { Profile } from '@/app/containers/Profile/Profile';

it('renders profile page unchanged', () => {
    const { container } = render(<Profile />);

    expect(container).toMatchSnapshot();
});
