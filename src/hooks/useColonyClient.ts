import { useEffect, useState } from "react";
import { ColonyClient } from "@colony/colony-js";
import { getColonyNetworkClient, Network } from "@colony/colony-js";
import { ethers, Wallet } from "ethers";
import { InfuraProvider } from "ethers/providers";

export function useColonyClient() {
    // Set up the network address constants
    const MAINNET_NETWORK_ADDRESS = `0x5346D0f80e2816FaD329F2c140c870ffc3c3E2Ef`;
    const MAINNET_BETACOLONY_ADDRESS = `0x869814034d96544f3C62DE2aC22448ed79Ac8e70`;

    // Set log level for ethers to error only
    ethers.errors.setLogLevel("error");

    // Get a new Infura provider
    const provider = new InfuraProvider();

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

    const [colonyClient, setColonyClient] = useState({} as ColonyClient);

    useEffect(() => {
        if (Object.keys(colonyClient).length !== 0) return;
        (async () => {
            // Get the colony client instance for the betacolony
            const _colonyClient = await networkClient.getColonyClient(
                MAINNET_BETACOLONY_ADDRESS
            );
            setColonyClient(_colonyClient);
        })();
    }, [MAINNET_BETACOLONY_ADDRESS, networkClient]);

    return colonyClient;
}
