const LINE_ATTRIBUTE = 'data-line';

export const findLineElement = (
    container: HTMLElement,
    lineNumber: number
): HTMLElement | null => {
    return container.querySelector(`[${LINE_ATTRIBUTE}="${lineNumber}"]`);
}
