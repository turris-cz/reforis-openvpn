/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import {
    TextInput, CheckBox, useAPIGet, useForm, useWSForisModule, validateIPv4Address,
    withErrorMessage, withSpinnerOnSending,
} from "foris";

import API_URLs from "API";
import ClientTable from "./ClientTable";

Clients.propTypes = {
    ws: PropTypes.object.isRequired,
};

export default function Clients({ ws }) {
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

    return (
        <>
            <h3>{_("Registered clients")}</h3>
            <ConfigurationsWithErrorAndSpinner
                apiState={getClientsResponse.state}
                clients={getClientsResponse.data}
            />
        </>
    );
}

const ConfigurationsWithErrorAndSpinner = withErrorMessage(withSpinnerOnSending(Configurations));

Configurations.propTypes = {
    clients: PropTypes.array.isRequired,
};

function Configurations({ clients }) {
    // Handle server address override form
    const [formState, formChangeHandler, reloadForm] = useForm(serverAddressValidator);
    const formData = formState.data;
    const formErrors = formState.errors || {};
    useEffect(() => {
        reloadForm({ address: "" });
    }, [reloadForm]);

    if (!formData) {
        return null;
    }

    return (
        <>
            <p dangerouslySetInnerHTML={{ __html: _("Be sure to check if server's IP address provided in configuration file actually matches the public IP address of your router. You can set this address manually if the autodetection fails. This change is <strong>not</strong> stored anywhere and is applicable only to the configuration being currently downloaded.") }} />
            <ServerOverride
                address={formData.address}
                error={formErrors.address}
                handleChange={formChangeHandler}
            />
            <ClientTable
                clients={clients}
                address={formErrors.address ? undefined : formData.address}
            />
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
