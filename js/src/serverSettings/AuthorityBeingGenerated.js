/*
 * Copyright (C) 2019-2022 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect } from "react";

import { useWSForisModule, SpinnerElement } from "foris";
import PropTypes from "prop-types";

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
        <div className="card p-4">
            <h2>{_("Certificate Authority")}</h2>
            <p>
                {_(
                    "Your certification authority is now being generated. It usually takes a few minutes. Settings will appear here automatically once the authority is ready."
                )}
            </p>
            <div className="text-center text-muted">
                <SpinnerElement small className="me-1" />
                {_("Generating certification authority…")}
            </div>
        </div>
    );
}
