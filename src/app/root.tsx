import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type ComponentType, StrictMode } from 'react';

import { RequestBoundary } from '@app/app/components/RequestBoundary';

// https://webpack.js.org/api/module-methods/#magic-comments
// https://webpack.js.org/guides/code-splitting/#prefetchingpreloading-modules

interface IAppProps {
    Component: ComponentType;
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 20, // 20 minutes
            cacheTime: 1000 * 60 * 60 * 2, // 2 hours
        },
    },
});

export const App = ({ Component }: IAppProps) => {
    return (
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <ReactQueryDevtools initialIsOpen={false} />

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
