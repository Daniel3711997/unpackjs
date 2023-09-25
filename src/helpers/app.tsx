import type { ComponentType } from 'react';

import { createRoot } from 'react-dom/client';

import { App } from '@app/app/root';

interface ICreateContainer {
    container: ComponentType;
    excludeWrapper?: boolean;
    element: string | HTMLElement;
}

export const createContainer =
    ({ element, excludeWrapper, container: ReactAppContainer }: ICreateContainer) =>
    () => {
        const rootElement = 'string' === typeof element ? document.getElementById(element) : element;

        if (!rootElement) {
            throw new Error(
                'string' === typeof element
                    ? `The provided element id "${element}" was not found on the page`
                    : 'The provided "HTMLElement" was not found on the page',
            );
        }

        if ('development' === process.env.NODE_ENV) {
            createRoot(rootElement).render(
                excludeWrapper ? <ReactAppContainer /> : <App Component={ReactAppContainer} />,
            );
        } else {
            window.addEventListener('DOMContentLoaded', () => {
                createRoot(rootElement).render(
                    excludeWrapper ? <ReactAppContainer /> : <App Component={ReactAppContainer} />,
                );
            });
        }
    };
