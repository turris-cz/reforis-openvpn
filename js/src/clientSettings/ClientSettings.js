/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";

import AddSettingsForm from "./AddSettingsForm";
import SettingsTable from "./SettingsTable";

export default function ClientSettings() {
    return (
        <>
            <h1>{_("Client Settings")}</h1>
            <p>{_("In order to use OpenVPN client you need to prepare text file with client settings. If you want to connect to another Turris device, download appropriate file from \"Client Registration\" page.")}</p>
            <AddSettingsForm />
            <SettingsTable />
        </>
    );
}
