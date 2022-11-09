/*
 * Copyright (C) 2019-2022 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect } from "react";
import PropTypes from "prop-types";

import {
    CheckBox,
    Button,
    useForm,
    useAPIPut,
    Select,
    TextInput,
    validateIPv4Address,
    useAlert,
    undefinedIfEmpty,
    withoutUndefinedKeys,
    onlySpecifiedKeys,
    Input,
    API_STATE,
    Switch,
    formFieldsSize,
} from "foris";

import API_URLs from "API";

ServerSettingsForm.propTypes = {
    settingsData: PropTypes.object.isRequired,
};

export default function ServerSettingsForm({ settingsData }) {
    const [setAlert] = useAlert();

    const [putSettingsResponse, putSettings] = useAPIPut(
        API_URLs.serverSettings
    );

    useEffect(() => {
        // Happy path is omitted since network restart causes the page to reload
        if (putSettingsResponse.state === API_STATE.ERROR) {
            setAlert(_("Cannot save server settings"));
        }
    }, [putSettingsResponse, setAlert]);

    const [formState, formChangeHandler, reloadForm] = useForm(validator);
    const formData = formState.data;
    const formErrors = formState.errors || {};

    useEffect(() => {
        reloadForm(settingsData);
    }, [reloadForm, settingsData]);

    if (!formData) {
        return null;
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (formData.enabled) {
            putSettings({
                data: onlySpecifiedKeys(formData, [
                    "enabled",
                    "ipv6",
                    "protocol",
                    "network",
                    "network_netmask",
                    "route_all",
                    "use_dns",
                ]),
            });
        } else {
            putSettings({ data: { enabled: false } });
        }
    }

    const isSending = putSettingsResponse.state === API_STATE.SENDING;
    const saveButtonDisabled = !!undefinedIfEmpty(formErrors) || isSending;

    return (
        <div className={formFieldsSize}>
            <h2 className="mb-3">{_("Server Settings")}</h2>
            <p>
                {_(
                    "Please note that you need a public (preferably static) IP address and your network configured to make use of a VPN server."
                )}
            </p>
            <form onSubmit={handleSubmit}>
                <Switch
                    label={_("Server enabled")}
                    checked={formData.enabled}
                    onChange={formChangeHandler((value) => ({
                        enabled: { $set: value },
                    }))}
                />
                {formData.enabled && (
                    <>
                        <Input
                            type="text"
                            label={_("Device")}
                            value={formData.device}
                            disabled
                        />
                        <CheckBox
                            label={_("Listen on IPv6")}
                            checked={formData.ipv6}
                            onChange={formChangeHandler((value) => ({
                                ipv6: { $set: value },
                            }))}
                            helpText={_(
                                "Useful if you don't have public IPv4 address. Disable if your IPv6 connection is broken."
                            )}
                        />
                        <Select
                            label={_("Protocol")}
                            choices={{ udp: "UDP", tcp: "TCP" }}
                            value={formData.protocol}
                            onChange={formChangeHandler((value) => ({
                                protocol: { $set: value },
                            }))}
                            helpText={_(
                                "Clients will connect to the VPN server via this protocol. Use TCP if your ISP blocks UDP."
                            )}
                        />
                        <TextInput
                            label={_("VPN network address")}
                            value={formData.network}
                            error={formErrors.network}
                            onChange={formChangeHandler((value) => ({
                                network: { $set: value },
                            }))}
                            helpText={_(
                                "This network should be different than any network directly reachable by the router and the clients."
                            )}
                        />
                        <TextInput
                            label={_("VPN network mask")}
                            value={formData.network_netmask}
                            error={formErrors.network_netmask}
                            onChange={formChangeHandler((value) => ({
                                network_netmask: { $set: value },
                            }))}
                        />
                        <Input
                            type="text"
                            label={_("Port")}
                            value={formData.port}
                            disabled
                        />
                        <CheckBox
                            label={_("Route all traffic via VPN")}
                            checked={formData.route_all}
                            onChange={formChangeHandler((value) => ({
                                route_all: { $set: value },
                            }))}
                            helpText={_(
                                "Clients will access the Internet via VPN"
                            )}
                        />
                        <CheckBox
                            label={_("Use DNS via VPN")}
                            checked={formData.use_dns}
                            onChange={formChangeHandler((value) => ({
                                use_dns: { $set: value },
                            }))}
                            helpText={_(
                                "Clients will resolve addresses using router's DNS. Required when accessing local servers like my-nas.lan"
                            )}
                        />
                    </>
                )}
                <div className="text-right">
                    <Button
                        type="submit"
                        forisFormSize
                        disabled={saveButtonDisabled}
                        loading={isSending}
                    >
                        {_("Save")}
                    </Button>
                </div>
            </form>
        </div>
    );
}

function validator(formData) {
    const errors = {
        network: validateIPv4Address(formData.network),
        network_netmask: validateIPv4Address(formData.network_netmask),
    };
    return undefinedIfEmpty(withoutUndefinedKeys(errors));
}
