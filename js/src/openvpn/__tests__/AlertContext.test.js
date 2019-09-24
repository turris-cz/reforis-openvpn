/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useContext } from "react";
import { render, getByText, queryByText, fireEvent } from "customTestRender";

import AlertContext, { AlertContextProvider } from "../AlertContext";

function AlertTest() {
    const setAlert = useContext(AlertContext);
    return <button onClick={() => setAlert("Alert content")}>Set alert</button>;
};

describe("AlertContext", () => {
    let componentContainer;

    beforeEach(() => {
        const { container } = render(
            <AlertContextProvider>
                <AlertTest />
            </AlertContextProvider>
        );
        componentContainer = container;
    });

    it("should render component without alert", () => {
        expect(componentContainer).toMatchSnapshot();
    });

    it("should render alert", () => {
        fireEvent.click(getByText(componentContainer, "Set alert"));
        expect(componentContainer).toMatchSnapshot();
    });

    it("should dismiss alert", () => {
        fireEvent.click(getByText(componentContainer, "Set alert"));
        // Alert is present
        expect(getByText(componentContainer, "Alert content")).toBeDefined();

        fireEvent.click(componentContainer.querySelector(".close"));
        // Alert is gone
        expect(queryByText(componentContainer, "Alert content")).toBeNull();
    });
});
