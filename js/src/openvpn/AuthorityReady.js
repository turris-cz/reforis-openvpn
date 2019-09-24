/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect, useContext } from "react";
import PropTypes from "prop-types";

import { Button, useAPIDelete, AlertContext } from "foris";

import API_URLs from "API";

AuthorityReady.propTypes = {
    onSuccess: PropTypes.func.isRequired,
};

export default function AuthorityReady({ onSuccess }) {
    const setAlert = useContext(AlertContext);

    const [deleteResponse, deleteCA] = useAPIDelete(API_URLs.authority);
    useEffect(() => {
        if (deleteResponse.isSuccess) {
            onSuccess();
        } else if (deleteResponse.isError) {
            setAlert(_("Cannot delete certificate authority"));
        }
    }, [deleteResponse, onSuccess, setAlert]);

    return (
        <>
            <h3>{_("Certificate authority")}</h3>
            <p>{_("Your certificate authority (CA) is set up properly.")}</p>
            <Button onClick={() => deleteCA()}>{_("Delete CA")}</Button>
        </>
    );
}
