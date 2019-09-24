/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useState } from "react";
import PropTypes from "prop-types";

import { Alert } from "foris";

const AlertContext = React.createContext();

AlertContextProvider.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]),
};

export function AlertContextProvider({ children }) {
    const [alert, setAlert] = useState(null);

    return (
        <>
            {alert && <Alert type="danger" message={alert} onDismiss={() => setAlert(null)} />}
            <AlertContext.Provider value={setAlert}>
                { children }
            </AlertContext.Provider>
        </>
    );
}

export default AlertContext;
