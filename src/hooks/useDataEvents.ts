import React, { useEffect } from "react";
import { ColonyClient } from "@colony/colony-js";
import { Log } from "ethers/providers";
import { getLogs } from "@colony/colony-js";
import { EventFilter } from "ethers";

export function useDataEvents(
    colonyClient: ColonyClient,
    eventType:
        | "ColonyInitialised"
        | "ColonyRoleSet"
        | "PayoutClaimed"
        | "DomainAdded"
) {
    const [logs, setLogs] = React.useState([] as any[]);

    const filters = React.useMemo(
        () => colonyClient.filters || ({} as ColonyClient["filters"]),
        [colonyClient.filters]
    );

    // Select the eventFilter based on the given eventType
    const eventFilter = React.useMemo(() => {
        if (eventType === "ColonyInitialised") {
            return filters.ColonyInitialised
                ? filters.ColonyInitialised(null, null)
                : ({} as EventFilter);
        } else if (eventType === "ColonyRoleSet") {
            // I'm adding ts-ignore here because WE know that ColonyRoleSet
            // exists as a property of filters but Typescript doesn't since
            // filters can come from one of many different contract versions.
            //@ts-ignore
            return filters.ColonyRoleSet
                ? //@ts-ignore
                  filters.ColonyRoleSet(null)
                : ({} as EventFilter);
        } else if (eventType === "PayoutClaimed") {
            return filters.PayoutClaimed
                ? filters.PayoutClaimed(null, null, null)
                : ({} as EventFilter);
        } else if (eventType === "DomainAdded") {
            return filters.DomainAdded
                ? filters.DomainAdded(null)
                : ({} as EventFilter);
        } else {
            return {} as EventFilter;
        }
    }, [filters, eventType]);

    useEffect(() => {
        if (!colonyClient.provider) return;
        (async () => {
            const eventLogs = await getLogs(colonyClient, eventFilter);
            const parsedLogs = eventLogs.map((event) =>
                colonyClient.interface.parseLog(event)
            );

            // Merge the event logs and the parsed logs together
            const mergedLogs: any[] = [];
            eventLogs.forEach((event) => {
                const parsedLog = colonyClient.interface.parseLog(event);
                mergedLogs.push({ ...parsedLog, ...event });
            });

            setLogs(mergedLogs);
        })();
    }, [colonyClient, eventFilter]);

    return logs;
}
