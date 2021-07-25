import React from "react";
import styles from "./index.module.css";
import { useColonyClient } from "hooks/useColonyClient";
import { useDataEvents } from "hooks/useDataEvents";

export const EventsList: React.FC = () => {
    const colonyClient = useColonyClient();
    const dataEvents = useDataEvents(colonyClient, "DomainAdded");

    console.log(dataEvents);

    return <div className={styles.eventsList}></div>;
};
