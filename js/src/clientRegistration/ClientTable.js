/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect } from "react";
import PropTypes from "prop-types";

import {
    formFieldsSize, SpinnerElement, useAlert, useAPIDelete, DownloadButton,
} from "foris";

import API_URLs from "API";

const clientShape = PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
});

ClientTable.propTypes = {
    clients: PropTypes.arrayOf(clientShape),
    address: PropTypes.string,
};

ClientTable.defaultProps = {
    clients: [],
};

export default function ClientTable({ clients, address }) {
    if (!clients || clients.length === 0) {
        return <p className="text-muted text-center">{_("There are no clients registered.")}</p>;
    }

    const rows = clients.map((client) => (
        <ClientRow
            key={client.id}
            client={client}
            address={address}
        />
    ));

    return (
        <table className={`table table-hover ${formFieldsSize}`}>
            <thead>
                <tr>
                    <th scope="col">{_("Client name")}</th>
                    <th scope="col" aria-label={_("Download")} />
                    <th scope="col" aria-label={_("Revoke access")} />
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
    );
}

ClientRow.propTypes = {
    client: clientShape.isRequired,
    address: PropTypes.string,
};

function ClientRow({ client, address }) {
    const [setAlert] = useAlert();

    const [deleteClientResponse, deleteClient] = useAPIDelete(`${API_URLs.clients}/${client.id}`);
    useEffect(() => {
        if (deleteClientResponse.isError) {
            setAlert(deleteClientResponse.data);
        }
    }, [deleteClientResponse, setAlert]);

    let componentContent;
    if (deleteClientResponse.isSending || client.status === "generating") {
        componentContent = <SpinnerElement />;
    } else if (client.status === "valid") {
        if (typeof address === "string") {
            componentContent = (
                <DownloadButton href={`${API_URLs.clients}/${client.id}?address=${address}`}>
                    {_("Download configuration")}
                </DownloadButton>
            );
        } else {
            // Passed address is invalid
            componentContent = <button type="button" className="btn btn-primary" disabled>{_("Download configuration")}</button>;
        }
    } else if (client.status === "revoked") {
        componentContent = <span>{_("Access revoked")}</span>;
    }

    return (
        <tr>
            <td className="align-middle">{client.name}</td>
            <td className="text-center align-middle">{componentContent}</td>
            <td className="text-right">
                {!deleteClientResponse.isSending && client.status === "valid"
                    && <button type="button" className="btn btn-danger" onClick={deleteClient}>{_("Revoke access")}</button>}
            </td>
        </tr>
    );
}
