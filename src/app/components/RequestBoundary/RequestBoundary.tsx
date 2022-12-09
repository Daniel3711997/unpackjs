import type { ReactNode, ReactElement } from 'react';
import type { FallbackProps } from 'react-error-boundary';

import { ErrorBoundary } from 'react-error-boundary';
import { QueryErrorResetBoundary } from '@tanstack/react-query';

interface BoundaryProps {
    children: ReactNode;
    fallback: (props: FallbackProps) => ReactElement;
}

export const RequestBoundary = ({ children, fallback }: BoundaryProps) => (
    <QueryErrorResetBoundary>
        {({ reset }) => (
            <ErrorBoundary onReset={reset} fallbackRender={fallback}>
                {children}
            </ErrorBoundary>
        )}
    </QueryErrorResetBoundary>
);
