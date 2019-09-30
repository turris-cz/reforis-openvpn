/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

const API_URL_PREFIX = "/reforis/openvpn/api";

const API_URLs = new Proxy(
    {
        authority: "/authority",
        serverSettings: "/server-settings",
    },
    {
        get: (target, name) => `${API_URL_PREFIX}${target[name]}`,
    },
);

export default API_URLs;
