/*
Copyright 2023, 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import type { BrowserWindow } from "electron";

/**
 * macOS title bar — Safari-style unified drag regions.
 *
 * Makes the actual visible header elements draggable (room header, left panel
 * header area) and carves out interactive children. No overlays, no
 * pseudo-elements — just the real UI elements doing double duty as drag
 * handles, exactly like Safari's toolbar.
 */
export function setupMacosTitleBar(window: BrowserWindow): void {
    if (process.platform !== "darwin") return;

    let cssKey: string | undefined;

    async function applyStyling(): Promise<void> {
        cssKey = await window.webContents.insertCSS(`
            /* =============================================================
             * GLOBAL: all interactive elements are never drag handles
             * ============================================================= */
            button,
            input,
            textarea,
            select,
            a,
            [role="button"],
            [role="menuitem"],
            [role="tab"],
            [role="textbox"],
            [role="searchbox"],
            [role="combobox"],
            .mx_AccessibleButton,
            .mx_IconButton {
                -webkit-app-region: no-drag;
            }

            /* Dialogs, menus, toasts — never drag */
            .mx_Dialog,
            .mx_Dialog_background,
            .mx_ContextualMenu,
            .mx_ContextualMenu_background,
            .mx_Toast_toast,
            .mx_GenericToast {
                -webkit-app-region: no-drag;
            }

            /* Iframes */
            iframe {
                -webkit-app-region: no-drag;
            }

            /* =============================================================
             * LEFT PANEL — search bar integrated into drag zone
             * ============================================================= */

            /* The left panel container itself gets top padding for traffic lights */
            .mx_LeftPanel {
                padding-top: 6px;
            }

            /* The filter/search container IS the drag handle on the left side.
             * The search input inside it is carved out so you can still click to search. */
            .mx_LeftPanel_filterContainer {
                -webkit-app-region: drag;
                -webkit-user-select: none;
                padding-top: 4px;
                padding-bottom: 4px;
            }

            /* Search input itself — clickable, not draggable */
            .mx_LeftPanel_filterContainer .mx_RoomSearch,
            .mx_LeftPanel_filterContainer input,
            .mx_LeftPanel_filterContainer .mx_LeftPanel_dialPadButton,
            .mx_LeftPanel_filterContainer .mx_LeftPanel_exploreButton {
                -webkit-app-region: no-drag;
            }

            /* New room list header (Compound-based) — also a drag handle */
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

            /* New room list panel header area */
            .mx_RoomListPanel > header,
            .mx_RoomListPanel > [class*="header"] {
                -webkit-app-region: drag;
                -webkit-user-select: none;
            }
            .mx_RoomListPanel > header > *,
            .mx_RoomListPanel > [class*="header"] > * {
                -webkit-app-region: no-drag;
            }

            /* User menu — pad down from traffic lights, draggable background */
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

            /* Space panel toggle */
            .mx_SpacePanel_toggleCollapse {
                top: calc(19px + 32px - 12px) !important;
            }

            /* Scrollable room list — not draggable */
            .mx_LeftPanel .mx_AutoHideScrollbar {
                -webkit-app-region: no-drag;
            }

            /* =============================================================
             * ROOM HEADER — the entire bar is a drag handle
             * ============================================================= */

            /* The room header flex container — THIS is the main drag surface
             * on the right side of the window, equivalent to Safari's toolbar */
            header.mx_RoomHeader,
            .mx_RoomHeader.light-panel {
                -webkit-app-region: drag;
                -webkit-user-select: none;
                /* Ensure enough height for comfortable dragging */
                min-height: 38px;
            }

            /* All interactive children inside room header — not draggable */
            .mx_RoomHeader .mx_RoomHeader_infoWrapper,
            .mx_RoomHeader button,
            .mx_RoomHeader a,
            .mx_RoomHeader .mx_FacePile,
            .mx_RoomHeader .mx_RoomHeader_members,
            .mx_RoomHeader .mx_RoomAvatar,
            .mx_RoomHeader [role="button"],
            .mx_RoomHeader .mx_IconButton,
            .mx_RoomHeader .mx_RoomHeader_join_button {
                -webkit-app-region: no-drag;
            }

            /* Legacy room header (older Element versions) */
            .mx_LegacyRoomHeader {
                -webkit-app-region: drag;
                -webkit-user-select: none;
                min-height: 38px;
            }
            .mx_LegacyRoomHeader > * {
                -webkit-app-region: no-drag;
            }

            /* Room view header wrapper */
            .mx_RoomView_header {
                -webkit-app-region: drag;
                -webkit-user-select: none;
            }
            .mx_RoomView_header > * {
                -webkit-app-region: no-drag;
            }

            /* =============================================================
             * FULL-PAGE VIEWS — large draggable backgrounds
             * ============================================================= */

            /* Splash / loading screen */
            .mx_MatrixChat_splash {
                -webkit-app-region: drag;
            }
            .mx_MatrixChat_splashButtons {
                -webkit-app-region: no-drag;
            }

            /* Auth pages (login/register) */
            .mx_AuthPage {
                -webkit-app-region: drag;
            }
            .mx_AuthPage .mx_AuthPage_modalContent,
            .mx_AuthPage .mx_AuthPage_modalBlur,
            .mx_AuthPage .mx_AuthFooter > *,
            .mx_AuthPage .mx_Dropdown_menu {
                -webkit-app-region: no-drag;
            }

            /* Home page */
            .mx_HomePage {
                -webkit-app-region: drag;
            }
            .mx_HomePage .mx_HomePage_body,
            .mx_HomePage .mx_HomePage_default_wrapper > * {
                -webkit-app-region: no-drag;
            }

            /* Space room view — background draggable when no modal open */
            .mx_MatrixChat_wrapper[aria-hidden="false"] .mx_RoomView_wrapper {
                -webkit-app-region: drag;
            }
            .mx_SpaceRoomView_landing > *,
            .mx_RoomPreviewBar,
            .mx_RoomView_body,
            .mx_RoomPreviewCard,
            .mx_RightPanel,
            .mx_RightPanel_ResizeWrapper {
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
                margin-top: 38px;
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
