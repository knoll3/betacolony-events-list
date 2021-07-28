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

const tokenMap: Record<string, string> = {
    "0x0dd7b8f3d1fa88FAbAa8a04A0c7B52FC35D4312c": "BLNY",
    "0x6B175474E89094C44Da98b954EedeAC495271d0F": "DAI",
};

/**
 * A custom object containing the useful properties from the
 * unparsed logs and the parsed logs
 */
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
}

/*
 * Returns all logs. Also returns the colony client which is used to load the
 * user address for the PayoutClaimed event in the ListItem component.
 */
export function useGetLogs(): [MergedLog[], ColonyClient | null] {
    const [logs, setLogs] = React.useState([] as MergedLog[]);
    const [colonyClient, setColonyClient] = React.useState<ColonyClient | null>(
        null
    );

    // Set ethers log level to errors only
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

    // Create the mergedLogs array by gathering the logs for each event type.
    useEffect(() => {
        (async () => {
            // Don't run if the client and logs already exist.
            // This is to help prevent excessive rendering.
            if (logs.length > 0 && colonyClient) return;

            // Get the colony client instance for the betacolony
            const _colonyClient = await networkClient.getColonyClient(
                MAINNET_BETACOLONY_ADDRESS
            );
            setColonyClient(_colonyClient);

            // Concatenate the 4 event logs into one mergedLogs array
            let mergedLogs: MergedLog[] = [];
            mergedLogs = mergedLogs.concat(
                await getPayoutClaimedLogs(_colonyClient, provider),
                await getColonyInitialisedLogs(_colonyClient, provider),
                await getColonyRoleSetLogs(_colonyClient, provider),
                await getDomainAddedLogs(_colonyClient, provider)
            );

            // Wait for each timestamp and date to load so we can sort the logs.
            // This also adds the date to each log. The promises are added for each
            // event type as they create their own mergedLogs.
            mergedLogs = await loadDates(mergedLogs);

            // Sort the logs in reverse chronoloical order (newest first)
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

    return [logs, colonyClient];
}

/**
 * Get all PayoutClaimed event logs
 *
 * Timestamps are not added in this method, only a timestamp promise for each log.
 * The promises are collected later in the loadDates method and resolved
 * synchronously to populate the log with timestamps. This is far faster than
 * using async/await to load the timestamps.
 */
async function getPayoutClaimedLogs(
    colonyClient: ColonyClient,
    provider: InfuraProvider
): Promise<MergedLog[]> {
    // Get the filter
    // There's a corresponding filter method for all event types
    const eventFilter = colonyClient.filters.PayoutClaimed(null, null, null);

    // Get the raw logs array
    const eventLogs = await getLogs(colonyClient, eventFilter);

    let mergedLogs: MergedLog[] = [];
    for (let event of eventLogs) {
        // Parse the event log into something more useful
        const parsedLog = colonyClient.interface.parseLog(event);

        // Define the values for the custom mergedLog object
        const name = parsedLog.name;
        const blockHash = event.blockHash;
        const amount = parseAmountFromLog(parsedLog);
        const token =
            tokenMap[parsedLog.values.token] || parsedLog.values.token;
        const fundingPotId = new utils.BigNumber(
            parsedLog.values.fundingPotId
        ).toString();

        // Use a promise to be resolved later. We could ignore the promise
        // resolution and add an "await" here but then the logs will load
        // far too slowly.
        const timestampPromise = getTimestamp(provider, blockHash);

        // Create the mergedLog object and add to the mergedLogs array
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

/*
 * Get all ColonyInitialised event logs (there should probably ever only be one)
 *
 * Timestamps are not added in this method, only a timestamp promise for each log.
 * The promises are collected later in the loadDates method and resolved
 * synchronously to populate the log with timestamps. This is far faster than
 * using async/await to load the timestamps.
 */
async function getColonyInitialisedLogs(
    colonyClient: ColonyClient,
    provider: InfuraProvider
): Promise<MergedLog[]> {
    // Get the filter
    // There's a corresponding filter method for all event types
    const eventFilter = colonyClient.filters.ColonyInitialised(null, null);

    // Get the raw logs array
    const eventLogs = await getLogs(colonyClient, eventFilter);

    let mergedLogs: MergedLog[] = [];
    for (let event of eventLogs) {
        // Create the mergedLog object and add to the mergedLogs array
        mergedLogs.push({
            name: "ColonyInitialised",
            timestampPromise: getTimestamp(provider, event.blockHash),
            timestamp: 0,
            date: "",
        });
    }
    return mergedLogs;
}

/**
 * Get all ColonyRoleSet event logs
 *
 * Timestamps are not added in this method, only a timestamp promise for each log.
 * The promises are collected later in the loadDates method and resolved
 * synchronously to populate the log with timestamps. This is far faster than
 * using async/await to load the timestamps.
 */
async function getColonyRoleSetLogs(
    colonyClient: ColonyClient,
    provider: InfuraProvider
): Promise<MergedLog[]> {
    // Get the filter. There's a corresponding filter method for all event types.
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

    // Get the raw logs array
    const eventLogs = await getLogs(colonyClient, eventFilter);

    let mergedLogs: MergedLog[] = [];
    for (let event of eventLogs) {
        // Parse the event log into something more useful
        const parsedLog = colonyClient.interface.parseLog(event);

        // Define the values for the custom mergedLog object
        const name = parsedLog.name;
        const blockHash = event.blockHash;
        const role = ColonyRole[parsedLog.values.role];
        const domainId = parsedLog.values.domainId;

        // The userAddress is included in the parsedLog data so we don't
        // need to load it later like we are with the PayoutClaimed event
        const userAddress = parsedLog.values.user;

        // Use a promise to be resolved later. We could ignore the promise
        // resolution and add an "await" here but then the logs will load
        // far too slowly.
        const timestampPromise = getTimestamp(provider, blockHash);

        // Create the mergedLog object and add to the mergedLogs array
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
    // Get the filter
    // There's a corresponding filter method for all event types
    const eventFilter = colonyClient.filters.DomainAdded(null);

    // Get the raw logs array
    const eventLogs = await getLogs(colonyClient, eventFilter);

    let mergedLogs: MergedLog[] = [];
    for (let event of eventLogs) {
        // Parse the event log into something more useful
        const parsedLog = colonyClient.interface.parseLog(event);

        // Define the values for the custom mergedLog object
        const name = parsedLog.name;
        const blockHash = event.blockHash;
        const domainId = parsedLog.values.domainId;

        // Use a promise to be resolved later. We could ignore the promise
        // resolution and add an "await" here but then the logs will load
        // far too slowly.
        const timestampPromise = getTimestamp(provider, blockHash);

        // Create the mergedLog object and add to the mergedLogs array
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

/**
 * Loads the timestamps and dates
 *
 * Each log's timestamp is populated synchronously.
 * Promise resolves when the last timestamp loads. Timestamp promises are created
 * as each event type's mergedLogs are created.
 */
function loadDates(mergedLogs: MergedLog[]): Promise<MergedLog[]> {
    return new Promise((resolve, reject) => {
        // Get the timestamp promises from each log
        const timestampPromises = mergedLogs.map((x) => x.timestampPromise);

        // When each promise is resolved, this promise should resolve with new
        // logs that have timestamps and dates
        Promise.all(timestampPromises).then((timestamps) => {
            const logsWithDates = mergedLogs.map((log, i) => {
                const timestamp = timestamps[i];
                return {
                    ...log,
                    timestamp,

                    // Use the moment library to format the timestamp
                    date: moment.unix(timestamp).format("D MMM"),
                };
            });
            resolve(logsWithDates);
        });
    });
}

/**
 * Parses the amount value into a usable number
 */
function parseAmountFromLog(parsedLog: any) {
    // Create a new BigNumber instance from the hex string amount in the parsed log
    const humanReadableAmount = new utils.BigNumber(parsedLog.values.amount);
    const wei = new utils.BigNumber(10);
    const convertedAmount = humanReadableAmount.div(wei.pow(18));
    return convertedAmount.toString();
}

/**
 * Loads the timestamp with the getBlockTime method in the colony-js library
 *
 * These promises are embeded into the mergedLogs array and later resolved into
 * timestamps.
 */
async function getTimestamp(
    provider: InfuraProvider,
    blockHash?: string
): Promise<number> {
    return blockHash ? (await getBlockTime(provider, blockHash)) / 1000 : 0;
}
