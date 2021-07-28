import { ColonyClient } from "@colony/colony-js";
import { utils } from "ethers";

export async function getUserAddress(
    colonyClient: ColonyClient,
    singleLog: any
) {
    const humanReadableFundingPotId = new utils.BigNumber(
        singleLog.values.fundingPotId
    ).toString();

    const { associatedTypeId } = await colonyClient.getFundingPot(
        humanReadableFundingPotId
    );

    const { recipient: userAddress } = await colonyClient.getPayment(
        associatedTypeId
    );

    return userAddress;
}
