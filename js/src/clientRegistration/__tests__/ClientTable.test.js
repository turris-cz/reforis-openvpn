/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
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
} from "foris/testUtils/customTestRender";
import { mockSetAlert } from "foris/testUtils/alertContextMock";
import { mockJSONError } from "foris/testUtils/network";
import mockAxios from "jest-mock-axios";

import ClientTable from "../ClientTable";

describe("<ClientTable />", () => {
    const singleClient = [{ id: "A1", name: "First", status: "valid" }];

    function renderTable(clients = [], address = "") {
        const { container } = render(
            <ClientTable clients={clients} address={address} />
        );
        return container;
    }

    function getRevokeButton(container) {
        return getByText(container, "Revoke");
    }

    it("should render info when there are no clients", () => {
        const container = renderTable();
        expect(container).toMatchSnapshot();
    });

    it("should render table of clients", () => {
        const clients = [
            { id: "A1", name: "First", status: "valid" },
            { id: "A2", name: "Second", status: "generating" },
            { id: "B1", name: "Third", status: "valid" },
            { id: "B2", name: "Last", status: "revoke1d" },
        ];
        const container = renderTable(clients);
        expect(container).toMatchSnapshot();
    });

    it("should disable download on invalid address", () => {
        const clients = [{ id: "A1", name: "First", status: "valid" }];
        const container = renderTable(clients, null);
        const downloadButton = getByText(container, "Download");
        expect(
            downloadButton.parentElement.classList.contains("disabled")
        ).toBe(true);
    });

    it("should display spinner on delete request", () => {
        const container = renderTable(singleClient);
        fireEvent.click(getRevokeButton(container));
        expect(container).toMatchSnapshot();
    });

    it("should send delete request", () => {
        const container = renderTable(singleClient);
        fireEvent.click(getRevokeButton(container));
        expect(mockAxios.delete).toBeCalledWith(
            `/reforis/openvpn/api/clients/${singleClient[0].id}`,
            expect.anything()
        );
    });

    it("should handle revoke api error", async () => {
        const container = renderTable(singleClient);
        fireEvent.click(getRevokeButton(container));
        const errorMessage = "API didn't handle this well";
        mockJSONError(errorMessage);
        await wait(() => {
            expect(mockSetAlert).toHaveBeenCalledWith(errorMessage);
        });
    });
});
