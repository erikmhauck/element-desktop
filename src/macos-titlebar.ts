/*
Copyright 2023, 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import type { BrowserWindow } from "electron";

/**
 * macOS title bar — full-width drag region across the entire top of the window.
 *
 * Key insight: .mx_RoomHeader_infoWrapper has `height: 100%` which covers the
 * entire 64px header, leaving zero exposed surface for drag. We override it to
 * `height: auto` so the header's padding/gap areas become drag surfaces.
 *
 * Three drag zones work together to span the full window width:
 * 1. Left column (space panel): mx_UserMenu padding area
 * 2. Middle column (room list): ::before strip + filter container padding
 * 3. Right column (room view): ::before strip + room header background
 */
export function setupMacosTitleBar(window: BrowserWindow): void {
    if (process.platform !== "darwin") return;

    let cssKey: string | undefined;

    async function applyStyling(): Promise<void> {
        cssKey = await window.webContents.insertCSS(`
            /* =============================================================
             * ZONE 1: SPACE PANEL — user menu area as drag handle
             * ============================================================= */
            .mx_UserMenu {
                margin-top: 0 !important;
                margin-left: 0 !important;
                padding-top: 32px !important;
                padding-left: 20px !important;
                -webkit-app-region: drag;
                -webkit-user-select: none;
            }
            .mx_UserMenu > * {
                -webkit-app-region: no-drag;
            }
            .mx_SpacePanel_toggleCollapse {
                top: calc(19px + 32px - 12px) !important;
            }

            /* =============================================================
             * ZONE 2: ROOM LIST COLUMN — strip + search area
             * ============================================================= */
            .mx_LeftPanel {
                flex-direction: column;
            }

            /* Drag strip above the room list, aligned with traffic lights */
            .mx_LeftPanel::before {
                content: "";
                display: block;
                height: 32px;
                -webkit-app-region: drag;
                flex-shrink: 0;
            }
            .mx_LeftPanel_newRoomList::before {
                height: 32px;
                border-right: 1px solid var(--cpd-color-bg-subtle-primary);
            }

            /* Search/filter container — padding around search is draggable */
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

            /* New room list panel header — also draggable */
            .mx_RoomListHeaderView {
                -webkit-app-region: drag;
                -webkit-user-select: none;
            }
            .mx_RoomListHeaderView button,
            .mx_RoomListHeaderView a,
            .mx_RoomListHeaderView [role="button"] {
                -webkit-app-region: no-drag;
            }

            /* Room list itself is never draggable */
            .mx_LeftPanel .mx_AutoHideScrollbar,
            .mx_LeftPanel .mx_IndicatorScrollbar {
                -webkit-app-region: no-drag;
            }

            /* =============================================================
             * ZONE 3: ROOM VIEW — strip above header + header itself
             * ============================================================= */

            /* Drag strip above the room header, same height as left column */
            .mx_RoomView::before,
            .mx_SpaceRoomView::before {
                content: "";
                display: block;
                height: 32px;
                -webkit-app-region: drag;
                flex-shrink: 0;
            }

            /* THE FIX: the room header itself is a drag handle.
             * This works because we override the info wrapper from
             * height:100% to height:auto, exposing the header's own
             * padding/gap area (about 12px above and below the content). */
            header.mx_RoomHeader,
            .mx_RoomHeader.light-panel {
                -webkit-app-region: drag;
                -webkit-user-select: none;
            }

            /* Break the info wrapper's 100% height so it doesn't cover
             * the entire header surface */
            .mx_RoomHeader_infoWrapper {
                height: auto !important;
                align-self: center !important;
            }

            /* All interactive children carved out */
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

            /* Room view content — never draggable */
            .mx_RoomView_body,
            .mx_RoomView_statusArea,
            .mx_MessageComposer,
            .mx_RoomKnocksBar {
                -webkit-app-region: no-drag;
            }

            /* Right panel */
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
                margin-top: 32px;
            }

            /* =============================================================
             * GLOBAL SAFETY — dialogs, menus, iframes never drag
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
