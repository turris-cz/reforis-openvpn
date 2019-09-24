/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect } from "react";
import PropTypes from "prop-types";

import { useAPIGet, Spinner } from "foris";

import API_URLs from "API";
import AuthorityMissing from "./AuthorityMissing";
import AuthorityReady from "./AuthorityReady";
import AuthorityBeingGenerated from "./AuthorityBeingGenerated";

AuthorityStatus.propTypes = {
    ws: PropTypes.object.isRequired,
};

export default function AuthorityStatus({ ws }) {
    const [authority, getAuthority] = useAPIGet(API_URLs.authority);
    useEffect(() => {
        getAuthority();
    }, [getAuthority]);

    if (authority.isLoading || !authority.data) {
        return <Spinner className="my-3 text-center" />;
    }

    if (authority.data.status === "missing") {
        return <AuthorityMissing onSuccess={getAuthority} />;
    }
    if (authority.data.status === "ready") {
        return <AuthorityReady onSuccess={getAuthority} />;
    }
    if (authority.data.status === "generating") {
        return <AuthorityBeingGenerated ws={ws} onSuccess={getAuthority} />;
    }
}
