/*
 * Copyright (C) 2019-2022 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect } from "react";

import {
    useAPIGet,
    withErrorMessage,
    withSpinnerOnSending,
    formFieldsSize,
} from "foris";

import SettingsTable from "./SettingsTable/SettingsTable";
import API_URLs from "../../API";

export default function AvailableSettings() {
    const [getSettingsResponse, getSettings] = useAPIGet(
        API_URLs.clientSettings
    );

    useEffect(() => {
        getSettings();
    }, [getSettings]);

    return (
        <div className={formFieldsSize}>
            <h2>{_("Available Settings")}</h2>
            <p>
                {_(
                    "A new OpenVPN client instance is created for each uploaded file. Please recheck the settings file if the instance is enabled and not running in a few minutes after the setup."
                )}
            </p>
            <SettingsTableWithErrorAndSpinner
                apiState={getSettingsResponse.state}
                clientSettings={getSettingsResponse.data}
            />
        </div>
    );
}

const SettingsTableWithErrorAndSpinner = withErrorMessage(
    withSpinnerOnSending(SettingsTable)
);
