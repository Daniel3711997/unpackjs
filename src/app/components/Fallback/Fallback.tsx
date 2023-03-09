import { clsx } from 'clsx';

import { useEffect, useState } from 'react';

export const Fallback = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setShow(true);
        }, 250);

        return () => {
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div
            id="fallback-loader"
            className={clsx('fallback-loader', {
                active: show,
            })}
        >
            <p>Loading...</p>
        </div>
    );
};
