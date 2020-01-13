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
    withErrorMessage, withSpinnerOnSending, API_STATE, formFieldsSize,
} from "foris";

import API_URLs from "API";
import ClientTable from "./ClientTable";

Clients.propTypes = {
    ws: PropTypes.object.isRequired,
    setGenerating: PropTypes.func.isRequired,
};

export default function Clients({ ws, setGenerating }) {
    const [getClientsResponse, getClients] = useAPIGet(API_URLs.clients);
    useEffect(() => {
        getClients();
    }, [getClients]);

    const [clients, setClients] = useState([]);
    // Update list of clients when GET request is successful
    useEffect(() => {
        if (getClientsResponse.state === API_STATE.SUCCESS) {
            setClients(getClientsResponse.data);
        }
    }, [getClientsResponse]);

    // Refresh list of clients when certificate is being generated
    const [generateClientNotification] = useWSForisModule(ws, "openvpn", "generate_client");
    useEffect(() => {
        if (!generateClientNotification) {
            return;
        }
        if (["client_generating", "succeeded"].includes(generateClientNotification.status)) {
            getClients();
            if (generateClientNotification.status === "succeeded") {
                setGenerating(false);
            }
        }
    }, [generateClientNotification, getClients, setGenerating]);

    // Refresh list of clients after certificate is revoked
    const [revokeCertificateNotification] = useWSForisModule(ws, "openvpn", "revoke");
    useEffect(() => {
        if (!revokeCertificateNotification) {
            return;
        }
        if (revokeCertificateNotification.id) {
            setClients((clientsList) => {
                const clientsAfterRevoke = [...clientsList];
                const revokedClientIdx = clientsAfterRevoke.findIndex(
                    (client) => client.id === revokeCertificateNotification.id,
                );
                clientsAfterRevoke[revokedClientIdx].status = "revoked";
                return clientsAfterRevoke;
            });
        }
    }, [revokeCertificateNotification]);

    return (
        <>
            <h3>{_("Client configurations")}</h3>
            <ConfigurationsWithErrorAndSpinner
                apiState={getClientsResponse.state}
                clients={clients}
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
            <div className={formFieldsSize}>
                <ServerOverride
                    address={formData.address}
                    error={formErrors.address}
                    handleChange={formChangeHandler}
                />
                <ClientTable
                    clients={clients}
                    address={formErrors.address ? undefined : formData.address}
                />
            </div>
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
