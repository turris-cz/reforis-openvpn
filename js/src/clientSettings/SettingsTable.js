/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useUID } from "react-uid";

import {
    useAPIGet, useAPIDelete, formFieldsSize, useAlert, Button, SpinnerElement,
    API_STATE, withErrorMessage, withSpinnerOnSending, useAPIPut,
} from "foris";

import API_URLs from "API";

export default function SettingsTable() {
    const [getSettingsResponse, getSettings] = useAPIGet(API_URLs.clientSettings);
    useEffect(() => {
        getSettings();
    }, [getSettings]);

    return (
        <>
            <h3>{_("Available settings")}</h3>
            <p>{_("For each uploaded file a new OpenVPN client instance is created. Please check settings file for errors if instance is enabled and not running few minutes after setup.")}</p>
            <ClientTableWithErrorAndSpinner
                apiState={getSettingsResponse.state}
                settingsData={getSettingsResponse.data}
            />
        </>
    );
}

const ClientTableWithErrorAndSpinner = withErrorMessage(withSpinnerOnSending(ClientTable));

ClientTable.propTypes = {
    settingsData: PropTypes.array.isRequired,
};

function ClientTable({ settingsData }) {
    if (!settingsData || settingsData.length === 0) {
        return <p className="text-muted text-center">{_("There are no settings added yet.")}</p>;
    }

    return (
        <table className={`table table-hover mt-3 ${formFieldsSize}`}>
            <tbody>
                {settingsData.map((client) => <ClientRow key={client.id} client={client} />)}
            </tbody>
        </table>
    );
}

ClientRow.propTypes = {
    client: PropTypes.shape({
        id: PropTypes.string.isRequired,
        enabled: PropTypes.bool.isRequired,
        running: PropTypes.bool.isRequired,
    }).isRequired,
};

function ClientRow({ client }) {
    const uid = useUID();
    const [setAlert] = useAlert();

    const [putClientResponse, putClient] = useAPIPut(`${API_URLs.clientSettings}/${client.id}`);
    useEffect(() => {
        if (putClientResponse.state === API_STATE.ERROR) {
            setAlert(putClientResponse.data);
        }
    }, [putClientResponse, setAlert]);

    const [deleteClientResponse, deleteClient] = useAPIDelete(`${API_URLs.clientSettings}/${client.id}`);
    useEffect(() => {
        if (deleteClientResponse.state === API_STATE.ERROR) {
            setAlert(deleteClientResponse.data);
        }
    }, [deleteClientResponse, setAlert]);

    return (
        <tr>
            <td className="align-middle">
                <div className="custom-control custom-switch">
                    <input
                        type="checkbox"
                        className="custom-control-input"
                        id={uid}
                        defaultChecked={client.enabled}
                        onChange={(event) => putClient({ enabled: event.target.checked })}
                    />
                    <label className="custom-control-label" htmlFor={uid}>{client.id}</label>
                </div>
            </td>
            <td className="align-middle text-center">
                {client.enabled && <ClientStatus id={client.id} defaultStatus={client.running} />}
            </td>
            <td className="text-right">
                <button type="button" className="btn btn-danger" onClick={deleteClient}>
                    <i className="fa fa-trash-alt mr-2" />
                    {_("Delete")}
                </button>
            </td>
        </tr>
    );
}

ClientStatus.propTypes = {
    id: PropTypes.string.isRequired,
    defaultStatus: PropTypes.bool.isRequired,
};

function ClientStatus({ id, defaultStatus }) {
    // No need to worry about default state from props as any update will reload whole table
    const [status, setStatus] = useState(defaultStatus);

    const [response, getSettings] = useAPIGet(`${API_URLs.clientSettings}/${id}`);
    useEffect(() => {
        if (response.state === API_STATE.SUCCESS) {
            setStatus(response.data.running);
        }
    }, [response]);

    // GET is sent on demand hence INIT is not checked
    if (response.state === API_STATE.SENDING) {
        return <SpinnerElement />;
    }
    if (response.state === API_STATE.ERROR) {
        return <span className="text-danger">{_("Cannot refresh status")}</span>;
    }

    return (
        <>
            {status ? _("Running") : <span className="text-danger">{_("Not running")}</span>}
            <Button className="btn" aria-label={_("Check status")} onClick={getSettings}>
                <i className="fa fa-redo" />
            </Button>
        </>
    );
}
