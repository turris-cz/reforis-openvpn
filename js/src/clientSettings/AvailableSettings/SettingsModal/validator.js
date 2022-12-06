/*
 * Copyright (C) 2019-2022 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import { undefinedIfEmpty, withoutUndefinedKeys } from "foris";

export default function validator(formState) {
    const errors = {
        username:
            formState.username === ""
                ? _("Username cannot be empty.")
                : undefined,
        password:
            formState.password === ""
                ? _("Password cannot be empty.")
                : undefined,
    };

    return undefinedIfEmpty(withoutUndefinedKeys(errors));
}
