/*
 * Copyright (C) 2019-2022 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import { useEffect } from "react";

import { ALERT_TYPES, API_STATE, useAlert, useAPIPut, useForm } from "foris";

import API_URLs from "API";

import validator from "./validator";

export default function useClientSettingsModalForm(client, saveClientCallback) {
    const [formState, setFormValue, initForm] = useForm(validator);

    const [putState, put] = useAPIPut(
        `${API_URLs.clientSettings}/${(client || {}).id}`
    );

    const [setAlert, dismissAlert] = useAlert();

    useEffect(() => {
        if (putState.state === API_STATE.SUCCESS) {
            saveClientCallback();
            setAlert(
                _("Client settings were saved successfully."),
                ALERT_TYPES.SUCCESS
            );
        } else if (putState.state === API_STATE.ERROR) {
            setAlert(putState.data);
        }
    }, [putState, saveClientCallback, setAlert]);

    useEffect(() => {
        initForm(client);
    }, [client, initForm]);

    function saveClient() {
        const data = prepDataToSubmit(formState.data);

        dismissAlert();
        put({ data });
    }

    return [formState, setFormValue, putState, saveClient];
}

function prepDataToSubmit(client) {
    delete client.running;
    return client;
}
