import { mergeQueryKeys } from '@lukemorales/query-key-factory';

import { example1, example2 } from './example';

export const queryKeys = mergeQueryKeys(example1, example2);
