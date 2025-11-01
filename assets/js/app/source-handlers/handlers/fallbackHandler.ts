import { SourceHandler } from "../../types";

export const fallbackHandler: SourceHandler = ( provider, updateSnapshot ) => {
    updateSnapshot( provider.key, { status: "success", data: ( provider.actions as any ).get() } )

    return () => {}
}
