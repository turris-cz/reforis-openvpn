/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import { render, waitForElement, fireEvent } from "customTestRender";
import mockAxios from 'jest-mock-axios';

import { WebSockets } from "foris";

import OpenVPN from "../OpenVPN";

describe("<OpenVPN />", () => {
    it("should render child and alert", async () => {
        const webSockets = new WebSockets();
        const { getByText, container } = render(<OpenVPN ws={webSockets} />);

        expect(getByText("OpenVPN")).toBeDefined();

        mockAxios.mockResponse({data: {status: "ready"}});
        await waitForElement(() => getByText("Certificate authority"));

        fireEvent.click(getByText("Delete CA"));
        mockAxios.mockError({response: {}});
        await waitForElement(() => getByText("Cannot delete certificate authority"));
        expect(container).toMatchSnapshot();
    });
});
