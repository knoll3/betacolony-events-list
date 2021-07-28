import { ColonyClient } from "@colony/colony-js";
import { InfuraProvider } from "ethers/providers";
import { MergedLog } from "hooks/useGetLogs";
import { useLogDate } from "hooks/useLogDate";
import { useUserAddress } from "hooks/useUserAddress";
import React from "react";
import styles from "./index.module.css";
import blockies from "blockies";

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
    const secondaryText = log.date;
    let userAddress = useUserAddress(log.fundingPotId, colonyClient);
    userAddress = log.userAddress || userAddress;
    const icon = blockies({ seed: userAddress || log.blockHash }).toDataURL();

    let primaryText = <React.Fragment></React.Fragment>;
    switch (log.name) {
        case "ColonyInitialised": {
            primaryText = (
                <React.Fragment>
                    Congratulations! It's a beautiful baby colony!
                </React.Fragment>
            );
            break;
        }
        case "ColonyRoleSet": {
            primaryText = (
                <React.Fragment>
                    <b>{log.role || ""}</b> role assigned to user
                    <b>{userAddress}</b> in domain
                    <b>{log.domainId ? log.domainId.toString() : ""}</b>.
                </React.Fragment>
            );
            break;
        }
        case "PayoutClaimed": {
            primaryText = (
                <React.Fragment>
                    User <b>{userAddress}</b> claimed{" "}
                    <b>
                        {log.amount || ""}
                        {log.token || ""}
                    </b>{" "}
                    payout from pot <b>{log.fundingPotId || ""}</b>.
                </React.Fragment>
            );
            break;
        }
        case "DomainAdded": {
            primaryText = (
                <React.Fragment>
                    Domain <b>{log.domainId ? log.domainId.toString() : ""}</b>.
                    added.
                </React.Fragment>
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
                <div className={styles.icon}>
                    <img className={styles.iconImg} src={icon} />
                </div>
                <div className={styles.text}>
                    <div className={styles.primaryText}>{primaryText}</div>
                    <div className={styles.secondaryText}>{secondaryText}</div>
                </div>
            </div>
        </div>
    );
};
