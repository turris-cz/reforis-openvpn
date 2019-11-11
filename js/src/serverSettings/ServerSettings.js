/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect } from "react";
import PropTypes from "prop-types";

import { useAPIGet, withErrorMessage, withSpinnerOnSending } from "foris";

import API_URLs from "API";
import AuthorityStatus from "./AuthorityStatus";
import ServerSettingsForm from "./ServerSettingsForm";

ServerSettings.propTypes = {
    ws: PropTypes.object.isRequired,
};

export default function ServerSettings({ ws }) {
    const [authorityResponse, getAuthority] = useAPIGet(API_URLs.authority);
    useEffect(() => {
        getAuthority();
    }, [getAuthority]);

    const [settingsResponse, getSettings] = useAPIGet(API_URLs.serverSettings);
    useEffect(() => {
        getSettings();
    }, [getSettings]);

    return (
        <>
            <h1>{_("Server Settings")}</h1>
            <SettingsWithErrorAndSpinner
                apiState={[authorityResponse.state, settingsResponse.state]}
                ws={ws}
                authorityData={authorityResponse.data}
                settingsData={settingsResponse.data}
                onReload={getAuthority}
            />
        </>
    );
}

const SettingsWithErrorAndSpinner = withErrorMessage(withSpinnerOnSending(Settings));

Settings.propTypes = {
    ws: PropTypes.object.isRequired,
    authorityData: PropTypes.object.isRequired,
    settingsData: PropTypes.object.isRequired,
    onReload: PropTypes.func.isRequired,
};

function Settings({
    ws, authorityData, settingsData, onReload,
}) {
    return (
        <AuthorityStatus
            ws={ws}
            status={authorityData.status}
            serverEnabled={settingsData.enabled}
            onReload={onReload}
        >
            <ServerSettingsForm settingsData={settingsData} />
        </AuthorityStatus>
    );
}
