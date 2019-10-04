/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import {
    AlertContextProvider, TextInput, CheckBox, useAPIGet, useForm, Spinner, useWSForisModule,
    validateIPv4Address,
} from "foris";

import API_URLs from "API";
import AddClientForm from "./AddClientForm";
import ClientTable from "./ClientTable";

ClientRegistration.propTypes = {
    ws: PropTypes.object.isRequired,
};

export default function ClientRegistration({ ws }) {
    const [authority, getAuthority] = useAPIGet(API_URLs.authority);
    useEffect(() => {
        getAuthority();
    }, [getAuthority]);

    let componentContent;
    if (authority.isError) {
        componentContent = <p className="text-center text-danger">{_("An error occurred during loading certificate authority details")}</p>;
    } else if (authority.isLoading || !authority.data) {
        componentContent = <Spinner className="my-3 text-center" />;
    } else if (authority.data.status !== "ready") {
        componentContent = <p>{_("You need to generate certificate authority in order to register clients.")}</p>;
    } else {
        componentContent = (
            <AlertContextProvider>
                <p>{_("You need to generate a config for each client that you wish to connect to your OpenVPN server.")}</p>
                <p>{_("To apply the client configuration you need to download it and put it into the OpenVPN config directory or alternatively open it using your OpenVPN client. You might need to restart your client afterwards.")}</p>
                <AddClientForm />
                <Clients ws={ws} />
            </AlertContextProvider>
        );
    }

    return (
        <>
            <h1>{_("Client Registration")}</h1>
            {componentContent}
        </>
    );
}

Clients.propTypes = {
    ws: PropTypes.object.isRequired,
};

function Clients({ ws }) {
    const [getClientsResponse, getClients] = useAPIGet(API_URLs.clients);
    useEffect(() => {
        getClients();
    }, [getClients]);

    // Refresh list of clients when certificate is being generated
    const [generateClientNotification] = useWSForisModule(ws, "openvpn", "generate_client");
    useEffect(() => {
        if (!generateClientNotification) {
            return;
        }
        if (["client_generating", "succeeded"].includes(generateClientNotification.status)) {
            getClients();
        }
    }, [generateClientNotification, getClients]);

    // Refresh list of clients after certificate is revoked
    const [revokeCertificateNotification] = useWSForisModule(ws, "openvpn", "revoke");
    useEffect(() => {
        if (!revokeCertificateNotification) {
            return;
        }
        if (revokeCertificateNotification.id) {
            getClients();
        }
    }, [revokeCertificateNotification, getClients]);

    // Handle server address override form
    const [formState, formChangeHandler] = useForm(serverAddressValidator);
    const formData = formState.data;
    const formErrors = formState.errors || {};
    useEffect(() => {
        const eventHandler = formChangeHandler((value) => ({ $set: { ...value } }));
        eventHandler({ target: { value: { address: "" } } });
    }, [formChangeHandler]);

    let componentContent;
    if (getClientsResponse.isError) {
        componentContent = <p className="text-center text-danger">{_("An error occurred during loading OpenVPN clients")}</p>;
    } else if (getClientsResponse.isLoading || !formData) {
        componentContent = <Spinner className="text-center" />;
    } else {
        componentContent = (
            <>
                <p dangerouslySetInnerHTML={{ __html: _("Be sure to check if server's IP address provided in you configuration file actually matches the public IP address of your router. You can set this address manually if the autodetection fails. This change is <strong>not</strong> stored anywhere and is applicable only to the config being currently downloaded.") }} />
                <ServerOverride
                    address={formData.address}
                    error={formErrors.address}
                    handleChange={formChangeHandler}
                />
                <ClientTable
                    clients={getClientsResponse.data}
                    address={formErrors.address ? undefined : formData.address}
                />
            </>
        );
    }

    return (
        <>
            <h3>{_("Registered clients")}</h3>
            {componentContent}
        </>
    );
}

function serverAddressValidator(formData) {
    const error = validateIPv4Address(formData.address);
    if (error) {
        return { address: error };
    }
    return undefined;
}

ServerOverride.propTypes = {
    address: PropTypes.string.isRequired,
    error: PropTypes.string,
    handleChange: PropTypes.func.isRequired,
};

function ServerOverride({ address, error, handleChange }) {
    const [serverOverride, setServerOverride] = useState(false);

    return (
        <>
            <CheckBox
                label={_("Override server address")}
                value={serverOverride}
                onChange={(event) => setServerOverride(event.target.checked)}
            />
            {serverOverride && (
                <TextInput
                    label={_("Router's public IPv4 address")}
                    value={address}
                    error={error}
                    onChange={handleChange((value) => ({ address: { $set: value } }))}
                />
            )}
        </>
    );
}
