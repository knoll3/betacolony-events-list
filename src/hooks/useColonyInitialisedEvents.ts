import React, { useEffect } from "react";
import { ColonyClient } from "@colony/colony-js";
import { Log } from "ethers/providers";
import { getLogs } from "@colony/colony-js";
import { EventFilter } from "ethers";

export function useColonyInitialisedEvents(colonyClient: ColonyClient) {
    const [eventLogs, setEventLogs] = React.useState([] as Log[]);

    const filters = colonyClient.filters || ({} as ColonyClient["filters"]);

    const ColonyInitialised = filters.ColonyInitialised;

    // Prevent eventFilter from causing the dependencies of the useEffect to change
    // on every render
    const eventFilter = React.useMemo(
        () =>
            ColonyInitialised
                ? ColonyInitialised(null, null)
                : ({} as EventFilter),
        [ColonyInitialised]
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
