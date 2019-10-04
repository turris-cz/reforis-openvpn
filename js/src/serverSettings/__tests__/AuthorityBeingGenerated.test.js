/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import { render, act } from "customTestRender";

import { WebSockets } from "foris";

import AuthorityBeingGenerated from "../AuthorityBeingGenerated";

describe("<AuthorityBeingGenerated />", () => {
    const handleReload = jest.fn();
    let webSockets,
        componentContainer;

    beforeEach(() => {
        webSockets = new WebSockets();
        const { container } = render(<AuthorityBeingGenerated ws={webSockets} onReload={handleReload} />);
        componentContainer = container;
    });

    it("should match snapshot", () => {
        expect(componentContainer).toMatchSnapshot();
    });

    it("should call onReload when CA is ready", () => {
        expect(handleReload).not.toBeCalled();
        const wsMessage = { module: "openvpn", action: "generate_ca", data: {status: "succeeded"} };
        act(() => webSockets.dispatch(wsMessage));
        expect(handleReload).toHaveBeenCalledTimes(1);
    });
});
