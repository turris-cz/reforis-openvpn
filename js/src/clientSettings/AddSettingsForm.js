/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect } from "react";

import {
    useAPIPost,
    Button,
    useAlert,
    FileInput,
    useForm,
    API_STATE,
    formFieldsSize,
} from "foris";

import API_URLs from "API";

export default function AddSettingsForm() {
    const [setAlert] = useAlert();

    const [postSettingsResponse, postSettings] = useAPIPost(
        API_URLs.clientSettings,
        "multipart/form-data"
    );
    useEffect(() => {
        if (postSettingsResponse.state === API_STATE.ERROR) {
            setAlert(postSettingsResponse.data);
        }
    }, [postSettingsResponse, setAlert]);

    const [formState, formChangeHandler, reloadForm] = useForm(validator);
    const formData = formState.data;
    const formErrors = formState.errors || {};
    useEffect(() => {
        reloadForm({ settings: undefined });
    }, [reloadForm]);

    function handleSubmit(event) {
        event.preventDefault();
        const postData = new FormData();
        postData.append("settings", formData.settings);
        postSettings({ data: postData });
    }

    if (!formData) {
        return null;
    }

    return (
        <>
            <h3>{_("Add settings")}</h3>
            <p>
                {_(
                    "Please select a file with OpenVPN client settings you wish to add. New settings will be enabled after uploading. Please note that network will be restarted automatically."
                )}
            </p>
            <form onSubmit={handleSubmit} className={formFieldsSize}>
                <FileInput
                    label={
                        formData.settings
                            ? formData.settings.name
                            : _("Choose settings file...")
                    }
                    files={[formData.settings]}
                    error={formErrors.settings}
                    onChange={formChangeHandler((value) => ({
                        settings: { $set: value },
                    }))}
                    accept=".conf,.ovpn"
                />
                <div className="text-right">
                    <Button
                        type="submit"
                        forisFormSize
                        disabled={formErrors.settings || !formData.settings}
                    >
                        {_("Upload settings")}
                    </Button>
                </div>
            </form>
        </>
    );
}

function validator(formData) {
    // Ignore empty file - submit will be disabled anyways
    if (!formData.settings) {
        return undefined;
    }

    if (formData.settings.size > 1024 * 1024) {
        return { settings: _("File is too big. Maximum size is 1 MB") };
    }

    const filename = formData.settings.name;
    if (filename.length === 0 || filename.length > 50) {
        return {
            settings: _(
                "Filename must be at least 1 and at most 50 characters long."
            ),
        };
    }
    if (!/^[a-zA-Z0-9_.-]*$/.test(filename)) {
        return {
            settings: _(
                "Filename can contain only alphanumeric characters, dots, dashes and underscores."
            ),
        };
    }

    return undefined;
}
