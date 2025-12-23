export function dispatchCustomEvent( event: string, options?: Record< string, unknown > ) {
    window.dispatchEvent( new CustomEvent( event, { detail: options } ) )
}
