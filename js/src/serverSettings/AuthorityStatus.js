/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import PropTypes from "prop-types";

import AuthorityMissing from "./AuthorityMissing";
import AuthorityReady from "./AuthorityReady";
import AuthorityBeingGenerated from "./AuthorityBeingGenerated";

const CA_STATUS = {
    MISSING: "missing",
    READY: "ready",
    GENERATING: "generating",
};

AuthorityStatus.propTypes = {
    ws: PropTypes.object.isRequired,
    status: PropTypes.oneOf(Object.values(CA_STATUS)).isRequired,
    serverEnabled: PropTypes.bool.isRequired,
    onReload: PropTypes.func.isRequired,
};

export default function AuthorityStatus({
    children, ws, status, serverEnabled, onReload,
}) {
    if (status === CA_STATUS.MISSING) {
        return <AuthorityMissing onReload={onReload} />;
    }
    if (status === CA_STATUS.READY) {
        return (
            <>
                {children}
                <AuthorityReady serverEnabled={serverEnabled} onReload={onReload} />
            </>
        );
    }
    if (status === CA_STATUS.GENERATING) {
        return <AuthorityBeingGenerated ws={ws} onReload={onReload} />;
    }
}
