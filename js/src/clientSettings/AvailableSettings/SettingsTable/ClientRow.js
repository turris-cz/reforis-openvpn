/*
 * Copyright (C) 2019-2024 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect } from "react";

import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    useAPIDelete,
    useAlert,
    Button,
    API_STATE,
    useAPIPut,
    Switch,
} from "foris";
import PropTypes from "prop-types";

import API_URLs from "API";

import ClientStatus from "./ClientStatus";

ClientRow.propTypes = {
    client: PropTypes.shape({
        id: PropTypes.string.isRequired,
        enabled: PropTypes.bool.isRequired,
        running: PropTypes.bool.isRequired,
    }).isRequired,
    editClientSettings: PropTypes.func.isRequired,
};

export default function ClientRow({ client, editClientSettings }) {
    const [setAlert] = useAlert();

    const [putClientResponse, putClient] = useAPIPut(
        `${API_URLs.clientSettings}/${client.id}`
    );

    useEffect(() => {
        if (putClientResponse.state === API_STATE.ERROR) {
            setAlert(putClientResponse.data);
        }
    }, [putClientResponse, setAlert]);

    const [deleteClientResponse, deleteClient] = useAPIDelete(
        `${API_URLs.clientSettings}/${client.id}`
    );

    useEffect(() => {
        if (deleteClientResponse.state === API_STATE.ERROR) {
            setAlert(deleteClientResponse.data);
        }
    }, [deleteClientResponse, setAlert]);

    const buttonDisabled =
        deleteClientResponse.state === API_STATE.SENDING ||
        putClientResponse.state === API_STATE.SENDING;

    return (
        <tr>
            <td className="align-middle">
                <Switch
                    label={client.id}
                    checked={client.enabled}
                    onChange={(event) => {
                        putClient({
                            data: { enabled: event.target.checked },
                        });
                    }}
                    disabled={buttonDisabled}
                    className="mb-0"
                />
            </td>
            <td className="align-middle text-center">
                {client.enabled && (
                    <ClientStatus
                        id={client.id}
                        defaultStatus={client.running}
                    />
                )}
            </td>
            <td className="text-end">
                <ClientSettingsActions
                    client={client}
                    editClientSettings={editClientSettings}
                    deleteClient={deleteClient}
                    disabled={buttonDisabled}
                />
            </td>
        </tr>
    );
}

ClientSettingsActions.propTypes = {
    client: PropTypes.object,
    editClientSettings: PropTypes.func,
    deleteClient: PropTypes.func,
    disabled: PropTypes.bool,
};

function ClientSettingsActions({
    client,
    editClientSettings,
    deleteClient,
    disabled,
}) {
    return (
        <div
            className="btn-group btn-group-sm mb-0"
            role="group"
            aria-label={_("Actions")}
        >
            <Button onClick={() => editClientSettings(client)}>
                <span className="d-xl-none">
                    <FontAwesomeIcon icon={faEdit} className="fa-sm" />
                </span>
                <span className="d-none d-xl-block">
                    <FontAwesomeIcon icon={faEdit} className="fa-sm me-1" />
                    {_("Edit")}
                </span>
            </Button>
            <Button
                onClick={deleteClient}
                className="btn-danger"
                disabled={disabled}
            >
                <span className="d-xl-none">
                    <FontAwesomeIcon icon={faTrash} className="fa-sm" />
                </span>
                <span className="d-none d-xl-block">
                    <FontAwesomeIcon icon={faTrash} className="fa-sm me-1" />
                    {_("Delete")}
                </span>
            </Button>
        </div>
    );
}
