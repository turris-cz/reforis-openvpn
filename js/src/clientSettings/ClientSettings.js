/*
 * Copyright (C) 2019-2022 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";

import AddSettingsForm from "./AddSettingsForm";
import AvailableSettins from "./AvailableSettings/AvailableSettings";

import "./ClientSettings.css";

export default function ClientSettings() {
    return (
        <>
            <h1>{_("Client Settings")}</h1>
            <p>
                {_(
                    'To use the OpenVPN client, you need to prepare a text file with client settings. If you want to connect to another Turris device, download the appropriate file from the "Client Registration" page.'
                )}
            </p>
            <AddSettingsForm />
            <AvailableSettins />
        </>
    );
}
