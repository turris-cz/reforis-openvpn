/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect } from "react";
import PropTypes from "prop-types";

import { useAPIGet, Spinner, AlertContextProvider } from "foris";

import API_URLs from "API";
import AuthorityStatus from "./AuthorityStatus";
import ServerSettings from "./ServerSettings";

OpenVPN.propTypes = {
    ws: PropTypes.object.isRequired,
};

export default function OpenVPN({ ws }) {
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
    if (
        authorityResponse.isLoading
        || settingsResponse.isLoading
        || !authorityData
        || !settingsData
    ) {
        componentContent = <Spinner className="my-3 text-center" />;
    } else if (authorityResponse.isError || settingsResponse.isError) {
        componentContent = (
            <>
                {authorityResponse.isError && <p className="text-center text-danger">{_("An error occurred during loading certificate authority details")}</p>}
                {settingsResponse.isError && <p className="text-center text-danger">{_("An error occurred during loading OpenVPN settings")}</p>}
            </>
        );
    } else {
        componentContent = (
            <>
                <AuthorityStatus
                    ws={ws}
                    status={authorityData.status}
                    serverEnabled={settingsData.enabled}
                    onReload={getAuthority}
                >
                    <ServerSettings settingsData={settingsData} />
                </AuthorityStatus>
            </>
        );
    }

    return (
        <>
            <h1>{_("OpenVPN")}</h1>
            <AlertContextProvider>
                {componentContent}
            </AlertContextProvider>
        </>
    );
}
