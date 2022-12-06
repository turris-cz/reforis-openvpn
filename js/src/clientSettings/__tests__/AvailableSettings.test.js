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
    waitForElement,
    getByLabelText,
} from "foris/testUtils/customTestRender";
import { mockSetAlert } from "foris/testUtils/alertContextMock";
import { mockJSONError } from "foris/testUtils/network";
import mockAxios from "jest-mock-axios";

import AvailableSettings from "../AvailableSettings/AvailableSettings";

describe("<AvailableSettings />", () => {
    const singleClient = {
        id: "A1",
        enabled: true,
        running: true,
        credentials: {
            username: "user",
            password: "password",
        },
    };

    async function renderTable(clients = []) {
        const { container } = render(
            <>
                <AvailableSettings />
                <div id="modal-container" />
            </>
        );
        mockAxios.mockResponse({ data: clients });
        await waitForElement(() => getByText(container, "Available Settings"));
        return container;
    }

    function getDelete(container) {
        return getByText(container, "Delete");
    }

    it("should display spinner", () => {
        const { container } = render(<AvailableSettings />);
        expect(container).toMatchSnapshot();
    });

    it("should handle GET error", async () => {
        const { container } = render(<AvailableSettings />);
        mockJSONError();
        await waitForElement(() =>
            getByText(container, "An error occurred while fetching data.")
        );
    });

    it("should render info when there are no clients", async () => {
        const container = await renderTable();
        expect(container).toMatchSnapshot();
    });

    it("should render table of settings", async () => {
        const settings = [
            { id: "A1", enabled: true, running: true },
            { id: "A2", enabled: false, running: false },
            { id: "B1", enabled: true, running: true },
            { id: "B2", enabled: false, running: false },
        ];
        const container = await renderTable(settings);
        expect(container).toMatchSnapshot();
    });

    it("should render a modal of a particular settings after hititng 'Edit' button", async () => {
        const container = await renderTable([singleClient]);

        fireEvent.click(getByText(container, "Edit"));

        expect(container).toMatchSnapshot();
    });

    it("should handle PUT ruequest in a modal after hititng 'Save' button", async () => {
        const container = await renderTable([singleClient]);

        fireEvent.click(getByText(container, "Edit"));

        fireEvent.change(getByLabelText(container, "Username"), {
            target: { value: "new_user" },
        });

        fireEvent.change(getByLabelText(container, "Password"), {
            target: { value: "testpass" },
        });

        fireEvent.click(getByText(container, "Save"));

        expect(mockAxios.put).toHaveBeenCalledWith(
            `/reforis/openvpn/api/client-settings/${singleClient.id}`,
            {
                id: "A1",
                enabled: true,
                credentials: {
                    username: "new_user",
                    password: "testpass",
                },
            },
            expect.anything()
        );

        mockAxios.mockResponse({
            data: {
                ...singleClient,
                credentials: {
                    username: "new_user",
                    password: "testpass",
                },
            },
        });
        expect(container).toMatchSnapshot();
    });

    it("should send PUT request", async () => {
        const container = await renderTable([singleClient]);
        fireEvent.click(getByText(container, singleClient.id));
        expect(mockAxios.put).toBeCalledWith(
            `/reforis/openvpn/api/client-settings/${singleClient.id}`,
            { enabled: false },
            expect.anything()
        );
    });

    it("should handle PUT error", async () => {
        const container = await renderTable([singleClient]);
        fireEvent.click(getByText(container, singleClient.id));
        const errorMessage = "API didn't handle this well";
        mockJSONError(errorMessage);
        await wait(() => {
            expect(mockSetAlert).toHaveBeenCalledWith(errorMessage);
        });
    });

    it("should send DELETE request", async () => {
        const container = await renderTable([singleClient]);
        fireEvent.click(getDelete(container));
        expect(mockAxios.delete).toBeCalledWith(
            `/reforis/openvpn/api/client-settings/${singleClient.id}`,
            expect.anything()
        );
    });

    it("should handle DELETE error", async () => {
        const container = await renderTable([singleClient]);
        fireEvent.click(getDelete(container));
        const errorMessage = "API didn't handle this well";
        mockJSONError(errorMessage);
        await wait(() => {
            expect(mockSetAlert).toHaveBeenCalledWith(errorMessage);
        });
    });

    it("should change status of client instance after refresh", async () => {
        const container = await renderTable([singleClient]);
        expect(getByText(container, "Running")).toBeTruthy();
        fireEvent.click(getByLabelText(container, "Check status"));
        expect(mockAxios.get).toHaveBeenCalledWith(
            `/reforis/openvpn/api/client-settings/${singleClient.id}`,
            expect.anything()
        );
        mockAxios.mockResponse({ data: { ...singleClient, running: false } });
        await waitForElement(() => getByText(container, "Not running"));
    });

    it("should change status of client instance after refresh", async () => {
        const container = await renderTable([singleClient]);
        fireEvent.click(getByLabelText(container, "Check status"));
        expect(mockAxios.get).toHaveBeenCalledWith(
            `/reforis/openvpn/api/client-settings/${singleClient.id}`,
            expect.anything()
        );
        const errorMessage = "API didn't handle this well";
        mockJSONError(errorMessage);
        await waitForElement(() =>
            getByText(container, "Cannot refresh status")
        );
    });
});
