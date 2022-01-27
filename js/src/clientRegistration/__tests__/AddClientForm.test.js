/*
 * Copyright (C) 2019-2022 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import {
    render,
    fireEvent,
    wait,
    getByText,
    getByLabelText,
} from "foris/testUtils/customTestRender";
import { mockSetAlert } from "foris/testUtils/alertContextMock";
import { mockJSONError } from "foris/testUtils/network";
import mockAxios from "jest-mock-axios";

import AddClientForm from "../AddClientForm";

function getFormElements(componentContainer) {
    return {
        nameInput: getByLabelText(componentContainer, "Client name"),
        submitButton: getByText(componentContainer, "Add"),
    };
}

describe("<AddClientForm />", () => {
    let componentContainer;
    const setGenerating = jest.fn();

    beforeEach(() => {
        const { container } = render(
            <AddClientForm generating={false} setGenerating={setGenerating} />
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
        expect(
            getByText(componentContainer, "Name cannot be empty.")
        ).toBeDefined();
        expect(submitButton.disabled).toBe(true);

        // Name too long
        fireEvent.change(nameInput, { target: { value: "q".repeat(65) } });
        expect(
            getByText(componentContainer, "Name is too long.")
        ).toBeDefined();
        expect(submitButton.disabled).toBe(true);

        // Invalid characters
        fireEvent.change(nameInput, { target: { value: "!@#$%" } });
        expect(
            getByText(componentContainer, "Name contains invalid characters.")
        ).toBeDefined();
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
            expect.anything()
        );
        expect(setGenerating).toBeCalledWith(true);
    });

    it("should handle API error", async () => {
        const { nameInput, submitButton } = getFormElements(componentContainer);

        fireEvent.change(nameInput, { target: { value: "propername" } });
        fireEvent.click(submitButton);
        expect(setGenerating).toBeCalledWith(true);

        const errorMessage = "API didn't handle this well";
        mockJSONError(errorMessage);
        await wait(() => {
            expect(mockSetAlert).toHaveBeenCalledWith(errorMessage);
        });
        expect(setGenerating).toBeCalledWith(false);
    });
});
