/*
Copyright 2023, 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import type { BrowserWindow } from "electron";

/**
 * macOS title bar — parent-drag / child-no-drag approach.
 *
 * -webkit-app-region is effectively inherited in Chromium's compositor.
 * Set drag on a container → all children are drag. Set no-drag on
 * specific interactive elements → they receive pointer events.
 *
 * No ::after overlays. No z-index games. Just inheritance + carve-outs.
 */
export function setupMacosTitleBar(window: BrowserWindow): void {
    if (process.platform !== "darwin") return;

    let cssKey: string | undefined;

    async function applyStyling(): Promise<void> {
        cssKey = await window.webContents.insertCSS(`
            /* =============================================================
             * SPACE PANEL — traffic light clearance + drag
             *
             * The user menu area is draggable. Space buttons carved out.
             * Traffic lights sit in the user menu's top padding.
             * ============================================================= */
            .mx_SpacePanel {
                -webkit-app-region: drag;
                -webkit-user-select: none;
            }

            /* User menu — give room for traffic lights */
            .mx_UserMenu {
                padding-top: 24px !important;
                padding-left: 20px !important;
                margin-top: 0 !important;
                margin-left: 0 !important;
            }

            /* All interactive elements in space panel carved out */
            .mx_UserMenu > *,
            .mx_SpacePanel .mx_SpaceButton,
            .mx_SpacePanel .mx_SpaceItem,
            .mx_SpacePanel .mx_SpacePanel_toggleCollapse,
            .mx_SpacePanel .mx_AutoHideScrollbar {
                -webkit-app-region: no-drag;
            }

            .mx_SpacePanel_toggleCollapse {
                top: calc(19px + 24px - 12px) !important;
            }

            /* =============================================================
             * ROOM LIST — filter/search area
             *
             * Filter container is drag. Search button carved out.
             * Convert margin to padding so the drag region covers edges.
             * ============================================================= */
            .mx_LeftPanel_filterContainer {
                -webkit-app-region: drag;
                -webkit-user-select: none;
                margin-left: 0 !important;
                margin-right: 0 !important;
                padding-left: 12px !important;
                padding-right: 12px !important;
            }
            /* RoomSearch is an AccessibleButton (div role=button) that fills
             * the container. Explicitly make it drag so the whole area drags.
             * Clicking the search still works via Cmd+K shortcut. */
            .mx_RoomSearch {
                -webkit-app-region: drag !important;
                pointer-events: none !important;
            }
            /* Compose/create room button carved out — stays clickable */
            .mx_LeftPanel_filterContainer > *:not(.mx_RoomSearch) {
                -webkit-app-region: no-drag;
            }

            /* Room list header */
            .mx_RoomListHeaderView {
                -webkit-app-region: drag;
                -webkit-user-select: none;
            }
            .mx_RoomListHeaderView > * {
                -webkit-app-region: no-drag;
            }

            /* Legacy room list header */
            .mx_LegacyRoomListHeader {
                -webkit-app-region: drag;
                -webkit-user-select: none;
            }
            .mx_LegacyRoomListHeader > * {
                -webkit-app-region: no-drag;
            }

            /* Room list scroll area — never draggable */
            .mx_LeftPanel .mx_AutoHideScrollbar,
            .mx_LeftPanel .mx_IndicatorScrollbar {
                -webkit-app-region: no-drag;
            }

            /* =============================================================
             * ROOM HEADER — the main event
             *
             * Header is drag. All interactive elements carved out.
             * InfoWrapper inherits drag from header — its empty space
             * (right of room name, above/below text) is drag territory.
             * Only the heading text is carved out as no-drag.
             *
             * Shrink infoWrapper height so vertical padding is exposed
             * as drag surface above and below the room name.
             * ============================================================= */
            header.mx_RoomHeader,
            .mx_RoomHeader.light-panel {
                -webkit-app-region: drag;
                -webkit-user-select: none;
            }

            /* All direct children EXCEPT infoWrapper: carved out as no-drag.
             * (Avatar, call button, threads button, notification, FacePile, menu) */
            header.mx_RoomHeader > *:not(.mx_RoomHeader_infoWrapper),
            .mx_RoomHeader.light-panel > *:not(.mx_RoomHeader_infoWrapper) {
                -webkit-app-region: no-drag;
            }

            /* InfoWrapper: explicitly drag + pointer-events disabled.
             * This is a <button> element with flex:1 that covers most of
             * the header. Chromium treats <button> as implicitly no-drag,
             * so we must explicitly override. pointer-events:none ensures
             * click events pass through to the header's drag region.
             * The "i" info button on the far right serves the same purpose. */
            .mx_RoomHeader_infoWrapper {
                -webkit-app-region: drag !important;
                pointer-events: none !important;
            }

            /* Legacy room header — same pattern */
            .mx_LegacyRoomHeader {
                -webkit-app-region: drag;
                -webkit-user-select: none;
            }
            .mx_LegacyRoomHeader > * {
                -webkit-app-region: no-drag;
            }

            /* =============================================================
             * ROOM VIEW CONTENT — never draggable
             * ============================================================= */
            .mx_RoomView_body,
            .mx_RoomView_statusArea,
            .mx_MessageComposer,
            .mx_RoomKnocksBar {
                -webkit-app-region: no-drag;
            }
            .mx_RightPanel,
            .mx_RightPanel_ResizeWrapper {
                -webkit-app-region: no-drag;
            }

            /* =============================================================
             * FULL-PAGE VIEWS
             * ============================================================= */
            .mx_MatrixChat_splash {
                -webkit-app-region: drag;
            }
            .mx_MatrixChat_splashButtons {
                -webkit-app-region: no-drag;
            }

            .mx_AuthPage {
                -webkit-app-region: drag;
            }
            .mx_AuthPage .mx_AuthPage_modalContent,
            .mx_AuthPage .mx_AuthPage_modalBlur,
            .mx_AuthPage .mx_AuthFooter > *,
            .mx_AuthPage .mx_Dropdown_menu {
                -webkit-app-region: no-drag;
            }

            .mx_HomePage {
                -webkit-app-region: drag;
            }
            .mx_HomePage .mx_HomePage_body,
            .mx_HomePage .mx_HomePage_default_wrapper > * {
                -webkit-app-region: no-drag;
            }

            /* =============================================================
             * IMAGE LIGHTBOX
             * ============================================================= */
            .mx_ImageView_panel {
                -webkit-app-region: drag;
            }
            .mx_ImageView_panel > .mx_ImageView_info_wrapper,
            .mx_ImageView_panel > .mx_ImageView_title,
            .mx_ImageView_panel > .mx_ImageView_toolbar > * {
                -webkit-app-region: no-drag;
            }
            .mx_ImageView_info_wrapper {
                margin-top: 24px;
            }

            /* =============================================================
             * GLOBAL SAFETY
             * ============================================================= */
            .mx_Dialog,
            .mx_Dialog_background,
            .mx_ContextualMenu,
            .mx_ContextualMenu_background,
            .mx_Toast_toast {
                -webkit-app-region: no-drag;
            }
            iframe {
                -webkit-app-region: no-drag;
            }
        `);
    }

    window.on("enter-full-screen", () => {
        if (cssKey !== undefined) {
            void window.webContents.removeInsertedCSS(cssKey);
        }
    });
    window.on("leave-full-screen", () => {
        void applyStyling();
    });
    window.webContents.on("did-finish-load", () => {
        if (!window.isFullScreen()) {
            void applyStyling();
        }
    });
}
