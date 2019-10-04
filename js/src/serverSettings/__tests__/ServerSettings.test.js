/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import {
    render, waitForElement, fireEvent, wait, getByText,
} from "customTestRender";
import mockAxios from "jest-mock-axios";

import { WebSockets } from "foris";

import ServerSettings from "../ServerSettings";

describe("<ServerSettings />", () => {
    let componentContainer;

    beforeEach(() => {
        const webSockets = new WebSockets();
        const { container } = render(<ServerSettings ws={webSockets} />);
        componentContainer = container;
    });

    it("should display spinner", async () => {
        expect(componentContainer).toMatchSnapshot();
    });

    it("should handle API error", async () => {
        mockAxios.mockError({ response: { headers: { "content-type": "application/json" } } });
        mockAxios.mockError({ response: { headers: { "content-type": "application/json" } } });
        await wait(() => expect(getByText(componentContainer, "An error occurred during loading certificate authority details")).toBeDefined());
        expect(getByText(componentContainer, "An error occurred during loading OpenVPN settings")).toBeDefined();
    });

    it("should render child and alert", async () => {
        expect(getByText(componentContainer, "Server Settings")).toBeDefined();

        expect(mockAxios.get).toBeCalledWith("/reforis/openvpn/api/authority", expect.anything());
        mockAxios.mockResponse({ data: { status: "ready" } });
        expect(mockAxios.get).toBeCalledWith("/reforis/openvpn/api/server-settings", expect.anything());
        mockAxios.mockResponse({ data: { enabled: false } });
        await waitForElement(() => getByText(componentContainer, "Certificate authority"));

        fireEvent.click(getByText(componentContainer, "Delete CA"));
        expect(mockAxios.delete).toBeCalledWith("/reforis/openvpn/api/authority", expect.anything());
        mockAxios.mockError({ response: { headers: { "content-type": "application/json" } } });
        await waitForElement(() => getByText(componentContainer, "Cannot delete certificate authority"));
        expect(componentContainer).toMatchSnapshot();
    });
});
