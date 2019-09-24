/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import OpenVPN from "./openvpn/OpenVPN";

const OpenVPNPlugin = {
    name: _("OpenVPN"),
    weight: 100,
    path: "/openvpn",
    component: OpenVPN,
    icon: "user-shield",
};

ForisPlugins.push(OpenVPNPlugin);
