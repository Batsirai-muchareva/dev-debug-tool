import React from "react"

export const EmptyState = ( { text }: { text?: string } ) => {
    return <div className="dev-debug-empty-state">{ text }</div>
}
