/*
 * Copyright (C) 2019-2024 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect, useState } from "react";

import { faRedo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAPIGet, Button, SpinnerElement, API_STATE } from "foris";
import PropTypes from "prop-types";

import API_URLs from "API";

ClientStatus.propTypes = {
    id: PropTypes.string.isRequired,
    defaultStatus: PropTypes.bool.isRequired,
};

export default function ClientStatus({ id, defaultStatus }) {
    // No need to worry about default state from props as any update will reload whole table
    const [status, setStatus] = useState(defaultStatus);
    const [response, getSettings] = useAPIGet(
        `${API_URLs.clientSettings}/${id}`
    );

    useEffect(() => {
        if (response.state === API_STATE.SUCCESS) {
            setStatus(response.data.running);
        }
    }, [response]);

    // GET is sent on demand hence INIT is not checked
    if (response.state === API_STATE.SENDING) {
        return <SpinnerElement small />;
    }

    if (response.state === API_STATE.ERROR) {
        return (
            <span className="text-danger">{_("Cannot refresh status")}</span>
        );
    }

    return (
        <>
            {status ? (
                _("Running")
            ) : (
                <span className="text-danger">{_("Not running")}</span>
            )}
            <Button
                className="btn btn-sm"
                aria-label={_("Check status")}
                onClick={getSettings}
                title={_("Check status")}
            >
                <FontAwesomeIcon icon={faRedo} />
            </Button>
        </>
    );
}
