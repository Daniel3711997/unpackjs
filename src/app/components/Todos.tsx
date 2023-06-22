import { AsyncBoundary } from '@suspensive/react';
import { useSuspenseQuery } from '@suspensive/react-query';

import { queryKeys } from 'api';

const TodosComponent = () => {
    const query = useSuspenseQuery(queryKeys.fakeAPI.todos);

    return (
        <div>
            {query.data.map(todo => (
                <p key={todo.id}>{todo.title}</p>
            ))}
        </div>
    );
};

export const Todos = () => (
    <AsyncBoundary
        pendingFallback={<p>Looking...</p>}
        rejectedFallback={caught => <button onClick={caught.reset}>Reset {caught.error.message}</button>}
    >
        <TodosComponent />
    </AsyncBoundary>
);
