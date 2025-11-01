import React from "react"

export const EmptyState = ( { children }: React.PropsWithChildren ) => {
    return <div className="dev-debug-empty-state">{ children }</div>
}
