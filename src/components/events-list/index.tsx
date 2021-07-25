import React from "react";
import styles from "./index.module.css";
import { usePayoutClaimedEvent } from "hooks/usePayoutClaimedEvent";
import { useColonyClient } from "hooks/useColonyClient";
import { useDomainAddedEvents } from "hooks/useDomainAddedEvents";
import { useColonyInitialisedEvents } from "hooks/useColonyInitialisedEvents";
import { useColonyRoleSetEvents } from "hooks/useColonyRoleSetEvents";

export const EventsList: React.FC = () => {
    const colonyClient = useColonyClient();
    const payoutClaimedEventData = usePayoutClaimedEvent(colonyClient);
    const domainAddedEvents = useDomainAddedEvents(colonyClient);
    const colonyInitialisedEvents = useColonyInitialisedEvents(colonyClient);
    const colonyRoleSetEvents = useColonyRoleSetEvents(colonyClient);

    console.log(colonyRoleSetEvents);

    return <div className={styles.eventsList}></div>;
};
