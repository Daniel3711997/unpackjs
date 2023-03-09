import { RequestBoundary } from 'app/components/RequestBoundary';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { type ComponentType, StrictMode } from 'react';

// https://webpack.js.org/api/module-methods/#magic-comments
// https://webpack.js.org/guides/code-splitting/#prefetchingpreloading-modules

interface IAppProps {
    Component: ComponentType;
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            suspense: true,
        },
    },
});

export const App = ({ Component }: IAppProps) => {
    return (
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <RequestBoundary
                    fallback={({ resetErrorBoundary }) => (
                        <div>
                            <p>Something went wrong</p>
                            <button onClick={() => resetErrorBoundary()}>Try again</button>
                        </div>
                    )}
                >
                    <Component />
                </RequestBoundary>
            </QueryClientProvider>
        </StrictMode>
    );
};
