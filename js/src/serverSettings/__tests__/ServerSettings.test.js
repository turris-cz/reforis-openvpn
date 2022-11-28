/*
 * Copyright (C) 2019-2022 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import {
    render,
    waitForElement,
    fireEvent,
    wait,
    getByText,
} from "foris/testUtils/customTestRender";
import { mockSetAlert } from "foris/testUtils/alertContextMock";
import { mockJSONError } from "foris/testUtils/network";
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
        mockJSONError();
        await wait(() =>
            expect(
                getByText(
                    componentContainer,
                    "An error occurred while fetching data."
                )
            ).toBeDefined()
        );
    });

    it("should render child and set alert", async () => {
        expect(getByText(componentContainer, "Server Settings")).toBeDefined();

        expect(mockAxios.get).toBeCalledWith(
            "/reforis/openvpn/api/authority",
            expect.anything()
        );
        mockAxios.mockResponse({ data: { status: "ready" } });
        expect(mockAxios.get).toBeCalledWith(
            "/reforis/openvpn/api/server-settings",
            expect.anything()
        );
        mockAxios.mockResponse({ data: { enabled: false } });
        await waitForElement(() =>
            getByText(componentContainer, "Certificate Authority")
        );

        fireEvent.click(getByText(componentContainer, "Delete CA"));
        expect(mockAxios.delete).toBeCalledWith(
            "/reforis/openvpn/api/authority",
            expect.anything()
        );
        mockJSONError();
        await wait(() => {
            expect(mockSetAlert).toBeCalledWith(
                "Cannot delete certificate authority"
            );
        });
        expect(componentContainer).toMatchSnapshot();
    });
});
