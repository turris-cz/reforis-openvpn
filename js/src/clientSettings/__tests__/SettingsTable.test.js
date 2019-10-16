/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import {
    render, fireEvent, wait, getByText, waitForElement, getByLabelText,
} from "customTestRender";
import mockAxios from "jest-mock-axios";

import { AlertContext } from "foris";

import SettingsTable from "../SettingsTable";

describe("<SettingsTable />", () => {
    const setAlert = jest.fn();
    const singleClient = { id: "A1", enabled: true, running: true };

    async function renderTable(clients = []) {
        const { container } = render(
            <AlertContext.Provider value={setAlert}>
                <SettingsTable />
            </AlertContext.Provider>,
        );
        mockAxios.mockResponse({ data: clients });
        await waitForElement(() => getByText(container, "Available settings"));
        return container;
    }

    function getDelete(container) {
        return getByText(container, "Delete");
    }

    it("should display spinner", () => {
        const { container } = render(<SettingsTable />);
        expect(container).toMatchSnapshot();
    });

    it("should handle GET error", async () => {
        const { container } = render(<SettingsTable />);
        mockAxios.mockError({response: {}});
        await waitForElement(() => getByText(container, "An error occurred during loading OpenVPN client settings"));
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

    it("should send PATCH request", async () => {
        const container = await renderTable([singleClient]);
        fireEvent.click(getByText(container, singleClient.id));
        expect(mockAxios.patch).toBeCalledWith(
            `/reforis/openvpn/api/client-settings/${singleClient.id}`,
            { enabled: false },
            expect.anything(),
        );
    });

    it("should handle PATCH error", async () => {
        const container = await renderTable([singleClient]);
        fireEvent.click(getByText(container, singleClient.id));
        const errorMessage = "API didn't handle this well";
        mockAxios.mockError(
            { response: { data: errorMessage, headers: { "content-type": "application/json" } } },
        );
        await wait(() => {
            expect(setAlert).toHaveBeenCalledWith(errorMessage);
        });
    });

    it("should send DELETE request", async () => {
        const container = await renderTable([singleClient]);
        fireEvent.click(getDelete(container));
        expect(mockAxios.delete).toBeCalledWith(
            `/reforis/openvpn/api/client-settings/${singleClient.id}`,
            expect.anything(),
        );
    });

    it("should handle DELETE error", async () => {
        const container = await renderTable([singleClient]);
        fireEvent.click(getDelete(container));
        const errorMessage = "API didn't handle this well";
        mockAxios.mockError(
            { response: { data: errorMessage, headers: { "content-type": "application/json" } } },
        );
        await wait(() => {
            expect(setAlert).toHaveBeenCalledWith(errorMessage);
        });
    });

    it("should change status of client instance after refresh", async () => {
        const container = await renderTable([singleClient]);
        expect(getByText(container, "Running")).toBeTruthy();
        fireEvent.click(getByLabelText(container, "Check status"));
        expect(mockAxios.get).toHaveBeenCalledWith(`/reforis/openvpn/api/client-settings/${singleClient.id}`, expect.anything());
        mockAxios.mockResponse({ data: { ...singleClient, running: false }})
        await waitForElement(() => getByText(container, "Not running"));
    });

    it("should change status of client instance after refresh", async () => {
        const container = await renderTable([singleClient]);
        fireEvent.click(getByLabelText(container, "Check status"));
        expect(mockAxios.get).toHaveBeenCalledWith(`/reforis/openvpn/api/client-settings/${singleClient.id}`, expect.anything());
        const errorMessage = "API didn't handle this well";
        mockAxios.mockError(
            { response: { data: errorMessage, headers: { "content-type": "application/json" } } },
        );
        await waitForElement(() => getByText(container, "Cannot refresh status"));
    });
});
