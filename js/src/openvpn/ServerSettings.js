/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect, useContext } from "react";
import PropTypes from "prop-types";

import {
    CheckBox, Button, Spinner, useForm, useAPIPatch, Select, TextInput,
    validateIPv4Address, AlertContext, undefinedIfEmpty, withoutUndefinedKeys, onlySpecifiedKeys,
    Input,
} from "foris";

import API_URLs from "API";

ServerSettings.propTypes = {
    settingsData: PropTypes.object.isRequired,
};

export default function ServerSettings({ settingsData }) {
    const setAlert = useContext(AlertContext);

    const [patchSettingsResponse, patchSettings] = useAPIPatch(API_URLs.serverSettings);
    useEffect(() => {
        // Happy path is omited since network restart causes the page to reload
        if (patchSettingsResponse.isError) {
            setAlert(_("Cannot save server settings"));
        }
    }, [patchSettingsResponse, setAlert]);

    const [formState, formChangeHandler] = useForm(validator);
    const formData = formState.data;
    const formErrors = formState.errors || {};
    useEffect(() => {
        const eventHandler = formChangeHandler((value) => ({ $set: { ...value } }));
        eventHandler({ target: { value: settingsData } });
    }, [settingsData, formChangeHandler]);

    function handleSubmit(event) {
        event.preventDefault();
        if (formData.enabled) {
            patchSettings(onlySpecifiedKeys(
                formData,
                ["enabled", "ipv6", "protocol", "network", "network_netmask", "route_all", "use_dns"],
            ));
        } else {
            patchSettings({ enabled: false });
        }
    }

    if (!formData) {
        return (
            <>
                <h3 className="mb-3">{_("Server settings")}</h3>
                <Spinner className="text-center" />
            </>
        );
    }

    return (
        <>
            <h3 className="mb-3">{_("Server settings")}</h3>
            <p>{_("Please note that you need a public (preferably static) IP address and your network configured to make use of VPN server.")}</p>
            <form onSubmit={handleSubmit} className="mb-3">
                <CheckBox
                    label={_("Server enabled")}
                    checked={formData.enabled}
                    onChange={formChangeHandler((value) => ({ enabled: { $set: value } }))}
                />
                {formData.enabled && (
                    <>
                        <Input type="text" label={_("Device")} value={formData.device} disabled />
                        <CheckBox
                            label={_("Listen on IPv6")}
                            checked={formData.ipv6}
                            onChange={formChangeHandler((value) => ({ ipv6: { $set: value } }))}
                            helpText={_("Useful if you don't have public IPv4 address. Disable if your IPv6 connection is broken.")}
                        />
                        <Select
                            label={_("Protocol")}
                            choices={{ udp: "UDP", tcp: "TCP" }}
                            value={formData.protocol}
                            onChange={formChangeHandler((value) => ({ protocol: { $set: value } }))}
                            helpText={_("Clients will connect to the VPN server via this protocol. Use TCP if your ISP blocks UDP.")}
                        />
                        <TextInput
                            label={_("VPN network address")}
                            value={formData.network}
                            error={formErrors.network}
                            onChange={formChangeHandler((value) => ({ network: { $set: value } }))}
                            helpText={_("This network should be different than any network directly reachable by the router and the clients.")}
                        />
                        <TextInput
                            label={_("VPN network mask")}
                            value={formData.network_netmask}
                            error={formErrors.network_netmask}
                            onChange={
                                formChangeHandler((value) => ({ network_netmask: { $set: value } }))
                            }
                        />
                        <Input type="text" label={_("Port")} value={formData.port} disabled />
                        <CheckBox
                            label={_("Route all traffic via VPN")}
                            checked={formData.route_all}
                            onChange={
                                formChangeHandler((value) => ({ route_all: { $set: value } }))
                            }
                            helpText={_("Clients will access the Internet via VPN")}
                        />
                        <CheckBox
                            label={_("Use DNS via VPN")}
                            checked={formData.use_dns}
                            onChange={formChangeHandler((value) => ({ use_dns: { $set: value } }))}
                            helpText={_("Clients will resolve addresses using router's DNS. Required when accessing local servers like my-nas.lan")}
                        />
                    </>
                )}
                <Button type="submit" forisFormSize disabled={undefinedIfEmpty(formErrors) || patchSettingsResponse.isSending}>Save</Button>
            </form>
            <p dangerouslySetInnerHTML={{ __html: _("<strong>Advanced users:</strong> if you already configured OpenVPN server manually your config will be extended (rather than  overwritten). In case of conflict you must fix previous settings by yourself.") }} />
        </>
    );
}

function validator(formData) {
    const errors = {
        network: validateIPv4Address(formData.network),
        network_netmask: validateIPv4Address(formData.network_netmask),
    };
    return undefinedIfEmpty(withoutUndefinedKeys(errors));
}
