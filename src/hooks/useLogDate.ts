import React, { useEffect } from "react";
import { getBlockTime } from "@colony/colony-js";
import { InfuraProvider } from "ethers/providers";
import moment from "moment";

/*
 * Gets the timestamp of the block. We use a hook for this so we don't have to wait
 * for every timestamp to load before rendering everything else.
 */
export function useLogDate(
    blockHash: string | undefined,
    provider: InfuraProvider
) {
    const [date, setDate] = React.useState("Loading...");
    useEffect(() => {
        (async () => {
            if (blockHash) {
                const _date = blockHash
                    ? await getBlockTime(provider, blockHash)
                    : 0;
                setDate(_date.toString());
            }
        })();
    }, [blockHash, provider]);

    return moment.unix(parseInt(date)).format("D MMM");
}
