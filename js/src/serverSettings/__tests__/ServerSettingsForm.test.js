/*
 * Copyright (C) 2019-2024 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import {
    render,
    wait,
    fireEvent,
    getByLabelText,
    getByText,
} from "foris/testUtils/customTestRender";
import { mockSetAlert } from "foris/testUtils/alertContextMock";
import { mockJSONError } from "foris/testUtils/network";
import mockAxios from "jest-mock-axios";

import ServerSettingsForm from "../ServerSettingsForm";

describe("<ServerSettingsForm />", () => {
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
    const disabledFormData = {
        enabled: false,
        device: "my_device",
        ipv6: false,
        protocol: "UDP",
        network: "10.111.111.0",
        network_netmask: "255.255.255.0",
        port: 1194,
        route_all: true,
        use_dns: true,
    };

    function renderSettings(formData) {
        const { container } = render(
            <ServerSettingsForm settingsData={formData} />
        );
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

        const submitButton = container.querySelector(
            ".btn.btn-primary[type=submit]"
        );
        // Initially the form is OK
        expect(submitButton.disabled).toBe(false);

        // Invalid network
        const networkInput = getByLabelText(container, "VPN network address");
        fireEvent.change(networkInput, {
            target: { value: "808.909.303.606" },
        });
        expect(submitButton.disabled).toBe(true);
        // Set valid value
        fireEvent.change(networkInput, { target: { value: "10.111.111.0" } });
        expect(submitButton.disabled).toBe(false);

        // Invalid netmask
        const netmaskInput = getByLabelText(container, "VPN network mask");
        fireEvent.change(netmaskInput, {
            target: { value: "808.909.303.606" },
        });
        expect(submitButton.disabled).toBe(true);
        // Set valid value
        fireEvent.change(netmaskInput, { target: { value: "255.255.255.0" } });
        expect(submitButton.disabled).toBe(false);
    });

    it("should update settings", async () => {
        const container = renderSettings(enabledFormData);
        submitForm(container);
        expect(mockAxios.put).toBeCalledWith(
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
        fireEvent.click(getByLabelText(container, "Enable Server"));
        submitForm(container);
        expect(mockAxios.put).toBeCalledWith(
            "/reforis/openvpn/api/server-settings",
            { enabled: false },
            expect.anything()
        );
    });

    it("should handle API error", async () => {
        const { container } = render(
            <ServerSettingsForm settingsData={disabledFormData} />
        );
        submitForm(container);
        mockJSONError();
        await wait(() => {
            expect(mockSetAlert).toHaveBeenCalledWith(
                "Cannot save server settings"
            );
        });
    });
});
