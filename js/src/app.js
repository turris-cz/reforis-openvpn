/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import ServerSettings from "./serverSettings/ServerSettings";
import ClientRegistration from "./clientRegistration/ClientRegistration";

const OpenVPNPlugin = {
    submenuId: "opnvpn",
    name: _("OpenVPN"),
    weight: 70,
    icon: "user-shield",
    path: "/openvpn",
    pages: [
        {
            name: "Server Settings",
            path: "/server-settings",
            component: ServerSettings,
        },
        {
            name: "Client Registration",
            path: "/client-registration",
            component: ClientRegistration,
        },
    ],
};

ForisPlugins.push(OpenVPNPlugin);
