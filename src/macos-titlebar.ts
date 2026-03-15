/*
Copyright 2023, 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import type { BrowserWindow } from "electron";

/**
 * macOS title bar — zero added space, existing negative space is draggable.
 *
 * The infoWrapper button is EXPLICITLY set to drag (not relying on
 * inheritance from the header — inheritance through <button> elements
 * may not work in all Chromium versions). Only the heading text inside
 * is carved out as no-drag so the room name remains clickable.
 */
export function setupMacosTitleBar(window: BrowserWindow): void {
    if (process.platform !== "darwin") return;

    let cssKey: string | undefined;

    async function applyStyling(): Promise<void> {
        cssKey = await window.webContents.insertCSS(`
            /* =============================================================
             * USER MENU — traffic light clearance + drag
             * ============================================================= */
            .mx_UserMenu {
                margin-top: 0 !important;
                margin-left: 0 !important;
                padding-top: 24px !important;
                padding-left: 20px !important;
                -webkit-app-region: drag;
                -webkit-user-select: none;
            }
            .mx_UserMenu > * {
                -webkit-app-region: no-drag;
            }
            .mx_SpacePanel_toggleCollapse {
                top: calc(19px + 24px - 12px) !important;
            }

            /* =============================================================
             * ROOM HEADER — the 64px bar is the drag surface
             * ============================================================= */
            header.mx_RoomHeader,
            .mx_RoomHeader.light-panel {
                -webkit-app-region: drag;
                -webkit-user-select: none;
            }

            /* The info wrapper: override height:100% to expose header padding,
             * and EXPLICITLY set drag (not inheritance — buttons may block it) */
            .mx_RoomHeader_infoWrapper {
                height: auto !important;
                align-self: center !important;
                -webkit-app-region: drag !important;
            }

            /* The room name text — this is the only clickable part of the
             * info wrapper. Clicking here opens room summary panel. */
            .mx_RoomHeader_heading {
                -webkit-app-region: no-drag !important;
                cursor: pointer;
            }

            /* All other buttons in the header (call, threads, notifications,
             * info, member count) — clickable */
            .mx_RoomHeader button:not(.mx_RoomHeader_infoWrapper) {
                -webkit-app-region: no-drag;
            }
            .mx_RoomHeader a,
            .mx_RoomHeader [role="button"],
            .mx_RoomHeader .mx_FacePile,
            .mx_RoomHeader .mx_BaseAvatar,
            .mx_RoomHeader .mx_RoomAvatar {
                -webkit-app-region: no-drag;
            }

            /* Legacy room header */
            .mx_LegacyRoomHeader {
                -webkit-app-region: drag;
                -webkit-user-select: none;
            }
            .mx_LegacyRoomHeader button,
            .mx_LegacyRoomHeader a,
            .mx_LegacyRoomHeader [role="button"],
            .mx_LegacyRoomHeader .mx_AccessibleButton {
                -webkit-app-region: no-drag;
            }

            /* =============================================================
             * SEARCH / FILTER — convert margin to padding for more drag area
             *
             * The filter container originally has margin:0 12px (not part of
             * the element) and padding:12px 0 8px. We convert the horizontal
             * margin to padding so the left/right edges become drag surfaces
             * too, giving ~12px on each side plus 12px above and 8px below.
             * ============================================================= */
            .mx_LeftPanel_filterContainer {
                -webkit-app-region: drag;
                -webkit-user-select: none;
                margin-left: 0 !important;
                margin-right: 0 !important;
                padding-left: 12px !important;
                padding-right: 12px !important;
            }
            /* The search button and controls — interactive */
            .mx_LeftPanel_filterContainer .mx_RoomSearch {
                -webkit-app-region: no-drag;
            }
            .mx_LeftPanel_filterContainer button,
            .mx_LeftPanel_filterContainer [role="button"]:not(.mx_RoomSearch) {
                -webkit-app-region: no-drag;
            }

            /* New room list header */
            .mx_RoomListHeaderView {
                -webkit-app-region: drag;
                -webkit-user-select: none;
            }
            .mx_RoomListHeaderView button,
            .mx_RoomListHeaderView a,
            .mx_RoomListHeaderView [role="button"] {
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

            /* Room list scroll — never draggable */
            .mx_LeftPanel .mx_AutoHideScrollbar,
            .mx_LeftPanel .mx_IndicatorScrollbar {
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
