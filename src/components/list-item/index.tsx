import { ColonyClient } from "@colony/colony-js";
import { MergedLog } from "hooks/useGetLogs";
import { useUserAddress } from "hooks/useUserAddress";
import React from "react";
import styles from "./index.module.css";
import blockies from "blockies";

// ListItem should accept colonyClient as props to load the
// user address. It's easier and far faster to load the address in
// the useUserAddress hook.
interface ListItemProps {
    log: MergedLog;
    colonyClient: ColonyClient | null;
}

export const ListItem: React.FC<ListItemProps> = ({ log, colonyClient }) => {
    const secondaryText = log.date;

    // Load the user address for the PayoutClaimed event type.
    // This is far faster than loading it in the useGetLogs hook.
    // As a result you will see the items load and the addresses load
    // afterward.
    let userAddress = useUserAddress(log.fundingPotId, colonyClient);

    // If userAddress already exists on the log object (like with ColonyRoleSet)
    // then use it. Otherwise, keep the one loaded from useUserAddress
    // (like with PayoutClaimed).
    userAddress = log.userAddress || userAddress;

    // Load an icon from blockies. If userAddress doesn't exist, just use the blockHash
    const icon = blockies({ seed: userAddress || log.blockHash }).toDataURL();

    // Define the primary text based on the event type
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
                    <b>{log.role || ""}</b> role assigned to user{" "}
                    <b>{userAddress}</b> in domain{" "}
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
                    Domain <b>{log.domainId ? log.domainId.toString() : ""}</b>{" "}
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
                    <img
                        alt="blockie-img"
                        className={styles.iconImg}
                        src={icon}
                    />
                </div>
                <div className={styles.text}>
                    <div className={styles.primaryText}>{primaryText}</div>
                    <div className={styles.secondaryText}>{secondaryText}</div>
                </div>
            </div>
        </div>
    );
};
