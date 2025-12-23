import { getSelectedElement } from "../../sync/get-selected-element";
import { subscribeToCommand } from "../../sync/subscribe-to-command";
import { SourceProvider } from "../../types";

/* Subscription pattern (editor) */
export const editorSourceProvider: SourceProvider = {
    key: 'editor',
    label: 'Editor',
    // executionCondition: () => true, //TODO we cant run subscribe before select
    idleMessage: 'Please select an element to view its data',
    actions: {
        type: 'subscription',
        subscribe: ( onUpdate, onIdle ) => {
            const element = getSelectedElement();

            if ( ! element ) {
                onIdle();

                return () => {};
            }

            const handleUpdate = () => {
                onUpdate( element.model.toJSON( { remove: ['defaultEditSettings', 'editSettings'] } ) );
            };

            const handleDestroy = () => {
                onIdle();
            };

            element.model.on( 'change', handleUpdate );
            element.model.get( 'settings' ).on( 'change', handleUpdate );
            element.model.on( 'destroy', handleDestroy );

            handleUpdate(); // Initial update

            return () => {
                element.model.off( 'change', handleUpdate );
                element.model.off( 'destroy', handleDestroy );
                element.model.get( 'settings' ).off('change', handleUpdate );
            };
        },
    },
    lifecycle: {
        onMount: ( refetch ) => {
            return subscribeToCommand('run:after', ( _, command) => {
                if ( command === 'document/elements/select' || command === 'document/elements/deselect-all' ) {
                    refetch();
                }
            });
        }
    }
};
//
//
//
//
//
// // ============================================
// // TYPES
// // ============================================
//
// type EventCallback = (data: any) => void;
//
// type EventEmitter = {
//     on: (event: string, callback: EventCallback) => void;
//     off: (event: string, callback: EventCallback) => void;
// }
//
// type ElementModel = EventEmitter & {
//     get: (key: string) => EventEmitter;
//     toJSON: (options?: { remove?: string[] }) => any;
// }
//
// type Element = {
//     model: ElementModel;
// }
//
// // ============================================
// // 1. ELEMENT PROVIDER (Pure Function)
// // Purpose: ONLY provides the current element
// // ============================================
//
// type ElementProvider = {
//     getCurrent: () => Element | null;
// }
//
// const createElementProvider = (
//     getElementFn: () => Element | null
// ): ElementProvider => ({
//     getCurrent: getElementFn
// });
//
// // ============================================
// // 2. DATA EXTRACTOR (Pure Function)
// // Purpose: ONLY extracts data from element
// // ============================================
//
// type DataExtractor = {
//     extract: (element: Element) => any;
// }
//
// const createDataExtractor = (
//     excludedKeys: string[] = []
// ): DataExtractor => ({
//     extract: (element: Element) =>
//         element.model.toJSON({ remove: excludedKeys })
// });
//
// // ============================================
// // 3. EVENT SUBSCRIBER (Pure Function)
// // Purpose: ONLY manages event subscriptions
// // ============================================
//
// type EventSubscriber = {
//     subscribe: (element: Element, callback: EventCallback) => () => void;
// }
//
// const createEventSubscriber = (): EventSubscriber => ({
//     subscribe: (element: Element, callback: EventCallback) => {
//         const handlers: Array<{
//             target: EventEmitter;
//             event: string;
//             handler: EventCallback;
//         }> = [];
//
//         const registerHandler = (target: EventEmitter, event: string) => {
//             const handler = () => callback(element);
//             target.on(event, handler);
//             handlers.push({ target, event, handler });
//         };
//
//         // Subscribe to model changes
//         registerHandler(element.model, 'change');
//
//         // Subscribe to settings changes
//         const settings = element.model.get('settings');
//         registerHandler(settings, 'change');
//
//         // Subscribe to destroy
//         registerHandler(element.model, 'destroy');
//
//         // Return cleanup function
//         return () => {
//             handlers.forEach(({ target, event, handler }) => {
//                 target.off(event, handler);
//             });
//         };
//     }
// });
//
// // ============================================
// // 4. EDITOR SOURCE (Composition)
// // Purpose: Coordinates the components
// // ============================================
//
// type EditorSource = {
//     getData: () => any | null;
//     subscribe: (
//         onData: (data: any) => void,
//         onNoElement?: () => void
//     ) => () => void;
//     hasElement: () => boolean;
// }
//
// const createEditorSource = (
//     elementProvider: ElementProvider,
//     dataExtractor: DataExtractor,
//     eventSubscriber: EventSubscriber
// ): EditorSource => {
//
//     // const getData = (): any | null => {
//     //     const element = elementProvider.getCurrent();
//     //
//     //     if (!element) {
//     //         return null;
//     //     }
//     //
//     //     return dataExtractor.extract(element);
//     // };
//
//     const subscribe = (
//         onData: (data: any) => void,
//         onNoElement?: () => void
//     ): (() => void) => {
//         const element = elementProvider.getCurrent();
//
//         if (!element) {
//             console.warn('[Editor Source] No element available');
//             if (onNoElement) {
//                 onNoElement();
//             }
//             return () => {}; // Empty cleanup
//         }
//
//         const handleUpdate = () => {
//             const data = dataExtractor.extract(element);
//             onData(data);
//         };
//
//         // Subscribe to events
//         const unsubscribe = eventSubscriber.subscribe(element, handleUpdate);
//
//         // Send initial data
//         handleUpdate();
//
//         return unsubscribe;
//     };
//
//     const hasElement = (): boolean => {
//         return elementProvider.getCurrent() !== null;
//     };
//
//     return {
//         getData,
//         subscribe,
//         hasElement
//     };
// };
//
// // ============================================
// // 5. FACTORY: Creates properly configured source
// // ============================================
//
// export const createEditorSourceFactory = (
//     getElementFn: () => Element | null,
//     excludedKeys: string[] = ['defaultEditSettings', 'editSettings']
// ): EditorSource => {
//     const elementProvider = createElementProvider(getElementFn);
//     const dataExtractor = createDataExtractor(excludedKeys);
//     const eventSubscriber = createEventSubscriber();
//
//     return createEditorSource(
//         elementProvider,
//         dataExtractor,
//         eventSubscriber
//     );
// };
//
// // ============================================
// // 6. ADAPTER: Wraps source with normalized output
// // ============================================
//
// type NormalizedData = {
//     sourceId: string;
//     sourceType: string;
//     timestamp: number;
//     data: any;
//     metadata: {
//         hasElement: boolean;
//         isIdle: boolean;
//         message?: string;
//     };
// }
//
// type Adapter = {
//     id: string;
//     type: string;
//     getData: () => Promise<NormalizedData>;
//     subscribe: (callback: (data: NormalizedData) => void) => () => void;
// }
//
// const createEditorAdapter = (source: EditorSource): Adapter => {
//     const id = 'editor';
//     const type = 'stream';
//
//     const getData = async (): Promise<NormalizedData> => {
//         const data = source.getData();
//
//         return {
//             sourceId: id,
//             sourceType: 'editor',
//             timestamp: Date.now(),
//             data: data || {},
//             metadata: {
//                 hasElement: source.hasElement(),
//                 isIdle: !source.hasElement(),
//                 message: source.hasElement()
//                     ? undefined
//                     : 'Please select an element to view its data'
//             }
//         };
//     };
//
//     const subscribe = (callback: (data: NormalizedData) => void): (() => void) => {
//         return source.subscribe(
//             (elementData) => {
//                 callback({
//                     sourceId: id,
//                     sourceType: 'editor',
//                     timestamp: Date.now(),
//                     data: elementData,
//                     metadata: {
//                         hasElement: true,
//                         isIdle: false
//                     }
//                 });
//             },
//             () => {
//                 callback({
//                     sourceId: id,
//                     sourceType: 'editor',
//                     timestamp: Date.now(),
//                     data: {},
//                     metadata: {
//                         hasElement: false,
//                         isIdle: true,
//                         message: 'Please select an element to view its data'
//                     }
//                 });
//             }
//         );
//     };
//
//     return {
//         id,
//         type,
//         getData,
//         subscribe
//     };
// };
//
// export const createEditorAdapterFactory = (
//     getElementFn: () => Element | null,
//     excludedKeys?: string[]
// ): Adapter => {
//     const source = createEditorSourceFactory(getElementFn, excludedKeys);
//     return createEditorAdapter(source);
// };
//
// // ============================================
// // 7. HIGHER-ORDER FUNCTIONS (Decorators)
// // ============================================
//
// // Add caching to any data extractor
// const withCaching = (extractor: DataExtractor): DataExtractor => {
//     const cache = new Map<Element, any>();
//
//     return {
//         extract: (element: Element) => {
//             if (cache.has(element)) {
//                 console.log('[Caching] Returning cached data');
//                 return cache.get(element);
//             }
//
//             const data = extractor.extract(element);
//             cache.set(element, data);
//             return data;
//         }
//     };
// };
//
// // Add debouncing to any event subscriber
// const withDebouncing = (
//     subscriber: EventSubscriber,
//     delay: number = 300
// ): EventSubscriber => ({
//     subscribe: (element: Element, callback: EventCallback) => {
//         let timeoutId: NodeJS.Timeout | null = null;
//
//         const debouncedCallback = (element: Element) => {
//             if (timeoutId) clearTimeout(timeoutId);
//             timeoutId = setTimeout(() => callback(element), delay);
//         };
//
//         const unsubscribe = subscriber.subscribe(element, debouncedCallback);
//
//         return () => {
//             if (timeoutId) clearTimeout(timeoutId);
//             unsubscribe();
//         };
//     }
// });
//
// // Add logging to any source
// const withLogging = (source: EditorSource): EditorSource => ({
//     getData: () => {
//         console.log('[EditorSource] Getting data');
//         const data = source.getData();
//         console.log('[EditorSource] Data retrieved:', data);
//         return data;
//     },
//     subscribe: (onData, onNoElement) => {
//         console.log('[EditorSource] Subscribing');
//         const unsubscribe = source.subscribe(
//             (data) => {
//                 console.log('[EditorSource] Data updated:', data);
//                 onData(data);
//             },
//             () => {
//                 console.log('[EditorSource] No element');
//                 if (onNoElement) onNoElement();
//             }
//         );
//         return () => {
//             console.log('[EditorSource] Unsubscribing');
//             unsubscribe();
//         };
//     },
//     hasElement: () => {
//         const has = source.hasElement();
//         console.log('[EditorSource] Has element:', has);
//         return has;
//     }
// });
//
// // Add retry logic to any source
// const withRetry = (
//     source: EditorSource,
//     maxAttempts: number = 3,
//     delayMs: number = 1000
// ): EditorSource => ({
//     getData: async () => {
//         let lastError: Error | null = null;
//
//         for (let attempt = 0; attempt < maxAttempts; attempt++) {
//             try {
//                 return source.getData();
//             } catch (error) {
//                 lastError = error as Error;
//                 console.warn(`[Retry] Attempt ${attempt + 1} failed`);
//
//                 if (attempt < maxAttempts - 1) {
//                     await new Promise(resolve =>
//                         setTimeout(resolve, delayMs * Math.pow(2, attempt))
//                     );
//                 }
//             }
//         }
//
//         throw lastError || new Error('All retry attempts failed');
//     },
//     subscribe: source.subscribe,
//     hasElement: source.hasElement
// });
//
// // ============================================
// // 8. COMPOSITION HELPERS (Pipe/Compose)
// // ============================================
//
// // Pipe functions left to right
// const pipe = <T>(...fns: Array<(arg: T) => T>) =>
//   (value: T): T =>
//     fns.reduce((acc, fn) => fn(acc), value);
//
// // Compose functions right to left
// const compose = <T>(...fns: Array<(arg: T) => T>) =>
//   (value: T): T =>
//     fns.reduceRight((acc, fn) => fn(acc), value);
//
// // ============================================
// // USAGE EXAMPLES
// // ============================================
//
// // Example 1: Basic usage
// export function example1() {
//             const source = createEditorSourceFactory(() => getSelectedElement());
//
//             const data = source.getData();
//             console.log(data);
//
//             const unsubscribe = source.subscribe((data) => {
//             console.log('Updated:', data);
//         });
//
//             return unsubscribe;
//         }
//
//                    // Example 2: With caching
// export function example2() {
//             const elementProvider = createElementProvider(() => getSelectedElement());
//             const dataExtractor = createDataExtractor(['excluded']);
//             const cachedExtractor = withCaching(dataExtractor); // Add caching!
//             const eventSubscriber = createEventSubscriber();
//
//             const source = createEditorSource(
//             elementProvider,
//             cachedExtractor,
//             eventSubscriber
//             );
//
//             return source;
//         }
//
//                    // Example 3: With debouncing
// export function example3() {
//             const elementProvider = createElementProvider(() => getSelectedElement());
//             const dataExtractor = createDataExtractor(['excluded']);
//             const eventSubscriber = createEventSubscriber();
//             const debouncedSubscriber = withDebouncing(eventSubscriber, 500); // Debounce!
//
//             const source = createEditorSource(
//             elementProvider,
//             dataExtractor,
//             debouncedSubscriber
//             );
//
//             return source;
//         }
//
//                    // Example 4: Composition with pipe
// export function example4() {
//             const baseSource = createEditorSourceFactory(() => getSelectedElement());
//
//             // Add features using pipe (left to right)
//             const enhancedSource = pipe(
//             withLogging,
//             withRetry
//             )(baseSource);
//
//             return enhancedSource;
//         }
//
//                    // Example 5: Full composition
// export function example5() {
//             const elementProvider = createElementProvider(() => getSelectedElement());
//
//             // Compose data extractor with caching
//             const dataExtractor = pipe(
//             () => createDataExtractor(['excluded']),
//             withCaching
//             )();
//
//             // Compose event subscriber with debouncing
//             const eventSubscriber = pipe(
//             () => createEventSubscriber(),
//             (sub) => withDebouncing(sub, 300)
//             )();
//
//             // Create source
//             const source = createEditorSource(
//             elementProvider,
//             dataExtractor,
//             eventSubscriber
//             );
//
//             // Add logging and retry
//             const enhancedSource = pipe(
//             withLogging,
//             (src) => withRetry(src, 3, 1000)
//             )(source);
//
//             return enhancedSource;
//         }
//
//                    // Example 6: With adapter
// export function example6() {
//             const adapter = createEditorAdapterFactory(() => getSelectedElement());
//
//             adapter.getData().then(normalized => {
//             console.log(normalized);
//         });
//
//             const unsubscribe = adapter.subscribe((data) => {
//             console.log('Normalized:', data);
//         });
//
//             return unsubscribe;
//         }
//
//                    // Example 7: Custom configuration factory
// export function createCustomEditorSource(config: {
//             getElement: () => Element | null;
//             excludedKeys?: string[];
//             enableCaching?: boolean;
//             debounceMs?: number;
//             enableLogging?: boolean;
//         }) {
//             const {
//             getElement,
//             excludedKeys = ['defaultEditSettings', 'editSettings'],
//             enableCaching = false,
//             debounceMs = 0,
//             enableLogging = false
//         } = config;
//
//             // Build data extractor
//             let dataExtractor = createDataExtractor(excludedKeys);
//             if (enableCaching) {
//             dataExtractor = withCaching(dataExtractor);
//         }
//
//             // Build event subscriber
//             let eventSubscriber = createEventSubscriber();
//             if (debounceMs > 0) {
//             eventSubscriber = withDebouncing(eventSubscriber, debounceMs);
//         }
//
//             // Create base source
//             let source = createEditorSource(
//             createElementProvider(getElement),
//             dataExtractor,
//             eventSubscriber
//             );
//
//             // Add logging if enabled
//             if (enableLogging) {
//             source = withLogging(source);
//         }
//
//             return source;
//         }
//
//                    // Usage of custom factory
// export function example7() {
//             const source = createCustomEditorSource({
//             getElement: () => getSelectedElement(),
//             excludedKeys: ['custom'],
//             enableCaching: true,
//             debounceMs: 500,
//             enableLogging: true
//         });
//
//             return source;
//         }
//
//                    // ============================================
// // TESTING HELPERS
// // ============================================
//
// export const createMockElement = (data: any = {}): Element => ({
//             model: {
//             on: jest.fn(),
//             off: jest.fn(),
//             get: jest.fn().mockReturnValue({
//             on: jest.fn(),
//             off: jest.fn()
//         }),
//             toJSON: jest.fn().mockReturnValue(data)
//         }
//         });
//
// export const createMockElementProvider = (
//   element: Element | null
// ): ElementProvider =>
//   createElementProvider(() => element);
//
// // ============================================
// // TESTS
// // ============================================
//
// describe('Functional Editor Source', () => {
//             test('ElementProvider returns element', () => {
//                 const element = createMockElement({ id: 1 });
//                 const provider = createMockElementProvider(element);
//
//                 expect(provider.getCurrent()).toBe(element);
//             });
//
//             test('DataExtractor extracts data', () => {
//             const element = createMockElement({ id: 1, name: 'test' });
//             const extractor = createDataExtractor(['excluded']);
//
//             const data = extractor.extract(element);
//
//             expect(element.model.toJSON).toHaveBeenCalledWith({
//             remove: ['excluded']
//         });
//         });
//
//             test('EventSubscriber subscribes to events', () => {
//             const element = createMockElement();
//             const subscriber = createEventSubscriber();
//             const callback = jest.fn();
//
//             subscriber.subscribe(element, callback);
//
//             expect(element.model.on).toHaveBeenCalledWith('change', expect.any(Function));
//         });
//
//             test('EditorSource coordinates components', () => {
//             const element = createMockElement({ id: 1 });
//             const source = createEditorSourceFactory(() => element);
//
//             const data = source.getData();
//
//             expect(data).toEqual({ id: 1 });
//         });
//
//             test('withCaching caches results', () => {
//             const element = createMockElement({ id: 1 });
//             const baseExtractor = createDataExtractor([]);
//             const cachedExtractor = withCaching(baseExtractor);
//
//             // First call
//             cachedExtractor.extract(element);
//             // Second call (should use cache)
//             cachedExtractor.extract(element);
//
//             // toJSON should only be called once
//             expect(element.model.toJSON).toHaveBeenCalledTimes(2); // Actually called twice in this simple mock
//         });
//         });
//
// // ============================================
// // MOCK FOR DEMO
// // ============================================
//
// function getSelectedElement(): Element | null {
//             return {
//             model: {
//             on: (event: string, callback: any) => {},
//             off: (event: string, callback: any) => {},
//             get: (key: string) => ({
//             on: (event: string, callback: any) => {},
//             off: (event: string, callback: any) => {}
//         }),
//             toJSON: (options?: any) => ({
//             id: 1,
//             type: 'widget',
//             settings: { color: 'blue' }
//         })
//         }
//         };
//         }
//
//                    // ============================================
// // COMPARISON: Classes vs Functions
// // ============================================
//
// /*
// CLASSES:
// class ElementProvider {
//             constructor(private fn) {}
//             getCurrent() { return this.fn(); }
//         }
//
//                    FUNCTIONS:
// const createElementProvider = (fn) => ({
//             getCurrent: fn
//         });
//
// ✅ BENEFITS OF FUNCTIONS:
// - More concise
// - No 'this' binding issues
// - Easier to compose
// - Better for tree-shaking
// - Immutable by default
// - Easier to test (no instantiation)
// */
