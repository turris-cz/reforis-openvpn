/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import { render } from "foris/testUtils/customTestRender";

import { WebSockets } from "foris";

import AuthorityStatus from "../AuthorityStatus";

describe("<AuthorityStatus />", () => {
    const webSockets = new WebSockets();

    function renderAuthorityStatus(status) {
        const { container } = render(
            <AuthorityStatus
                ws={webSockets}
                status={status}
                serverEnabled={false}
                onReload={jest.fn()}
            >
                <div>Some child</div>
            </AuthorityStatus>
        );
        return container;
    }

    it("should handle missing CA", () => {
        const container = renderAuthorityStatus("missing");
        expect(container).toMatchSnapshot();
    });

    it("should handle ready CA", () => {
        const container = renderAuthorityStatus("ready");
        expect(container).toMatchSnapshot();
    });

    it("should handle generating CA", () => {
        const container = renderAuthorityStatus("generating");
        expect(container).toMatchSnapshot();
    });

    it("should render children if status is ready", () => {
        const { getByTestId } = render(
            <AuthorityStatus
                ws={webSockets}
                status={"ready"}
                serverEnabled={false}
                onReload={jest.fn()}
            >
                <div data-testid="some-child">
                    Status is "ready" so I should be visible!
                </div>
            </AuthorityStatus>
        );
        expect(getByTestId("some-child")).toBeDefined();
    });
});
