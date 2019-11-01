/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect } from "react";
import PropTypes from "prop-types";

import { useAPIGet, Spinner } from "foris";

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

    let componentContent;
    const authorityData = authorityResponse.data;
    const settingsData = settingsResponse.data;
    if (authorityResponse.isError || settingsResponse.isError) {
        componentContent = (
            <>
                {authorityResponse.isError && <p className="text-center text-danger">{_("An error occurred during loading certificate authority details")}</p>}
                {settingsResponse.isError && <p className="text-center text-danger">{_("An error occurred during loading OpenVPN server settings")}</p>}
            </>
        );
    } else if (
        authorityResponse.isLoading
        || settingsResponse.isLoading
        || !authorityData
        || !settingsData
    ) {
        componentContent = <Spinner className="my-3 text-center" />;
    } else {
        componentContent = (
            <AuthorityStatus
                ws={ws}
                status={authorityData.status}
                serverEnabled={settingsData.enabled}
                onReload={getAuthority}
            >
                <ServerSettingsForm settingsData={settingsData} />
            </AuthorityStatus>
        );
    }

    return (
        <>
            <h1>{_("Server Settings")}</h1>
            {componentContent}
        </>
    );
}
