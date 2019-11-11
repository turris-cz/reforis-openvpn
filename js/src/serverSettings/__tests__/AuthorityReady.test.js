/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import { render, getByText, fireEvent, wait } from "foris/testUtils/customTestRender";
import mockAxios from 'jest-mock-axios';
import { mockSetAlert } from "foris/testUtils/alertContextMock";
import { mockJSONError } from "foris/testUtils/network";

import AuthorityReady from "../AuthorityReady";


describe("<AuthorityReady />", () => {
    let componentContainer;
    const handleReload = jest.fn();

    beforeEach(() => {
        const { container } = render(<AuthorityReady onReload={handleReload} serverEnabled={false} />);
        componentContainer = container;
    });

    it("should match snapshot", () => {
        expect(componentContainer).toMatchSnapshot();
    });

    it("should send request when button is clicked", () => {
        fireEvent.click(getByText(componentContainer, "Delete CA"));
        expect(mockAxios.delete).toBeCalledWith("/reforis/openvpn/api/authority", expect.anything());
    });

    it("should handle error", async () => {
        fireEvent.click(getByText(componentContainer, "Delete CA"));
        mockJSONError();
        await wait(() => {
            expect(mockSetAlert).toHaveBeenCalledWith("Cannot delete certificate authority");
        });
    });

    it("should handle success", async () => {
        fireEvent.click(getByText(componentContainer, "Delete CA"));
        mockAxios.mockResponse({});
        await wait(() => {
            expect(handleReload).toHaveBeenCalledTimes(1);
        });
    });

    it("should prevent deletion when server is enabled", () => {
        const { container } = render(<AuthorityReady onReload={handleReload} serverEnabled={true} />);
        expect(container).toMatchSnapshot();
    });
});
