/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect, useContext } from "react";
import PropTypes from "prop-types";

import { Button, useAPIPost } from "foris";

import API_URLs from "API";
import AlertContext from "./AlertContext";

AuthorityMissing.propTypes = {
    onSuccess: PropTypes.func.isRequired,
};

export default function AuthorityMissing({ onSuccess }) {
    const setAlert = useContext(AlertContext);

    const [createResponse, createCA] = useAPIPost(API_URLs.authority);
    useEffect(() => {
        if (createResponse.isSuccess) {
            onSuccess();
        } else if (createResponse.isError) {
            setAlert(_("Cannot generate certificate authority"));
        }
    }, [createResponse, onSuccess, setAlert]);

    return (
        <>
            <h3>{_("No certification authority")}</h3>
            <p>{_("Currently there is no OpenVPN certificate authority (CA). A CA is required to generate client certificates to authenticate to the OpenVPN server. To proceed you need to generate it first.")}</p>
            <Button onClick={() => createCA()}>{_("Generate CA")}</Button>
        </>
    );
}
