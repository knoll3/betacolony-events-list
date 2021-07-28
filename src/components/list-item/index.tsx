import { ColonyClient } from "@colony/colony-js";
import { InfuraProvider } from "ethers/providers";
import { MergedLog } from "hooks/useGetLogs";
import { useLogDate } from "hooks/useLogDate";
import { useUserAddress } from "hooks/useUserAddress";
import React from "react";
import styles from "./index.module.css";

// ListItem should accept colonyClient and provider as props to load the
// user address and the block timestamp. The address and timestamp are being
// loaded in this component so that everything else can render while these values
// are loading.
interface ListItemProps {
    log: MergedLog;
    colonyClient: ColonyClient | null;
    provider: InfuraProvider;
}

export const ListItem: React.FC<ListItemProps> = ({
    log,
    colonyClient,
    provider,
}) => {
    // const secondaryText = useLogDate(log.blockHash, provider);
    const secondaryText = log.date;
    let userAddress = useUserAddress(log.fundingPotId, colonyClient);
    userAddress = log.userAddress || userAddress;
    // const userAddress = log.userAddress || "";

    let primaryText = <span></span>;
    switch (log.name) {
        case "ColonyInitialised": {
            primaryText = (
                <span>Congratulations! It's a beautiful baby colony!</span>
            );
            break;
        }
        case "ColonyRoleSet": {
            primaryText = (
                <span>
                    <b>{log.role || ""}</b> role assigned to user
                    <b>{userAddress}</b> in domain
                    <b>{log.domainId ? log.domainId.toString() : ""}</b>.
                </span>
            );
            break;
        }
        case "PayoutClaimed": {
            primaryText = (
                <span>
                    User <b>{userAddress}</b> claimed{" "}
                    <b>
                        {log.amount || ""}
                        {log.token || ""}
                    </b>{" "}
                    payout from pot <b>{log.fundingPotId || ""}</b>.
                </span>
            );
            break;
        }
        case "DomainAdded": {
            primaryText = (
                <span>
                    Domain <b>{log.domainId ? log.domainId.toString() : ""}</b>.
                    added.
                </span>
            );
            break;
        }
        default: {
            break;
        }
    }

    return (
        <div className={styles.listItem}>
            <div className={styles.content}>
                <div className={styles.primaryText}>{primaryText}</div>
                <div className={styles.secondaryText}>{secondaryText}</div>
            </div>
        </div>
    );
};
