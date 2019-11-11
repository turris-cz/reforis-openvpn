/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import { render, getByText, fireEvent, wait } from "foris/testUtils/customTestRender";
import { mockSetAlert } from "foris/testUtils/alertContextMock";
import { mockJSONError } from "foris/testUtils/network";
import mockAxios from 'jest-mock-axios';

import AuthorityMissing from "../AuthorityMissing";

describe("<AuthorityMissing />", () => {
    let componentContainer;
    const handleReload = jest.fn();

    beforeEach(() => {
        const { container } = render(<AuthorityMissing onReload={handleReload} />);
        componentContainer = container;
    });

    it("should match snapshot", () => {
        expect(componentContainer).toMatchSnapshot();
    });

    it("should send request when button is clicked", () => {
        fireEvent.click(getByText(componentContainer, "Generate CA"));
        expect(mockAxios.post).toBeCalledWith("/reforis/openvpn/api/authority", undefined, expect.anything());
    });

    it("should handle error", async () => {
        fireEvent.click(getByText(componentContainer, "Generate CA"));
        mockJSONError();
        await wait(() => {
            expect(mockSetAlert).toHaveBeenCalledWith("Cannot generate certificate authority");
        });
    });

    it("should handle success", async () => {
        fireEvent.click(getByText(componentContainer, "Generate CA"));
        mockAxios.mockResponse({});
        await wait(() => {
            expect(handleReload).toHaveBeenCalledTimes(1);
        });
    });
});
