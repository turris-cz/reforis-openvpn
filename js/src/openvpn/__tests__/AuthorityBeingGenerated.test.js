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
    const handleSuccess = jest.fn();
    let webSockets,
        componentContainer;

    beforeEach(() => {
        webSockets = new WebSockets();
        const { container } = render(<AuthorityBeingGenerated ws={webSockets} onSuccess={handleSuccess} />);
        componentContainer = container;
    });

    it("should match snapshot", () => {
        expect(componentContainer).toMatchSnapshot();
    });

    it("should call onSuccess when CA is ready", () => {
        expect(handleSuccess).not.toBeCalled();
        const wsMessage = { module: "openvpn", action: "generate_ca", data: {status: "succeeded"} };
        act(() => webSockets.dispatch(wsMessage));
        expect(handleSuccess).toHaveBeenCalledTimes(1);
    });
});
