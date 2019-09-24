/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import { render, waitForElement, getByText } from "customTestRender";
import mockAxios from 'jest-mock-axios';

import { WebSockets } from "foris";

import AuthorityStatus from "../AuthorityStatus";

describe("<AuthorityStatus />", () => {
    let webSockets,
        componentContainer;

    beforeEach(() => {
        webSockets = new WebSockets();
        const { container } = render(<AuthorityStatus ws={webSockets} />);
        componentContainer = container;
    });

    it("should display spinner on loading", () => {
        expect(componentContainer).toMatchSnapshot();
    });

    it("should handle missing CA", async () => {
        mockAxios.mockResponse({data: {status: "missing"}});
        await waitForElement(() => getByText(componentContainer, "No certification authority"));
        expect(componentContainer).toMatchSnapshot();
    });

    it("should handle ready CA", async () => {
        mockAxios.mockResponse({data: {status: "ready"}});
        await waitForElement(() => getByText(componentContainer, "Certificate authority"));
        expect(componentContainer).toMatchSnapshot();
    });

    it("should handle generating CA", async () => {
        mockAxios.mockResponse({data: {status: "generating"}});
        await waitForElement(() => getByText(componentContainer, "Generating certification authority"));
        expect(componentContainer).toMatchSnapshot();
    });
});
