import { App } from 'app/root';
import { createRoot } from 'react-dom/client';

import type { ComponentType } from 'react';

interface ICreateContainer {
    container: ComponentType;
    element: string | HTMLElement;
}

export const createContainer =
    ({ element, container: ReactAppContainer }: ICreateContainer) =>
    () => {
        const rootElement = 'string' === typeof element ? document.getElementById(element) : element;

        if (!rootElement) {
            throw new Error(
                'string' === typeof element
                    ? `The provided element id "${element}" was not found on the page`
                    : 'The provided "HTMLElement" was not found on the page'
            );
        }

        createRoot(rootElement).render(<App Component={ReactAppContainer} />); // Create a React root and render the App component
    };
