// Main component
export { SchemaBrowser } from './components/schema-browser';

// Sub-components (for custom compositions)
export { SchemaList } from './components/schema-list';
export { SchemaDetail } from './components/schema-detail';
export { SchemaSearch } from './components/schema-search';
export { SchemaListItem } from './components/schema-list-item';

// Context and hooks
export {
    SchemaBrowserProvider,
    useSchemaBrowser,
    useSchemaNavigation,
    useSchemaSearch,
    useSchemaDataSource,
} from './context/schema-browser-context';

// Types
export type {
    SchemaDataSource,
    SchemaView,
    SchemaNavigationState,
    SchemaSearchState,
    SchemaBrowserProps,
    SchemaListItemProps,
} from './types';
