/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import { render, getByText, fireEvent, wait } from "customTestRender";
import mockAxios from 'jest-mock-axios';

import { AlertContext } from "foris";

import AuthorityMissing from "../AuthorityMissing";

describe("<AuthorityMissing />", () => {
    let componentContainer;
    const handleReload = jest.fn(),
        setAlert = jest.fn();

    beforeEach(() => {
        const { container } = render(
            <AlertContext.Provider value={setAlert}>
                <AuthorityMissing onReload={handleReload} />
            </AlertContext.Provider>
        );
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
        mockAxios.mockError({response: {headers: {"content-type": "application/json"}}});
        await wait(() => {
            expect(setAlert).toHaveBeenCalledWith("Cannot generate certificate authority");
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
