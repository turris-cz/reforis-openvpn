/*
 * Copyright (C) 2019-2022 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useCallback } from "react";

import { Modal, ModalBody, ModalHeader, ModalFooter, Button } from "foris";
import PropTypes from "prop-types";

import useClientSettingsModalForm from "./hooks";
import SettingsModalForm from "./SettingsModalForm";

SettingsModal.propTypes = {
    shown: PropTypes.bool,
    setShown: PropTypes.func,
    client: PropTypes.object,
};

export default function SettingsModal({ shown, setShown, client }) {
    const postCallback = useCallback(() => {
        setShown(false);
    }, [setShown]);

    const [formState, setFormValue, putState, saveClient] =
        useClientSettingsModalForm(client, postCallback);

    return (
        <Modal scrollable shown={shown} setShown={setShown}>
            <ModalHeader
                setShown={setShown}
                title={_("Edit Client Settings")}
            />
            <ModalBody>
                <SettingsModalForm
                    formState={formState}
                    setFormValue={setFormValue}
                    putState={putState}
                />
            </ModalBody>
            <ModalFooter>
                <Button
                    className="btn-secondary"
                    onClick={() => setShown(false)}
                >
                    {_("Cancel")}
                </Button>
                <Button onClick={saveClient} disabled={!!formState.errors}>
                    {_("Save")}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
