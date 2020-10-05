/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { useAPIGet, withErrorMessage, withSpinnerOnSending } from "foris";

import API_URLs from "API";
import Clients from "./Clients";
import AddClientForm from "./AddClientForm";

ClientRegistration.propTypes = {
    ws: PropTypes.object.isRequired,
};

export default function ClientRegistration({ ws }) {
    const [authority, getAuthority] = useAPIGet(API_URLs.authority);
    useEffect(() => {
        getAuthority();
    }, [getAuthority]);

    return (
        <>
            <h1>{_("Client Registration")}</h1>
            <RegistrationWithErrorAndSpinner
                apiState={authority.state}
                ws={ws}
                certificateAuthority={authority.data}
            />
        </>
    );
}

const RegistrationWithErrorAndSpinner = withErrorMessage(
    withSpinnerOnSending(Registration)
);

Registration.propTypes = {
    ws: PropTypes.object.isRequired,
    certificateAuthority: PropTypes.object.isRequired,
};

function Registration({ ws, certificateAuthority }) {
    const [generating, setGenerating] = useState(false);

    if (certificateAuthority.status !== "ready") {
        return (
            <p>
                {_(
                    "You need to generate certificate authority in order to register clients."
                )}
            </p>
        );
    }
    return (
        <>
            <p>
                {_(
                    "You need to generate a configuration file for each client that you wish to connect to your OpenVPN server."
                )}
            </p>
            <p>
                {_(
                    "To apply the client configuration you need to download it and put it into the OpenVPN configuration directory or alternatively open it using your OpenVPN client. You might need to restart your client afterwards."
                )}
            </p>
            <AddClientForm
                generating={generating}
                setGenerating={setGenerating}
            />
            <Clients ws={ws} setGenerating={setGenerating} />
        </>
    );
}
