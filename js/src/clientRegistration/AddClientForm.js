/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect, useContext } from "react";

import {
    TextInput, Button, useAPIPost, useForm, AlertContext, undefinedIfEmpty,
} from "foris";

import API_URLs from "API";

export default function AddClientForm() {
    const setAlert = useContext(AlertContext);

    const [postClientsResponse, postClients] = useAPIPost(API_URLs.clients);
    useEffect(() => {
        if (postClientsResponse.isError) {
            setAlert(postClientsResponse.data);
        }
    }, [postClientsResponse, setAlert]);

    const [formState, formChangeHandler, reloadForm] = useForm(addClientFormValidator);
    const formData = formState.data;
    const formErrors = formState.errors || {};
    useEffect(() => {
        reloadForm({ name: "" });
    }, [reloadForm]);

    function handleSubmit(event) {
        event.preventDefault();
        postClients(formData);
    }

    if (!formData) {
        return null;
    }

    return (
        <>
            <h3>{_("Add new client")}</h3>
            <form onSubmit={handleSubmit}>
                <TextInput
                    label={_("Client name")}
                    helpText={_("Shorter than 64 characters. Only alphanumeric characters, dots, dashes and underscores.")}
                    value={formData.name}
                    error={formErrors.name}
                    onChange={formChangeHandler((value) => ({ name: { $set: value } }))}
                />
                <Button
                    type="submit"
                    forisFormSize
                    disabled={undefinedIfEmpty(formErrors) || postClientsResponse.isSending}
                >
                    Add
                </Button>
            </form>
        </>
    );
}

function addClientFormValidator(formData) {
    const { name } = formData;
    if (!name) {
        return { name: _("Name cannot be empty") };
    }
    if (name.length > 64) {
        return { name: _("Name is too long") };
    }
    if (!/^[a-zA-Z0-9.\-_]+$/.test(name)) {
        return { name: _("Name contains invalid characters") };
    }
    return undefined;
}
