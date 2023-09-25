import { createQueryKeys } from '@lukemorales/query-key-factory';

import { itemsPerPage } from '@app/api/settings';

export const fakeAPI = createQueryKeys('fakeAPI', {
    todos: {
        queryKey: ['todos'],
        queryFn: (
            context,
        ): Promise<
            Array<{
                id: number;
                title: string;
                userId: number;
                completed: boolean;
            }>
        > =>
            fetch('https://jsonplaceholder.typicode.com/todos', {
                signal: context.signal,
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Something went wrong');
                }

                return response.json() as Promise<
                    Array<{
                        id: number;
                        title: string;
                        userId: number;
                        completed: boolean;
                    }>
                >;
            }),
    },
    photos: {
        queryKey: ['photos', itemsPerPage],
        queryFn: (
            context,
        ): Promise<
            Array<{
                id: number;
                url: string;
                title: string;
                albumId: number;
                thumbnailUrl: string;
            }>
        > =>
            fetch(
                `https://jsonplaceholder.typicode.com/photos?_start=${
                    (context.pageParam || 0) * itemsPerPage
                }&_limit=${itemsPerPage}`,
                {
                    signal: context.signal,
                },
            ).then(response => {
                if (!response.ok || context.pageParam > 4) {
                    throw new Error('Something went wrong');
                }

                return response.json() as Promise<
                    Array<{
                        id: number;
                        url: string;
                        title: string;
                        albumId: number;
                        thumbnailUrl: string;
                    }>
                >;
            }),
    },
});
