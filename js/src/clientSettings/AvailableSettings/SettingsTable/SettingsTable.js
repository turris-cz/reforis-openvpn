/*
 * Copyright (C) 2019-2022 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useState } from "react";

import PropTypes from "prop-types";

import ClientTable from "./ClientTable";
import SettingsModal from "../SettingsModal/SettingsModal";

SettingsTable.propTypes = {
    clientSettings: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            enabled: PropTypes.bool.isRequired,
            running: PropTypes.bool.isRequired,
            credentials: PropTypes.shape({
                username: PropTypes.string.isRequired,
                password: PropTypes.string.isRequired,
            }),
        })
    ).isRequired,
};

export default function SettingsTable({ clientSettings }) {
    const [clientToEdit, setClientToEdit] = useState(null);
    const [isClientModalShown, setIsClientModalShown] = useState(false);

    const handleEditClientSettings = (client) => {
        setClientToEdit(client);
        setIsClientModalShown(true);
    };

    return (
        <>
            <ClientTable
                clientSettings={clientSettings}
                editClientSettings={handleEditClientSettings}
            />
            <SettingsModal
                shown={isClientModalShown}
                setShown={setIsClientModalShown}
                client={clientToEdit}
            />
        </>
    );
}
