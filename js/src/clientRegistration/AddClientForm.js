/*
 * Copyright (C) 2020-2022 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect } from "react";

import {
    TextInput,
    Button,
    useAPIPost,
    useForm,
    useAlert,
    undefinedIfEmpty,
    API_STATE,
} from "foris";
import PropTypes from "prop-types";

import API_URLs from "API";

AddClientForm.propTypes = {
    generating: PropTypes.bool.isRequired,
    setGenerating: PropTypes.func.isRequired,
};

export default function AddClientForm({ generating, setGenerating }) {
    const [setAlert] = useAlert();

    const [postClientsResponse, postClients] = useAPIPost(API_URLs.clients);
    useEffect(() => {
        if (postClientsResponse.state === API_STATE.ERROR) {
            setAlert(postClientsResponse.data);
            setGenerating(false);
        }
    }, [postClientsResponse, setAlert, setGenerating]);

    const [formState, formChangeHandler, reloadForm] = useForm(
        addClientFormValidator
    );
    const formData = formState.data;
    const formErrors = formState.errors || {};
    useEffect(() => {
        reloadForm({ name: "" });
    }, [reloadForm]);

    function handleSubmit(event) {
        event.preventDefault();
        postClients({ data: formData });
        setGenerating(true);
    }

    if (!formData) {
        return null;
    }

    const addButtonDisabled = undefinedIfEmpty(formErrors) || generating;
    return (
        <>
            <h2>{_("Add New Client")}</h2>
            <form onSubmit={handleSubmit}>
                <TextInput
                    label={_("Client name")}
                    helpText={_(
                        "Shorter than 64 characters. Only alphanumeric characters, dots, dashes and underscores."
                    )}
                    value={formData.name}
                    error={formErrors.name}
                    onChange={formChangeHandler((value) => ({
                        name: { $set: value },
                    }))}
                />
                <div className="text-right">
                    <Button
                        type="submit"
                        forisFormSize
                        disabled={addButtonDisabled}
                    >
                        {_("Add")}
                    </Button>
                </div>
            </form>
        </>
    );
}

function addClientFormValidator(formData) {
    const { name } = formData;
    if (!name) {
        return { name: _("Name cannot be empty.") };
    }
    if (name.length > 64) {
        return { name: _("Name is too long.") };
    }
    if (!/^[a-zA-Z0-9.\-_]+$/.test(name)) {
        return { name: _("Name contains invalid characters.") };
    }
    return undefined;
}
