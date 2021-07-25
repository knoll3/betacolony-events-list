import React from "react";
import styles from "./index.module.css";
import { usePayoutClaimedEvent } from "hooks/usePayoutClaimedEvent";
import { useColonyClient } from "hooks/useColonyClient";

export const EventsList: React.FC = () => {
    const colonyClient = useColonyClient();
    const payoutClaimedEventData = usePayoutClaimedEvent(colonyClient);

    console.log(payoutClaimedEventData);

    return <div className={styles.eventsList}></div>;
};
