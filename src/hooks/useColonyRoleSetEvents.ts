import React, { useEffect } from "react";
import { ColonyClient } from "@colony/colony-js";
import { Log } from "ethers/providers";
import { getLogs } from "@colony/colony-js";
import { EventFilter } from "ethers";

export function useColonyRoleSetEvents(colonyClient: ColonyClient) {
    const [eventLogs, setEventLogs] = React.useState([] as Log[]);

    const filters = colonyClient.filters || ({} as ColonyClient["filters"]);

    // We do this because WE know that ColonyRoleSet exists as a property
    // of filters but Typescript doesn't, since filters can come from one of many
    // different contract versions.
    //@ts-ignore
    const ColonyRoleSet = filters.ColonyRoleSet;

    // Prevent eventFilter from causing the dependencies of the useEffect to change
    // on every render
    const eventFilter = React.useMemo(
        () =>
            ColonyRoleSet
                ? ColonyRoleSet(null, null, null)
                : ({} as EventFilter),
        [ColonyRoleSet]
    );

    useEffect(() => {
        if (!colonyClient.provider) return;
        (async () => {
            const _eventLogs = await getLogs(colonyClient, eventFilter);
            setEventLogs(_eventLogs);
        })();
    }, [colonyClient, eventFilter]);

    return eventLogs;
}
