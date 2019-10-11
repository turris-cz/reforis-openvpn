/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { useUID } from "react-uid";

import {
    useAPIGet, useAPIPatch, useAPIDelete, Spinner, formFieldsSize, AlertContext,
} from "foris";

import API_URLs from "API";

export default function SettingsTable() {
    const [getSettingsResponse, getSettings] = useAPIGet(API_URLs.clientSettings);
    const settingsData = getSettingsResponse.data;
    useEffect(() => {
        getSettings();
    }, [getSettings]);

    let componentContent;
    if (getSettingsResponse.isLoading) {
        componentContent = <Spinner className="my-3 text-center" />;
    } else if (getSettingsResponse.isError) {
        componentContent = <p className="text-center text-danger">{_("An error occurred during loading OpenVPN client settings")}</p>;
    } else if (!settingsData || settingsData.length === 0) {
        componentContent = <p className="text-muted text-center">{_("There are no settings added yet.")}</p>;
    } else {
        componentContent = (
            <table className={`table table-hover mt-3 ${formFieldsSize}`}>
                <tbody>
                    {settingsData.map((client) => <ClientRow key={client.id} client={client} />)}
                </tbody>
            </table>
        );
    }

    return (
        <>
            <h3>{_("Available settings")}</h3>
            {componentContent}
        </>
    );
}

ClientRow.propTypes = {
    client: PropTypes.shape({
        id: PropTypes.string.isRequired,
        enabled: PropTypes.bool.isRequired,
    }).isRequired,
};

function ClientRow({ client }) {
    const uid = useUID();
    const setAlert = useContext(AlertContext);

    const [patchClientResponse, patchClient] = useAPIPatch(`${API_URLs.clientSettings}/${client.id}`);
    useEffect(() => {
        if (patchClientResponse.isError) {
            setAlert(patchClientResponse.data);
        }
    }, [patchClientResponse, setAlert]);

    const [deleteClientResponse, deleteClient] = useAPIDelete(`${API_URLs.clientSettings}/${client.id}`);
    useEffect(() => {
        if (deleteClientResponse.isError) {
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
                        onChange={(event) => patchClient({ enabled: event.target.checked })}
                    />
                    <label className="custom-control-label" htmlFor={uid}>{client.id}</label>
                </div>
            </td>
            <td className="text-right">
                <button type="button" className="btn btn-danger" onClick={deleteClient}>{_("Delete")}</button>
            </td>
        </tr>
    );
}
