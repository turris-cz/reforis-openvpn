/*
 * Copyright (C) 2019-2022 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";

import PropTypes from "prop-types";

import ClientRow from "./ClientRow";

ClientTable.propTypes = {
    clientSettings: PropTypes.array.isRequired,
    editClientSettings: PropTypes.func.isRequired,
};

export default function ClientTable({ clientSettings, editClientSettings }) {
    if (!clientSettings || clientSettings.length === 0) {
        return (
            <p className="text-muted text-center">
                {_("There are no settings added yet.")}
            </p>
        );
    }

    return (
        <div className="table-responsive">
            <table className="table table-hover mb-0">
                <thead className="thead-light">
                    <tr>
                        <th>{_("Instances")}</th>
                        <th
                            scope="col"
                            aria-label={_("Actions")}
                            className="text-center"
                        />
                        <th
                            scope="col"
                            aria-label={_("Actions")}
                            className="text-end"
                        />
                    </tr>
                </thead>
                <tbody>
                    {clientSettings.map((client) => (
                        <ClientRow
                            key={client.id}
                            client={client}
                            editClientSettings={editClientSettings}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
