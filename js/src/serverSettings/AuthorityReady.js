/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect } from "react";
import PropTypes from "prop-types";

import { Button, useAPIDelete, useAlert } from "foris";

import API_URLs from "API";

AuthorityReady.propTypes = {
    serverEnabled: PropTypes.bool.isRequired,
    onReload: PropTypes.func.isRequired,
};

export default function AuthorityReady({ serverEnabled, onReload }) {
    const [setAlert] = useAlert();

    const [deleteResponse, deleteCA] = useAPIDelete(API_URLs.authority);
    useEffect(() => {
        if (deleteResponse.isSuccess) {
            onReload();
        } else if (deleteResponse.isError) {
            setAlert(_("Cannot delete certificate authority"));
        }
    }, [deleteResponse, onReload, setAlert]);

    return (
        <>
            <h3>{_("Certificate authority")}</h3>
            {serverEnabled
                ? <p>{_("You can't delete the CA while the OpenVPN server is enabled. To delete the CA you need to disable the server configuration first.")}</p>
                : (
                    <>
                        <p>{_("Your certificate authority (CA) is set up properly. Please note that if you delete it all clients will have their access revoked.")}</p>
                        <Button onClick={() => deleteCA()} forisFormSize>{_("Delete CA")}</Button>
                    </>
                )}
        </>
    );
}
