import { useEffect, useState } from "react";
import { DataSource, Provider, Variant } from "@app/types";
import { dataProviderManager } from "@app/manager/register-data-providers";
import { useTabs } from "@app/context/tabs/tabs-context";
import { useRef } from "@wordpress/element";
import { lineMap } from "@libs/line-map/line-map";

type State = Record< Provider['id'], Record<Variant['id'], unknown> >;

export function useProvider() {
    const { activeTab, activeSubTab } = useTabs();
    const [ data, setData ] = useState<State>({});
    const activeSource = useRef< DataSource | null >( null )

    const update =
        ( providerId: Provider['id'], variantId: Variant['id'], data: unknown ) => {

        setData( ( prev: any ) => ( {
            ...prev,
            [ providerId ]: {
                ...prev[ providerId ],
                [ variantId ]: data
            }
        } ) );
    }

    useEffect( () => {
        dataProviderManager.getAllProviders().forEach( async ( provider ) => {
            provider.variants.forEach( ( variant ) => {
                update( provider.id, variant.id, null );
            } )
        } );
    }, [] );

    const stopActiveSource = () => {
        activeSource.current?.stop();
        activeSource.current = null;
    }

    useEffect( () => {
        startSource();

        return stopActiveSource
    }, [ activeTab, activeSubTab ] )

    const startSource = () => {
        const variant = dataProviderManager.getSource( activeTab, activeSubTab );
        activeSource.current = variant.createSource( variant.sourceConfig );

        activeSource.current.start( ( sourceData ) => {
            update( activeTab, activeSubTab, sourceData )
        } );
    }

    return data[ activeTab ]?.[ activeSubTab ];
}
