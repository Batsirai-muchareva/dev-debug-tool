/**
 * ElementorAdapter - Isolates Elementor API dependencies
 * 
 * This adapter wraps Elementor's internal $e.commands API to:
 * 1. Provide version-safe API access
 * 2. Normalize differences between Elementor versions
 * 3. Make the codebase testable (easy to mock)
 * 4. Create a single point of failure for Elementor API changes
 * 
 * @example
 * ```typescript
 * import { elementorAdapter } from '@app/adapters/elementor-adapter';
 * 
 * // Subscribe to element selection
 * const unsubscribe = elementorAdapter.onCommand(
 *   'document/elements/select',
 *   () => {
 *     const element = elementorAdapter.getSelectedElement();
 *     console.log('Selected:', element);
 *   }
 * );
 * 
 * // Cleanup
 * unsubscribe();
 * ```
 */

// =============================================================================
// Types
// =============================================================================

export type ElementorCommand =
  | 'document/elements/select'
  | 'document/elements/deselect'
  | 'document/elements/deselect-all'
  | 'document/elements/delete'
  | 'document/save/update'
  | 'panel/exit';

export interface ElementorElement {
  id: string;
  cid: string;
  model: {
    get: (key: string) => unknown;
    toJSON: () => Record<string, unknown>;
  };
  getContainer?: () => ElementorElement;
}

export interface ElementorAdapter {
  /**
   * Subscribe to Elementor command events
   * @param commands - Single command or array of commands to listen for
   * @param handler - Callback when command is executed
   * @returns Unsubscribe function
   */
  onCommand(
    commands: ElementorCommand | ElementorCommand[],
    handler: () => void
  ): () => void;

  /**
   * Get the currently selected element
   * @returns Selected element or null if none selected
   */
  getSelectedElement(): ElementorElement | null;

  /**
   * Get current document/post ID
   */
  getDocumentId(): string;

  /**
   * Get Elementor kit ID (for global styles/variables)
   */
  getKitId(): string;

  /**
   * Get Elementor version string
   */
  getVersion(): string;

  /**
   * Check if Elementor is available and compatible
   */
  isAvailable(): boolean;

  /**
   * Check if current Elementor version is compatible with this adapter
   */
  isCompatible(): boolean;
}

// =============================================================================
// Implementation
// =============================================================================

// Declare Elementor globals (would normally be in a separate types file)
declare global {
  interface Window {
    elementor?: {
      config?: {
        version?: string;
        document?: {
          id?: string;
        };
      };
      selection?: {
        getElements: () => ElementorElement[];
      };
      getPreviewView?: () => {
        getContainer: () => ElementorElement | null;
      };
    };
    $e?: {
      commands: {
        on: (event: string, handler: (...args: unknown[]) => void) => void;
        off: (event: string, handler: (...args: unknown[]) => void) => void;
      };
    };
  }
}

/**
 * Minimum supported Elementor version
 */
const MIN_ELEMENTOR_VERSION = '3.0.0';

/**
 * Get Elementor's command system
 */
function getElementorCommands() {
  if (!window.$e?.commands) {
    throw new Error(
      '[DevDebugTool] Elementor command system not available. ' +
      'Make sure Elementor is loaded before using this adapter.'
    );
  }
  return window.$e.commands;
}

/**
 * Compare semantic versions
 */
function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const partA = partsA[i] || 0;
    const partB = partsB[i] || 0;
    if (partA > partB) return 1;
    if (partA < partB) return -1;
  }
  
  return 0;
}

/**
 * Create the Elementor adapter
 */
export function createElementorAdapter(): ElementorAdapter {
  const onCommand = (
    commandList: ElementorCommand | ElementorCommand[],
    handler: () => void
  ): (() => void) => {
    const commands = getElementorCommands();
    const toWatch = Array.isArray(commandList) ? commandList : [commandList];

    const internalHandler = (_: unknown, command: string) => {
      if (toWatch.includes(command as ElementorCommand)) {
        try {
          handler();
        } catch (error) {
          console.error('[DevDebugTool] Error in command handler:', error);
        }
      }
    };

    commands.on('run:after', internalHandler);

    return () => {
      commands.off('run:after', internalHandler);
    };
  };

  const getSelectedElement = (): ElementorElement | null => {
    try {
      // Try Elementor 3.x selection API
      const selection = window.elementor?.selection?.getElements();
      if (selection && selection.length > 0) {
        return selection[0];
      }

      // Fallback for older versions
      const previewView = window.elementor?.getPreviewView?.();
      if (previewView) {
        return previewView.getContainer();
      }

      return null;
    } catch (error) {
      console.warn('[DevDebugTool] Failed to get selected element:', error);
      return null;
    }
  };

  const getDocumentId = (): string => {
    return String(window.elementor?.config?.document?.id ?? '');
  };

  const getKitId = (): string => {
    // Kit ID is typically passed via localized script data
    // This would be retrieved from the settings passed from PHP
    return '';
  };

  const getVersion = (): string => {
    return window.elementor?.config?.version ?? 'unknown';
  };

  const isAvailable = (): boolean => {
    return (
      typeof window.elementor !== 'undefined' &&
      typeof window.$e?.commands !== 'undefined'
    );
  };

  const isCompatible = (): boolean => {
    if (!isAvailable()) return false;
    
    const version = getVersion();
    if (version === 'unknown') return false;
    
    return compareVersions(version, MIN_ELEMENTOR_VERSION) >= 0;
  };

  return {
    onCommand,
    getSelectedElement,
    getDocumentId,
    getKitId,
    getVersion,
    isAvailable,
    isCompatible,
  };
}

// =============================================================================
// Singleton Export
// =============================================================================

/**
 * Singleton instance of the Elementor adapter
 * 
 * Use this throughout the application to interact with Elementor.
 */
export const elementorAdapter = createElementorAdapter();

