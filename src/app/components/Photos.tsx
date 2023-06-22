import { Suspense } from '@suspensive/react';
import { useSuspenseInfiniteQuery } from '@suspensive/react-query';
import { useRef } from 'react';

import { queryKeys } from 'api';
import { itemsPerPage } from 'api/settings';

export const Photos = () => (
    <Suspense fallback={<p>Looking...</p>}>
        <PhotosComponent />
    </Suspense>
);

const PhotosComponent = () => {
    const currentPage = useRef(1);

    const query = useSuspenseInfiniteQuery({
        ...queryKeys.fakeAPI.photos,

        useErrorBoundary: false,
        getNextPageParam: lastPage => {
            if (lastPage.length < itemsPerPage) {
                return undefined;
            }

            return currentPage.current;
        },
    });

    const queryError = query.failureReason as Error;

    return (
        <div>
            {queryError && <p>{queryError.message}</p>}

            <button
                disabled={!query.hasNextPage || query.isFetchingNextPage}
                onClick={() => {
                    if (!queryError) currentPage.current++;

                    query.fetchNextPage({
                        cancelRefetch: false,
                    });
                }}
            >
                {query.isFetchingNextPage ? 'Loading...' : query.hasNextPage ? 'Load More' : 'Nothing more to load'}
            </button>

            {query.data.pages.map(page =>
                page.map(photo => (
                    <div key={photo.id}>
                        <p>{photo.title}</p>
                        <img src={photo.thumbnailUrl} alt={photo.title} />
                    </div>
                ))
            )}
        </div>
    );
};
