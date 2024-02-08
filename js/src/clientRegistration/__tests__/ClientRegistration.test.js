/*
 * Copyright (C) 2019-2022 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import {
    render,
    wait,
    getByText,
    getAllByText,
    getByLabelText,
    getAllByRole,
    queryByText,
    queryByLabelText,
    fireEvent,
    act,
} from "foris/testUtils/customTestRender";
import { mockSetAlert } from "foris/testUtils/alertContextMock";
import { mockJSONError } from "foris/testUtils/network";
import mockAxios from "jest-mock-axios";

import { WebSockets } from "foris";

import ClientRegistration from "../ClientRegistration";

describe("<ClientRegistration />", () => {
    let webSockets;
    let componentContainer;
    const clients = [
        { id: "A1", name: "First", status: "valid" },
        { id: "A2", name: "Second", status: "generating" },
        { id: "B1", name: "Third", status: "valid" },
        { id: "B2", name: "Last", status: "revoked" },
    ];

    beforeEach(() => {
        webSockets = new WebSockets();
        const { container } = render(<ClientRegistration ws={webSockets} />);
        componentContainer = container;
    });

    it("should display spinner on loading", () => {
        expect(componentContainer).toMatchSnapshot();
    });

    it("should handle API error - authority", async () => {
        mockJSONError();
        await wait(() =>
            getByText(
                componentContainer,
                "An error occurred while fetching data."
            )
        );
    });

    it("should handle API error - clients", async () => {
        // Response to GET authority
        mockAxios.mockResponse({ data: { status: "ready" } });
        await wait(() => getByText(componentContainer, "Client Registration"));
        mockJSONError();
        await wait(() =>
            getByText(
                componentContainer,
                "An error occurred while fetching data."
            )
        );
    });

    it("should handle invalid CA", async () => {
        mockAxios.mockResponse({ data: { status: "whatever" } });
        await wait(() =>
            getByText(
                componentContainer,
                "You need to generate certificate authority in order to register clients."
            )
        );
    });

    it("should display clients", async () => {
        expect(mockAxios.get).toBeCalledWith(
            "/reforis/openvpn/api/authority",
            expect.anything()
        );
        // Response to GET authority
        mockAxios.mockResponse({ data: { status: "ready" } });

        await wait(() => getByText(componentContainer, "Client Registration"));

        expect(mockAxios.get).toBeCalledWith(
            "/reforis/openvpn/api/clients",
            expect.anything()
        );
        // Response to GET clients
        mockAxios.mockResponse({ data: clients });

        await wait(() => getByText(componentContainer, "First"));
        expect(componentContainer).toMatchSnapshot();
    });

    describe("with mocked clients and authority initial requests", () => {
        function getAddButton() {
            return componentContainer.querySelector(
                ".btn.btn-primary[type=submit]"
            );
        }

        function submitClientForm(name) {
            const clientNameInput = getByLabelText(
                componentContainer,
                "Client name"
            );
            fireEvent.change(clientNameInput, { target: { value: name } });
            const addButton = getAddButton();
            fireEvent.click(addButton);
        }

        function enableOverride() {
            const checkbox = getByLabelText(
                componentContainer,
                "Override Server Address"
            );
            fireEvent.click(checkbox);
        }

        beforeEach(async () => {
            mockAxios.mockResponse({ data: { status: "ready" } });
            await wait(() =>
                getByText(componentContainer, "Client Registration")
            );
            mockAxios.mockResponse({ data: clients });
            await wait(() => getByText(componentContainer, "Add New Client"));
        });

        it("should display address input when checkbox is selected", () => {
            expect(
                queryByLabelText(componentContainer, /Router's public/)
            ).toBeNull();
            enableOverride();
            expect(
                getByLabelText(componentContainer, /Router's public/)
            ).toBeDefined();
        });

        it("should validate server address override", async () => {
            const getFirstDownload = () =>
                getAllByText(componentContainer, "Download")[0];

            enableOverride();
            const addressInput = getByLabelText(
                componentContainer,
                /Router's public/
            );
            // Since "a" element is replaced with "button" we have to query for "Download" anew
            expect(getFirstDownload().href).toBe(
                `http://localhost/reforis/openvpn/api/clients/${clients[0].id}?address=`
            );
            // Test invalid value
            fireEvent.change(addressInput, {
                target: { value: "999.888.999.888" },
            });
            expect(getFirstDownload().classList.contains("disabled")).toBe(
                true
            );
            // Test valid value
            const address = "9.8.9.8";
            fireEvent.change(addressInput, { target: { value: address } });
            expect(getFirstDownload().href).toBe(
                `http://localhost/reforis/openvpn/api/clients/${clients[0].id}?address=${address}`
            );
        });

        it("should add new client to the table", async () => {
            const getSpinnersNumber = () =>
                getAllByRole(componentContainer, "status").length;
            const getDownloadsNumber = () =>
                getAllByText(componentContainer, "Download").length;

            const name = "user";
            submitClientForm(name);
            expect(getAddButton().disabled).toBe(true);
            // Handle request
            expect(mockAxios.post).toBeCalledWith(
                "/reforis/openvpn/api/clients",
                { name },
                expect.anything()
            );
            mockAxios.mockResponse({ data: { task_id: "1234" } });
            await wait(() => getByText(componentContainer, "Add New Client"));

            expect(queryByText(componentContainer, name)).toBeDefined(); // New client not yet visible
            // Generating new client
            const spinners = getSpinnersNumber();
            const downloads = getDownloadsNumber();
            act(() =>
                webSockets.dispatch({
                    module: "openvpn",
                    action: "generate_client",
                    data: { status: "client_generating" },
                })
            );
            expect(mockAxios.get).toHaveBeenNthCalledWith(
                3,
                "/reforis/openvpn/api/clients",
                expect.anything()
            );
            const updatedClients = [
                ...clients,
                { id: "C2", name, status: "generating" },
            ];
            mockAxios.mockResponse({ data: updatedClients });
            // New client appears (with spinner)
            await wait(() =>
                expect(getByText(componentContainer, name)).toBeDefined()
            );
            expect(getSpinnersNumber()).toBe(spinners + 1);

            // Client finished generating
            act(() =>
                webSockets.dispatch({
                    module: "openvpn",
                    action: "generate_client",
                    data: { status: "succeeded" },
                })
            );
            expect(mockAxios.get).toHaveBeenNthCalledWith(
                4,
                "/reforis/openvpn/api/clients",
                expect.anything()
            );
            updatedClients[4].status = "valid";
            mockAxios.mockResponse({ data: updatedClients });
            await wait(() =>
                expect(getByText(componentContainer, name)).toBeDefined()
            );
            // Spinner disappeared
            expect(getSpinnersNumber()).toBe(spinners);
            // Download is available
            expect(getDownloadsNumber()).toBe(downloads + 1);
            // Add button is enabled again
            expect(getAddButton().disabled).toBe(false);
        });

        it("should update clients table when one is revoked", async () => {
            const getRevokedNumber = () =>
                getAllByText(componentContainer, "Access revoked").length;
            const revoked = getRevokedNumber();
            // Client is revoked
            act(() =>
                webSockets.dispatch({
                    module: "openvpn",
                    action: "revoke",
                    data: { id: clients[0].id },
                })
            );
            expect(getRevokedNumber()).toBe(revoked + 1);
        });

        it("should render alerts", async () => {
            const name = "user";
            submitClientForm(name);
            expect(getAddButton().disabled).toBe(true);
            // Handle request
            expect(mockAxios.post).toBeCalledWith(
                "/reforis/openvpn/api/clients",
                { name },
                expect.anything()
            );
            const errorMessage = "Something went wrong";
            mockJSONError(errorMessage);
            await wait(() => {
                expect(mockSetAlert).toBeCalledWith(errorMessage);
            });
            expect(getAddButton().disabled).toBe(false);
        });
    });
});
