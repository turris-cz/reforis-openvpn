/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import { render, wait, fireEvent, getByLabelText, getByText } from "customTestRender";
import mockAxios from 'jest-mock-axios';

import { AlertContext } from "foris";

import ServerSettings from "../ServerSettings";

describe("<ServerSettings />", () => {
    const setAlert = jest.fn();
    const enabledFormData = {
        enabled: true,
        device: "my_device",
        ipv6: false,
        protocol: "UDP",
        network: "10.111.111.0",
        network_netmask: "255.255.255.0",
        port: 1194,
        route_all: true,
        use_dns: true,
    };
    const disabledFormData = { enabled: false };

    function renderSettings(formData) {
        const { container } = render(<ServerSettings settingsData={formData} />);
        return container;
    }

    function submitForm(container) {
        fireEvent.click(getByText(container, "Save"));
    }

    it("should render form", async () => {
        const container = renderSettings(enabledFormData);
        expect(container).toMatchSnapshot();
    });

    it("should render form partially when disabled", async () => {
        const container = renderSettings(disabledFormData);
        expect(container).toMatchSnapshot();
    });

    it("should validate form", async () => {
        const container = renderSettings(enabledFormData);

        const submitButton = getByText(container, "Save");
        // Initially the form is OK
        expect(submitButton.disabled).toBe(false);

        // Invalid network
        const networkInput = getByLabelText(container, "VPN network address");
        fireEvent.change(networkInput, { target: { value: "808.909.303.606" } });
        expect(submitButton.disabled).toBe(true);
        // Set valid value
        fireEvent.change(networkInput, { target: { value: "80.90.30.60" } });
        expect(submitButton.disabled).toBe(false);

        // Invalid netmask
        const netmaskInput = getByLabelText(container, "VPN network mask");
        fireEvent.change(netmaskInput, { target: { value: "808.909.303.606" } });
        expect(submitButton.disabled).toBe(true);
        // Set valid value
        fireEvent.change(netmaskInput, { target: { value: "80.90.30.60" } });
        expect(submitButton.disabled).toBe(false);
    });

    it("should update settings", async () => {
        const container = renderSettings(enabledFormData);
        submitForm(container);
        expect(mockAxios.patch).toBeCalledWith(
            "/reforis/openvpn/api/server-settings",
            {
                enabled: true,
                ipv6: false,
                protocol: "UDP",
                network: "10.111.111.0",
                network_netmask: "255.255.255.0",
                route_all: true,
                use_dns: true,
            },
            expect.anything()
        );
    });

    it("should disable server", async () => {
        const container = renderSettings(enabledFormData);
        fireEvent.click(getByLabelText(container, "Server enabled"));
        submitForm(container);
        expect(mockAxios.patch).toBeCalledWith("/reforis/openvpn/api/server-settings", disabledFormData, expect.anything());
    });
    
    it("should handle API error", async () => {
        const { container } = render(
            <AlertContext.Provider value={setAlert}>
                <ServerSettings settingsData={disabledFormData} />
            </AlertContext.Provider>
        );
        submitForm(container);
        mockAxios.mockError({response: {}});
        await wait(() => {
            expect(setAlert).toHaveBeenCalledWith("Cannot save server settings");
        });
    });
});
