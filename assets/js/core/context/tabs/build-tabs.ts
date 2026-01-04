import { getProviderConfig } from "@app/data-source-manager/register-data-providers";

export function buildTabs() {
    return getProviderConfig().map( ( { id, title, variants } ) => ( {
        id,
        title,
        subTabs: Object.entries( variants ?? {} ).map( ( [ _, variant ] ) => ( {
            id: variant.id,
            label: variant.label,
        } ) ),
    } ) );
}
