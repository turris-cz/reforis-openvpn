/*
 * Copyright (C) 2019-2022 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";

import { API_STATE, Spinner, TextInput, PasswordInput } from "foris";
import PropTypes from "prop-types";

SettingsModalForm.propTypes = {
    formState: PropTypes.object,
    setFormValue: PropTypes.func,
    putState: PropTypes.object,
};

export default function SettingsModalForm({
    formState,
    setFormValue,
    putState,
}) {
    if (!formState.data) return <Spinner className="text-center" />;

    const formErrors = formState.errors || {};
    const disabled = putState.state === API_STATE.SENDING;
    return (
        <>
            <TextInput
                label={_("Username")}
                value={formState.data.credentials.username}
                error={formErrors.username}
                onChange={setFormValue((value) => ({
                    credentials: {
                        username: { $set: value },
                    },
                }))}
                disabled={disabled}
            />
            <PasswordInput
                label={_("Password")}
                value={formState.data.credentials.password}
                error={formErrors.password}
                onChange={setFormValue((value) => ({
                    credentials: {
                        password: { $set: value },
                    },
                }))}
                disabled={disabled}
                withEye
            />
        </>
    );
}
