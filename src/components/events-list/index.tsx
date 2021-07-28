import React from "react";
import styles from "./index.module.css";
import { useGetLogs } from "hooks/useGetLogs";
import { ListItem } from "components/list-item";

// The instructions suggested adding pagination or infinite scrolling to this component.
// I would have done so but pagination or infinite scrolling isn't practical in
// this context.
// The items in this list must be ordered chronologically. To do that the
// timestamp of the transaction must be loaded with the time consuming getBlockTime()
// method in the colony-js library. Thus you cannot sort the items
// until each one has been loaded. Since each item is already loaded anyway, there's
// no point in using pagination or infinite scrolling.
//
// In a larger scale application where you are using Redux to manage application
// state, it would be far easier to load items and sort them as they come in.
// Then pagination might make sense.
// There are plenty of optimizations that could be made, but this is well
// outside the scope of this task.
export const EventsList: React.FC = () => {
    const [logs, colonyClient] = useGetLogs();

    return (
        <div className={styles.eventsList}>
            {logs.map((log, i) => (
                <ListItem key={i} log={log} colonyClient={colonyClient} />
            ))}
            {logs.length === 0 && (
                <div className={styles.loading}>Loading. Please wait...</div>
            )}
        </div>
    );
};
