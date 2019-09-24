/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import PropTypes from "prop-types";

import { AlertContextProvider } from "./AlertContext";
import AuthorityStatus from "./AuthorityStatus";

OpenVPN.propTypes = {
    ws: PropTypes.object.isRequired,
};

export default function OpenVPN({ ws }) {
    return (
        <>
            <h1>{_("OpenVPN")}</h1>
            <AlertContextProvider>
                <AuthorityStatus ws={ws} />
            </AlertContextProvider>
        </>
    );
}
