/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import {
    render, fireEvent, wait, getByText, getByLabelText,
} from "customTestRender";
import mockAxios from "jest-mock-axios";

import { AlertContext } from "foris";

import AddClientForm from "../AddClientForm";

function getFormElements(componentContainer) {
    return {
        nameInput: getByLabelText(componentContainer, "Client name"),
        submitButton: getByText(componentContainer, "Add"),
    };
}

describe("<AddClientForm />", () => {
    const setAlert = jest.fn();
    let componentContainer;

    beforeEach(() => {
        const { container } = render(
            <AlertContext.Provider value={setAlert}>
                <AddClientForm />
            </AlertContext.Provider>,
        );
        componentContainer = container;
    });

    it("should be rendered", () => {
        expect(componentContainer).toMatchSnapshot();
    });

    it("should validate form", () => {
        const { nameInput, submitButton } = getFormElements(componentContainer);

        // Empty name
        fireEvent.change(nameInput, { target: { value: "" } });
        expect(getByText(componentContainer, "Name cannot be empty")).toBeDefined();
        expect(submitButton.disabled).toBe(true);

        // Name too long
        fireEvent.change(nameInput, { target: { value: "q".repeat(65) } });
        expect(getByText(componentContainer, "Name is too long")).toBeDefined();
        expect(submitButton.disabled).toBe(true);

        // Invalid characters
        fireEvent.change(nameInput, { target: { value: "!@#$%" } });
        expect(getByText(componentContainer, "Name contains invalid characters")).toBeDefined();
        expect(submitButton.disabled).toBe(true);
    });

    it("should add client", () => {
        const { nameInput, submitButton } = getFormElements(componentContainer);

        expect(submitButton.disabled).toBe(true);
        fireEvent.change(nameInput, { target: { value: "propername" } });
        expect(nameInput.value).toBe("propername");
        expect(submitButton.disabled).toBe(false);

        fireEvent.click(submitButton);
        expect(mockAxios.post).toBeCalledWith(
            "/reforis/openvpn/api/clients",
            { name: "propername" },
            expect.anything(),
        );
    });

    it("should handle API error", async () => {
        const { nameInput, submitButton } = getFormElements(componentContainer);

        fireEvent.change(nameInput, { target: { value: "propername" } });
        fireEvent.click(submitButton);

        const errorMessage = "API didn't handle this well";
        mockAxios.mockError(
            { response: { data: errorMessage, headers: { "content-type": "application/json" } } },
        );
        await wait(() => {
            expect(setAlert).toHaveBeenCalledWith(errorMessage);
        });
    });
});
