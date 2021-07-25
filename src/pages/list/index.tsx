import React from "react";
import styles from "./index.module.css";
import { EventsList } from "components/events-list";

export const List: React.FC = () => {
    return (
        <div className={styles.list}>
            <EventsList />
        </div>
    );
};
