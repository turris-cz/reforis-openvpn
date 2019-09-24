/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import { render, getByText, fireEvent, wait } from "customTestRender";
import mockAxios from 'jest-mock-axios';

import AuthorityMissing from "../AuthorityMissing";
import AlertContext from "../AlertContext";

describe("<AuthorityMissing />", () => {
    let componentContainer;
    const handleSuccess = jest.fn(),
        setAlert = jest.fn();

    beforeEach(() => {
        const { container } = render(
            <AlertContext.Provider value={setAlert}>
                <AuthorityMissing onSuccess={handleSuccess} />
            </AlertContext.Provider>
        );
        componentContainer = container;
    });

    it("should match snapshot", () => {
        expect(componentContainer).toMatchSnapshot();
    });

    it("should send request when button is clicked", () => {
        fireEvent.click(getByText(componentContainer, "Generate CA"));
        expect(mockAxios.post).toHaveBeenCalledTimes(1);
    });

    it("should handle error", async () => {
        fireEvent.click(getByText(componentContainer, "Generate CA"));
        mockAxios.mockError({response: {}});
        await wait(() => {
            expect(setAlert).toHaveBeenCalledWith("Cannot generate certificate authority");
        });
    });

    it("should handle success", async () => {
        fireEvent.click(getByText(componentContainer, "Generate CA"));
        mockAxios.mockResponse({});
        await wait(() => {
            expect(handleSuccess).toHaveBeenCalledTimes(1);
        });
    });
});
