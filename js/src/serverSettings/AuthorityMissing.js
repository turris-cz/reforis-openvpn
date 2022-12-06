/*
 * Copyright (C) 2019-2022 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect } from "react";
import PropTypes from "prop-types";

import { Button, useAPIPost, useAlert, API_STATE } from "foris";

import API_URLs from "API";

AuthorityMissing.propTypes = {
    onReload: PropTypes.func.isRequired,
};

export default function AuthorityMissing({ onReload }) {
    const [setAlert] = useAlert();

    const [createResponse, createCA] = useAPIPost(API_URLs.authority);
    useEffect(() => {
        if (createResponse.state === API_STATE.SUCCESS) {
            onReload();
        } else if (createResponse.state === API_STATE.ERROR) {
            setAlert(_("Cannot generate certificate authority"));
        }
    }, [createResponse, onReload, setAlert]);

    return (
        <div className="card p-4">
            <h2>{_("Certificate Authority")}</h2>
            <p>
                {_(
                    "Currently there is no OpenVPN certificate authority (CA). A CA is required to generate client certificates to authenticate to the OpenVPN server. To proceed you need to generate it first."
                )}
            </p>
            <p className="text-center text-muted">
                {_("No certification authority.")}
            </p>
            <div className="text-right">
                <Button
                    onClick={() => createCA()}
                    forisFormSize
                    loading={createResponse.state === API_STATE.SENDING}
                >
                    {_("Generate CA")}
                </Button>
            </div>
        </div>
    );
}
