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

import AddSettingsForm from "../AddSettingsForm";

function getFormElements(componentContainer) {
    return {
        fileInput: getByLabelText(
            componentContainer,
            "Choose settings file..."
        ),
    };
}

function setFilesProperty(input, files) {
    // Files can't be set by fireEvent, see https://github.com/testing-library/react-testing-library/issues/93
    Object.defineProperty(input, "files", { value: files, configurable: true });
}

describe("<AddSettingsForm />", () => {
    let componentContainer;

    beforeEach(() => {
        const { container } = render(<AddSettingsForm />);
        componentContainer = container;
    });

    it("should be rendered", () => {
        expect(componentContainer).toMatchSnapshot();
    });

    it("should validate form", () => {
        const { fileInput } = getFormElements(componentContainer);
        const submitButton = componentContainer.querySelector(
            ".btn.btn-primary[type=submit]"
        );

        // Wrong length of file name
        setFilesProperty(fileInput, [new File([], "q".repeat(51))]);
        fireEvent.change(fileInput);
        expect(
            getByText(
                componentContainer,
                "Filename must be at least 1 and at most 50 characters long."
            )
        ).toBeDefined();
        expect(submitButton.disabled).toBe(true);

        // Invalid characters
        setFilesProperty(fileInput, [new File([], "!@#!$@%.conf")]);
        fireEvent.change(fileInput);
        expect(
            getByText(
                componentContainer,
                "Filename can contain only alphanumeric characters, dots, dashes and underscores."
            )
        ).toBeDefined();
        expect(submitButton.disabled).toBe(true);

        // File too big
        setFilesProperty(fileInput, [
            new File(["q".repeat(1024 * 1025)], "turris.conf"),
        ]);
        fireEvent.change(fileInput);
        expect(
            getByText(
                componentContainer,
                "File is too big. Maximum size is 1 MB"
            )
        ).toBeDefined();
        expect(submitButton.disabled).toBe(true);
    });

    it("should add setting", () => {
        const { fileInput } = getFormElements(componentContainer);
        const submitButton = componentContainer.querySelector(
            ".btn.btn-primary[type=submit]"
        );

        expect(submitButton.disabled).toBe(true);
        setFilesProperty(fileInput, [new File([], "turris.conf")]);
        fireEvent.change(fileInput);
        expect(submitButton.disabled).toBe(false);

        fireEvent.click(submitButton);
        expect(mockAxios.post).toBeCalledWith(
            "/reforis/openvpn/api/client-settings",
            expect.anything(), // Can't compare two FormData objects
            expect.anything()
        );
    });

    it("should handle API error", async () => {
        const { fileInput } = getFormElements(componentContainer);
        const submitButton = componentContainer.querySelector(
            ".btn.btn-primary[type=submit]"
        );

        setFilesProperty(fileInput, [new File([], "turris.conf")]);
        fireEvent.change(fileInput);
        fireEvent.click(submitButton);

        const errorMessage = "API didn't handle this well";
        mockJSONError(errorMessage);
        await wait(() => {
            expect(mockSetAlert).toHaveBeenCalledWith(errorMessage);
        });
    });
});
