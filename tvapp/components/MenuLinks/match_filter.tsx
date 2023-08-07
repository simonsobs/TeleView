import React from "react";

import {FilterState} from "@/utils/mongo/request_data";
import filterUpdateLink, {ModifierState} from "@/utils/url/filter";



type MatchFilterMenuInput = {
    availableActionTypes:  Array<string>
    availableStreamIDs: Array<string>,
    availablePlatforms: Array<string>,
    modifierState: ModifierState,
    filterState: FilterState
}


function matchLinkWrapper(filterLinks: Array<React.ReactElement>): React.ReactElement {
    return (
        <div className="flex flex-col text-tvblue text-xl">
            {filterLinks.map((filterLink: React.ReactElement) => {
                return (
                    <div
                        className="hover:bg-gogreen hover:text-tvpurple border-tvorange hover:border-tvbrown border-2 rounded-md p-1 m-1"
                        key={filterLink.key}
                    >
                        {filterLink}
                    </div>
                )}
            )}
        </div>
    )
}


export default function MatchFilterMenu({
                                            availableActionTypes,
                                            availableStreamIDs,
                                            availablePlatforms,
                                            modifierState,
                                            filterState
                                        }: MatchFilterMenuInput) : React.ReactElement {
    const actionTypeFilterLinks = availableActionTypes.map((actionType: string) => {
        return filterUpdateLink(modifierState, filterState, 'action_type', actionType, true)
    })
    const streamIDFilterLinks = availableStreamIDs.map((streamID: string) => {
        return filterUpdateLink(modifierState, filterState, 'stream_id', streamID, true)
    })
    const platformsFilterLinks = availablePlatforms.map((platform: string) => {
        return filterUpdateLink(modifierState, filterState, 'platform', platform, true)
    })
    return (
        <div className="flex flex-col">
            <div className="text-2xl text-tvgrey">
                {'Action Type'}
            </div>
            {matchLinkWrapper(actionTypeFilterLinks)}
            <div className="text-2xl text-tvgrey mt-4">
                {'Stream ID'}
            </div>
            {matchLinkWrapper(streamIDFilterLinks)}
            <div className="text-2xl text-tvgrey mt-4">
                {'Platform (Telescope)'}
            </div>
            {matchLinkWrapper(platformsFilterLinks)}
        </div>
    )
}