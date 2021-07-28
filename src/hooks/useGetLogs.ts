import { useEffect, useMemo } from "react";
import React from "react";
import {
    ColonyClient,
    getColonyNetworkClient,
    Network,
} from "@colony/colony-js";
import { ethers, Wallet } from "ethers";
import { InfuraProvider } from "ethers/providers";
import { getLogs } from "@colony/colony-js";
import { utils } from "ethers";
import { ColonyRole } from "@colony/colony-js";
import { getBlockTime } from "@colony/colony-js";
import moment from "moment";
import { useLogDate } from "./useLogDate";

export interface MergedLog {
    name: string;
    timestamp: number;
    timestampPromise: Promise<number>;
    date: string;
    blockHash?: string;
    role?: string;
    domainId?: string;
    amount?: string;
    token?: string;
    fundingPotId?: string;
    userAddress?: string;
    userAddressPromise?: Promise<string>;
}

const tokenMap: Record<string, string> = {
    "0x0dd7b8f3d1fa88FAbAa8a04A0c7B52FC35D4312c": "BLNY",
    "0x6B175474E89094C44Da98b954EedeAC495271d0F": "DAI",
};

/*
 * Returns all logs, the colony client, and the provider
 */
export function useGetLogs(): [
    MergedLog[],
    ColonyClient | null,
    InfuraProvider
] {
    const itemsPerPage = 10;

    const [logs, setLogs] = React.useState([] as MergedLog[]);
    const [colonyClient, setColonyClient] = React.useState<ColonyClient | null>(
        null
    );

    ethers.errors.setLogLevel("error");

    // Set up the network address constants
    const MAINNET_NETWORK_ADDRESS = `0x5346D0f80e2816FaD329F2c140c870ffc3c3E2Ef`;
    const MAINNET_BETACOLONY_ADDRESS = `0x869814034d96544f3C62DE2aC22448ed79Ac8e70`;

    // Get a new Infura provider
    const provider = useMemo(() => new InfuraProvider(), []);

    // Get a random wallet
    const wallet = Wallet.createRandom();
    // Connect your wallet to the provider
    const connectedWallet = wallet.connect(provider);

    // Get a network client instance
    const networkClient = getColonyNetworkClient(
        Network.Mainnet,
        connectedWallet,
        {
            networkAddress: MAINNET_NETWORK_ADDRESS,
        }
    );

    useEffect(() => {
        (async () => {
            if (logs.length > 0 && colonyClient) return;
            // Get the colony client instance for the betacolony
            const _colonyClient = await networkClient.getColonyClient(
                MAINNET_BETACOLONY_ADDRESS
            );
            setColonyClient(_colonyClient);

            // Concat the event logs into one array
            let mergedLogs: MergedLog[] = [];
            mergedLogs = mergedLogs.concat(
                await getPayoutClaimedLogs(_colonyClient, provider),
                await getColonyInitialisedLogs(_colonyClient, provider),
                await getColonyRoleSetLogs(_colonyClient, provider),
                await getDomainAddedLogs(_colonyClient, provider)
            );

            mergedLogs = await loadDates(mergedLogs);
            mergedLogs.sort((a, b) => b.timestamp - a.timestamp);

            setLogs(mergedLogs);
        })();
    }, [
        MAINNET_BETACOLONY_ADDRESS,
        colonyClient,
        logs.length,
        networkClient,
        provider,
    ]);

    return [logs, colonyClient, provider];
}

function loadDates(mergedLogs: MergedLog[]): Promise<MergedLog[]> {
    return new Promise((resolve, reject) => {
        const timestampPromises = mergedLogs.map((x) => x.timestampPromise);
        Promise.all(timestampPromises).then((timestamps) => {
            const logsWithDates = mergedLogs.map((log, i) => {
                const timestamp = timestamps[i];
                return {
                    ...log,
                    timestamp,
                    date: moment.unix(timestamp).format("D MMM"),
                };
            });
            resolve(logsWithDates);
        });
    });
}

function loadUserAddresses(mergedLogs: MergedLog[]): Promise<MergedLog[]> {
    return new Promise((resolve, reject) => {
        const userAddressPromises = mergedLogs.map((x) => x.userAddressPromise);
        Promise.all(userAddressPromises).then((userAddresses) => {
            const logsWithUserAddresses = mergedLogs.map((log, i) => ({
                ...log,
                userAddress: userAddresses[i],
            }));
        });
    });
}

function parseAmountFromLog(parsedLog: any) {
    // Create a new BigNumber instance from the hex string amount in the parsed log
    const humanReadableAmount = new utils.BigNumber(parsedLog.values.amount);
    const wei = new utils.BigNumber(10);
    const convertedAmount = humanReadableAmount.div(wei.pow(18));
    return convertedAmount.toString();
}

