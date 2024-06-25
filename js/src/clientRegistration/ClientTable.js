/*
 * Copyright (C) 2019-2024 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect } from "react";

import {
    SpinnerElement,
    useAlert,
    useAPIDelete,
    API_STATE,
    Button,
    withEither,
} from "foris";
import DownloadButton from "foris/bootstrap/DownloadButton";
import PropTypes from "prop-types";

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
        return (
            <p className="text-muted text-center">
                {_("There are no clients registered.")}
            </p>
        );
    }

    const rows = clients.map((client) => (
        <ClientRow key={client.id} client={client} address={address} />
    ));

    return (
        <div className="table-responsive">
            <table className="table table-hover">
                <thead className="thead-light">
                    <tr>
                        <th scope="col">{_("Client name")}</th>
                        <th scope="col" aria-label={_("Actions")} />
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        </div>
    );
}

ClientRow.propTypes = {
    client: clientShape.isRequired,
    address: PropTypes.string,
};

function ClientRow({ client, address }) {
    const [setAlert] = useAlert();

    const [deleteClientResponse, deleteClient] = useAPIDelete(
        `${API_URLs.clients}/${client.id}`
    );
    useEffect(() => {
        if (deleteClientResponse.state === API_STATE.ERROR) {
            setAlert(deleteClientResponse.data);
        }
    }, [deleteClientResponse, setAlert]);

    return (
        <tr>
            <td className="align-middle">{client.name}</td>
            <td className="text-end">
                <ActionsWithGeneratingAndRevoked
                    apiState={deleteClientResponse.state}
                    client={client}
                    address={address}
                    onRevoke={deleteClient}
                    small
                />
            </td>
        </tr>
    );
}

const withGenerating = withEither(
    (props) =>
        props.apiState === API_STATE.SENDING ||
        props.client.status === "generating",
    SpinnerElement
);
const withRevoked = withEither(
    (props) => props.client.status === "revoked",
    () => <span className="text-muted">{_("Access revoked")}</span>
);
const ActionsWithGeneratingAndRevoked = withGenerating(withRevoked(Actions));

Actions.propTypes = {
    client: clientShape.isRequired,
    address: PropTypes.string,
    onRevoke: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

Actions.defaultProps = {
    disabled: false,
};

function Actions({ client, address, onRevoke, disabled }) {
    const downloadDisabled = disabled || typeof address !== "string";
    return (
        <div className="btn-group mb-0" role="group">
            <DownloadButton
                href={`${API_URLs.clients}/${client.id}?address=${address}`}
                className={`btn-primary btn-sm ${
                    downloadDisabled ? "disabled" : ""
                }`.trim()}
                onClick={
                    downloadDisabled ? (event) => event.preventDefault() : null
                }
            >
                {_("Download")}
            </DownloadButton>
            <Button
                onClick={onRevoke}
                className="btn-danger btn-sm"
                disabled={disabled}
            >
                {_("Revoke")}
            </Button>
        </div>
    );
}
