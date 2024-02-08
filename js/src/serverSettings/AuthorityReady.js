/*
 * Copyright (C) 2020-2022 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect } from "react";

import {
    Button,
    useAPIDelete,
    useAlert,
    API_STATE,
    formFieldsSize,
} from "foris";
import PropTypes from "prop-types";

import API_URLs from "API";

AuthorityReady.propTypes = {
    serverEnabled: PropTypes.bool.isRequired,
    onReload: PropTypes.func.isRequired,
};

export default function AuthorityReady({ serverEnabled, onReload }) {
    const [setAlert] = useAlert();
    const [deleteResponse, deleteCA] = useAPIDelete(API_URLs.authority);

    useEffect(() => {
        if (deleteResponse.state === API_STATE.SUCCESS) {
            onReload();
        } else if (deleteResponse.state === API_STATE.ERROR) {
            setAlert(_("Cannot delete certificate authority"));
        }
    }, [deleteResponse, onReload, setAlert]);

    return (
        <div className={formFieldsSize}>
            <h2>{_("Certificate Authority")}</h2>
            {serverEnabled ? (
                <p>
                    {_(
                        "You can't delete the CA while the OpenVPN server is enabled. To delete the CA, you need to disable the server configuration first."
                    )}
                </p>
            ) : (
                <p>
                    {_(
                        "Your certificate authority (CA) is set up properly. Please note that if you delete it, all clients will have their access revoked."
                    )}
                </p>
            )}
            <div className="text-right">
                <Button
                    onClick={() => deleteCA()}
                    className="btn-danger"
                    forisFormSize
                    loading={deleteResponse.state === API_STATE.SENDING}
                    disabled={serverEnabled}
                >
                    {_("Delete CA")}
                </Button>
            </div>
        </div>
    );
}
