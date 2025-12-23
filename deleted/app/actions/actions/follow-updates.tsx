import React from "react";
import { ActionConfig } from "../actions-registry";
import { useFollowChanges } from "../../hooks/use-follow-changes";


export const followUpdatesAction: ActionConfig = {
    id: 'follow-updates',
    component: () => {
        const { followChanges, toggleFollowChanges } = useFollowChanges()

        return (
            <span style={ { display: 'flex' } }>
                <input checked={ followChanges } onChange={ toggleFollowChanges } type="checkbox" id="banana" name="banana"/>
                <label htmlFor="banana">Follow</label>
            </span>
        )
    },
    className: 'dev-debug-follow-updates',
}
