import { createSearchScoper } from "@app/context/data/scopers/create-search-scoper";
import { DataScoper } from "@app/context/data/types";
import { createSelectedKeyFilterScope } from "@app/context/data/scopers/create-selected-key-filter-scope";

const scopers: DataScoper[] = [
    createSelectedKeyFilterScope(),
    createSearchScoper(),
]

export const applyDataScopers = (
    data: unknown,
): unknown => {
    return scopers.reduce( ( current, scope) => scope( current ), data );
};

