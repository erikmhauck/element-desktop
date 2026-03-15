/*
Copyright 2023, 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import type { BrowserWindow } from "electron";

/**
 * macOS title bar — zero extra space, existing negative space is draggable.
 *
 * No ::before strips, no added padding, no pushed-down content.
 * The existing UI elements (room header, search area) do double duty
 * as drag handles. Traffic lights float over the top-left with just
 * enough clearance on the user menu.
 */
export function setupMacosTitleBar(window: BrowserWindow): void {
    if (process.platform !== "darwin") return;

    let cssKey: string | undefined;

    async function applyStyling(): Promise<void> {
        cssKey = await window.webContents.insertCSS(`
            /* =============================================================
             * USER MENU — just enough padding to clear traffic lights
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
             * ROOM HEADER — the existing 64px bar is the drag handle
             *
             * Key fix: override .mx_RoomHeader_infoWrapper from height:100%
             * to height:auto so it sizes to content (~40px), exposing the
             * header's own padding (~12px above and below) as drag surface.
             * ============================================================= */
            header.mx_RoomHeader,
            .mx_RoomHeader.light-panel {
                -webkit-app-region: drag;
                -webkit-user-select: none;
            }

            .mx_RoomHeader_infoWrapper {
                height: auto !important;
                align-self: center !important;
            }

            .mx_RoomHeader button,
            .mx_RoomHeader a,
            .mx_RoomHeader [role="button"],
            .mx_RoomHeader .mx_FacePile,
            .mx_RoomHeader .mx_RoomAvatar,
            .mx_RoomHeader .mx_BaseAvatar,
            .mx_RoomHeader .mx_RoomHeader_infoWrapper,
            .mx_RoomHeader .mx_IconButton {
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
             * SEARCH / FILTER — padding around search input is draggable
             * ============================================================= */
            .mx_LeftPanel_filterContainer {
                -webkit-app-region: drag;
                -webkit-user-select: none;
            }
            .mx_LeftPanel_filterContainer .mx_RoomSearch,
            .mx_LeftPanel_filterContainer input,
            .mx_LeftPanel_filterContainer button,
            .mx_LeftPanel_filterContainer .mx_AccessibleButton {
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

            /* Room list scroll area — never draggable */
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
             * FULL-PAGE VIEWS — splash, auth, home
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
             * GLOBAL SAFETY — dialogs, menus, iframes
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
