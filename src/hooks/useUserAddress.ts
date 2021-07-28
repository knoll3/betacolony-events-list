import { ColonyClient } from "@colony/colony-js";
import { utils } from "ethers";
import React, { useEffect } from "react";
import { MergedLog } from "./useGetLogs";

export function useUserAddress(
    fundingPotId: string | undefined,
    colonyClient: ColonyClient | null
) {
    const [userAddress, setUserAddress] = React.useState<string>();

    useEffect(() => {
        (async () => {
            if (fundingPotId && colonyClient) {
                const humanReadableFundingPotId = new utils.BigNumber(
                    fundingPotId
                ).toString();
                const { associatedTypeId } = await colonyClient.getFundingPot(
                    humanReadableFundingPotId
                );
                const {
                    recipient: _userAddress,
                } = await colonyClient.getPayment(associatedTypeId);
                setUserAddress(_userAddress);
            }
        })();
    }, [colonyClient, fundingPotId]);

    return userAddress;
}