async function getTimestamp(
    provider: InfuraProvider,
    blockHash?: string
): Promise<number> {
    return blockHash ? (await getBlockTime(provider, blockHash)) / 1000 : 0;
    // return moment.unix(timestamp).format("D MMM");
}

async function getPayoutClaimedLogs(
    colonyClient: ColonyClient,
    provider: InfuraProvider
): Promise<MergedLog[]> {
    const eventFilter = colonyClient.filters.PayoutClaimed(null, null, null);
    const eventLogs = await getLogs(colonyClient, eventFilter);

    let timestampPromises: Promise<number>[] = [];

    let mergedLogs: MergedLog[] = [];
    for (let event of eventLogs) {
        const parsedLog = colonyClient.interface.parseLog(event);

        const name = parsedLog.name;
        const blockHash = event.blockHash;
        const amount = parseAmountFromLog(parsedLog);
        const token =
            tokenMap[parsedLog.values.token] || parsedLog.values.token;
        const fundingPotId = new utils.BigNumber(
            parsedLog.values.fundingPotId
        ).toString();
        const timestampPromise = getTimestamp(provider, blockHash);

        mergedLogs.push({
            name,
            blockHash,
            amount,
            token,
            fundingPotId,
            timestampPromise,

            // Assign to some value while we wait for the date to load
            timestamp: 0,
            date: "",
        });
    }

    return mergedLogs;
}

async function getColonyInitialisedLogs(
    colonyClient: ColonyClient,
    provider: InfuraProvider
): Promise<MergedLog[]> {
    const eventFilter = colonyClient.filters.ColonyInitialised(null, null);
    const eventLogs = await getLogs(colonyClient, eventFilter);

    let mergedLogs: MergedLog[] = [];
    for (let event of eventLogs) {
        mergedLogs.push({
            name: "ColonyInitialised",
            timestampPromise: getTimestamp(provider, event.blockHash),
            timestamp: 0,
            date: "",
        });
    }
    return mergedLogs;
}

async function getColonyRoleSetLogs(
    colonyClient: ColonyClient,
    provider: InfuraProvider
): Promise<MergedLog[]> {
    // I'm adding ts-ignore here because WE know that ColonyRoleSet
    // exists as a property of filters but Typescript doesn't since
    // filters can come from one of many different contract versions.
    //@ts-ignore
    const eventFilter = colonyClient.filters.ColonyRoleSet(
        null,
        null,
        null,
        null
    );
    const eventLogs = await getLogs(colonyClient, eventFilter);

    let mergedLogs: MergedLog[] = [];
    for (let event of eventLogs) {
        const parsedLog = colonyClient.interface.parseLog(event);

        const name = parsedLog.name;
        const blockHash = event.blockHash;
        const role = ColonyRole[parsedLog.values.role];
        const domainId = parsedLog.values.domainId;
        const timestampPromise = getTimestamp(provider, blockHash);
        const userAddress = parsedLog.values.user;

        mergedLogs.push({
            name,
            blockHash,
            role,
            domainId,
            userAddress,
            timestampPromise,

            // Assign to empty string while we wait for the date to load
            timestamp: 0,
            date: "",
        });
    }

    return mergedLogs;
}

async function getDomainAddedLogs(
    colonyClient: ColonyClient,
    provider: InfuraProvider
) {
    const eventFilter = colonyClient.filters.DomainAdded(null);
    const eventLogs = await getLogs(colonyClient, eventFilter);
    let mergedLogs: MergedLog[] = [];
    for (let event of eventLogs) {
        const parsedLog = colonyClient.interface.parseLog(event);

        const name = parsedLog.name;
        const blockHash = event.blockHash;
        const domainId = parsedLog.values.domainId;
        const timestampPromise = getTimestamp(provider, blockHash);

        mergedLogs.push({
            name,
            blockHash,
            domainId,
            timestampPromise,

            // Assign to empty string while we wait for the date to load
            timestamp: 0,
            date: "",
        });
    }

    return mergedLogs;
}

// log types as any because it's actual type is private
async function getUserAddress(
    colonyClient: ColonyClient,
    log: any
): Promise<string> {
    const humanReadableFundingPotId = new utils.BigNumber(
        log.values.fundingPotId
    ).toString();
    const { associatedTypeId } = await colonyClient.getFundingPot(
        humanReadableFundingPotId
    );
    const { recipient: userAddress } = await colonyClient.getPayment(
        associatedTypeId
    );
    return userAddress;
}
