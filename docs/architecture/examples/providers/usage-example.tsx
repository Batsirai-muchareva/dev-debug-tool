/**
 * Usage Example
 * 
 * This file demonstrates how to use the unified provider/variant architecture
 * in a React component.
 */

import * as React from 'react';
import { useMemo } from 'react';

// Import from the providers module
import {
  createEditorProvider,
  createDatabaseProvider,
  useProvider,
  type SourceContext,
  type PluginSettings,
  type DataProvider,
} from './index';

// =============================================================================
// Mock Adapters (for demonstration)
// =============================================================================

// In real usage, these would come from @app/adapters
const mockElementorAdapter = {
  onCommand: (commands: string | string[], handler: () => void) => {
    console.log('Subscribed to:', commands);
    return () => console.log('Unsubscribed from:', commands);
  },
  getSelectedElement: () => null,
  getDocumentId: () => '123',
  isAvailable: () => true,
};

const mockWordPressAdapter = {
  fetch: async <T,>(action: string, data?: Record<string, string>) => {
    console.log('Fetching:', action, data);
    return { success: true, data: { schema: [], post_id: 123, timestamp: new Date().toISOString() } as T };
  },
};

const mockSettings: PluginSettings = {
  baseUrl: '/wp-admin/admin-ajax.php',
  nonce: 'abc123',
  databaseAjaxAction: 'dev_debug_tool_get_database_schema',
  kitId: '456',
  currentPostId: '123',
  metaKeys: {
    post: '_elementor_data',
    variables: '_elementor_global_variables',
    globalClasses: '_elementor_global_classes',
  },
};

// =============================================================================
// Example Components
// =============================================================================

/**
 * Variant Tabs Component
 */
interface VariantTabsProps {
  variants: Array<{ id: string; label: string }>;
  activeVariant: string;
  onSwitch: (id: string) => void;
}

const VariantTabs: React.FC<VariantTabsProps> = ({
  variants,
  activeVariant,
  onSwitch,
}) => {
  return (
    <div className="variant-tabs">
      {variants.map((variant) => (
        <button
          key={variant.id}
          className={`variant-tab ${variant.id === activeVariant ? 'active' : ''}`}
          onClick={() => onSwitch(variant.id)}
        >
          {variant.label}
        </button>
      ))}
    </div>
  );
};

/**
 * Loading Spinner
 */
const Spinner: React.FC = () => (
  <div className="spinner">Loading...</div>
);

/**
 * Empty State
 */
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="empty-state">
    <p>{message}</p>
  </div>
);

/**
 * JSON Viewer (simplified)
 */
const JsonViewer: React.FC<{ data: unknown }> = ({ data }) => (
  <pre className="json-viewer">
    {JSON.stringify(data, null, 2)}
  </pre>
);

// =============================================================================
// Editor Panel Example
// =============================================================================

interface EditorPanelProps {
  context: SourceContext;
}

/**
 * Editor Panel using the useProvider hook
 */
export const EditorPanel: React.FC<EditorPanelProps> = ({ context }) => {
  // Create provider (memoized)
  const provider = useMemo(() => createEditorProvider(), []);

  // Use the provider hook
  const {
    data,
    loading,
    error,
    activeVariant,
    variants,
    switchVariant,
    refresh,
    emptyMessage,
    hasData,
  } = useProvider(provider, context);

  return (
    <div className="editor-panel">
      <div className="panel-header">
        <h3>Editor</h3>
        <button onClick={refresh} disabled={loading}>
          Refresh
        </button>
      </div>

      {/* Variant Tabs */}
      <VariantTabs
        variants={variants}
        activeVariant={activeVariant}
        onSwitch={switchVariant}
      />

      {/* Content */}
      <div className="panel-content">
        {loading && <Spinner />}
        {error && <div className="error">{error.message}</div>}
        {!loading && !hasData && <EmptyState message={emptyMessage} />}
        {!loading && hasData && <JsonViewer data={data} />}
      </div>
    </div>
  );
};

// =============================================================================
// Database Panel Example
// =============================================================================

interface DatabasePanelProps {
  context: SourceContext;
  settings: PluginSettings;
}

/**
 * Database Panel using the useProvider hook
 */
export const DatabasePanel: React.FC<DatabasePanelProps> = ({
  context,
  settings,
}) => {
  // Create provider with settings (memoized)
  const provider = useMemo(
    () => createDatabaseProvider(settings),
    [settings]
  );

  // Use the provider hook
  const {
    data,
    loading,
    error,
    activeVariant,
    variants,
    switchVariant,
    refresh,
    emptyMessage,
    hasData,
  } = useProvider(provider, context);

  return (
    <div className="database-panel">
      <div className="panel-header">
        <h3>Database</h3>
        <button onClick={refresh} disabled={loading}>
          Refresh
        </button>
      </div>

      {/* Variant Tabs */}
      <VariantTabs
        variants={variants}
        activeVariant={activeVariant}
        onSwitch={switchVariant}
      />

      {/* Content */}
      <div className="panel-content">
        {loading && <Spinner />}
        {error && <div className="error">{error.message}</div>}
        {!loading && !hasData && <EmptyState message={emptyMessage} />}
        {!loading && hasData && <JsonViewer data={data} />}
      </div>
    </div>
  );
};

// =============================================================================
// Main App Example
// =============================================================================

/**
 * Main Debug Tool App
 */
export const DebugToolApp: React.FC = () => {
  // Create context (would come from adapters in real usage)
  const context: SourceContext = useMemo(
    () => ({
      providerId: 'app',
      elementor: mockElementorAdapter,
      wordpress: mockWordPressAdapter,
      settings: mockSettings,
    }),
    []
  );

  // Provider-level tabs
  const [activeProvider, setActiveProvider] = React.useState<'editor' | 'database'>('editor');

  return (
    <div className="debug-tool">
      {/* Provider Tabs */}
      <div className="provider-tabs">
        <button
          className={activeProvider === 'editor' ? 'active' : ''}
          onClick={() => setActiveProvider('editor')}
        >
          Editor
        </button>
        <button
          className={activeProvider === 'database' ? 'active' : ''}
          onClick={() => setActiveProvider('database')}
        >
          Database
        </button>
      </div>

      {/* Panels */}
      {activeProvider === 'editor' && (
        <EditorPanel context={context} />
      )}
      {activeProvider === 'database' && (
        <DatabasePanel context={context} settings={mockSettings} />
      )}
    </div>
  );
};

// =============================================================================
// Styles (for reference)
// =============================================================================

/*
.debug-tool {
  background: #1e1e1e;
  color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.provider-tabs {
  display: flex;
  background: #2d2d2d;
  padding: 8px;
  gap: 4px;
}

.provider-tabs button {
  padding: 8px 16px;
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  border-radius: 4px;
}

.provider-tabs button.active {
  background: #3d3d3d;
  color: #fff;
}

.variant-tabs {
  display: flex;
  padding: 8px;
  gap: 4px;
  border-bottom: 1px solid #333;
}

.variant-tab {
  padding: 6px 12px;
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
}

.variant-tab.active {
  background: #4a90d9;
  color: #fff;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
}

.panel-content {
  padding: 12px;
  min-height: 200px;
}

.spinner {
  text-align: center;
  color: #888;
  padding: 40px;
}

.empty-state {
  text-align: center;
  color: #666;
  padding: 40px;
}

.json-viewer {
  background: #0d1117;
  padding: 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  overflow: auto;
  max-height: 400px;
}
*/


