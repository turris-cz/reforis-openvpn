/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect } from "react";
import PropTypes from "prop-types";

import { useWSForisModule, Spinner } from "foris";

AuthorityBeingGenerated.propTypes = {
    ws: PropTypes.object.isRequired,
    onReload: PropTypes.func.isRequired,
};

export default function AuthorityBeingGenerated({ ws, onReload }) {
    const [generateCA] = useWSForisModule(ws, "openvpn", "generate_ca");
    useEffect(() => {
        if (generateCA && generateCA.status === "succeeded") {
            onReload();
        }
    }, [generateCA, onReload]);

    return (
        <>
            <h3>{_("Generating certification authority")}</h3>
            <Spinner className="my-3 text-center" />
            <p>{_("Your certification authority is now being generated. It usually takes a few minutes. Settings will appear here automatically once the authority is ready.")}</p>
        </>
    );
}
