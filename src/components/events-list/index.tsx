import React from "react";
import styles from "./index.module.css";
import { useGetLogs } from "hooks/useGetLogs";
import { ListItem } from "components/list-item";
import { useLogDate } from "hooks/useLogDate";

export const EventsList: React.FC = () => {
    const [logs, colonyClient, provider] = useGetLogs();

    return (
        <div className={styles.eventsList}>
            {logs.map((log, i) => (
                <ListItem
                    key={i}
                    log={log}
                    colonyClient={colonyClient}
                    provider={provider}
                />
            ))}
        </div>
    );
};
