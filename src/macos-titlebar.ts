/*
Copyright 2023, 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import type { BrowserWindow } from "electron";

/**
 * Unified macOS title bar drag region — Safari-style.
 *
 * Instead of sprinkling separate ::before drag handles on individual panels,
 * we overlay a single fixed drag strip across the full window width at the top.
 * Interactive elements underneath (buttons, search, menus) are carved out with
 * -webkit-app-region: no-drag so they remain clickable.
 *
 * The strip height (38px) matches native macOS title bars with traffic lights
 * and provides comfortable drag surface everywhere.
 */
export function setupMacosTitleBar(window: BrowserWindow): void {
    if (process.platform !== "darwin") return;

    let cssKey: string | undefined;

    async function applyStyling(): Promise<void> {
        cssKey = await window.webContents.insertCSS(`
            /* =========================================================
             * UNIFIED DRAG BAR — fixed overlay across full window width
             * ========================================================= */
            body::before {
                content: "";
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 38px;
                -webkit-app-region: drag;
                -webkit-user-select: none;
                z-index: 100;
                /* Transparent — purely a hit-test overlay */
                pointer-events: none;
            }

            /* =========================================================
             * INTERACTIVE CARVE-OUTS — punch through the drag overlay
             * so buttons, search, menus, etc. remain clickable
             * ========================================================= */

            /* All buttons and interactive controls in the top zone */
            .mx_AccessibleButton,
            .mx_IconButton,
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
            [role="combobox"] {
                -webkit-app-region: no-drag;
            }

            /* Search bar and room list filter */
            .mx_RoomSearch,
            .mx_SpotlightDialog,
            .mx_FilterContainer,
            .mx_RoomListHeader,
            .mx_LeftPanel_filterContainer {
                -webkit-app-region: no-drag;
            }

            /* Left panel interactive elements */
            .mx_LeftPanel .mx_AutoHideScrollbar,
            .mx_SpacePanel,
            .mx_SpacePanel_toggleCollapse {
                -webkit-app-region: no-drag;
            }

            /* User menu — keep it clickable, but pad it down from traffic lights */
            .mx_UserMenu {
                margin-top: 0 !important;
                margin-left: 0 !important;
                padding-top: 38px !important;
                padding-left: 12px !important;
                -webkit-app-region: no-drag;
            }

            /* Room header bar elements */
            .mx_RoomHeader,
            .mx_LegacyRoomHeader,
            .mx_RoomView_header {
                -webkit-app-region: no-drag;
            }

            /* Right panel */
            .mx_RightPanel,
            .mx_RightPanel_ResizeWrapper {
                -webkit-app-region: no-drag;
            }

            /* Room content and message area */
            .mx_RoomView_body,
            .mx_AutoHideScrollbar,
            .mx_RoomPreviewBar,
            .mx_RoomPreviewCard {
                -webkit-app-region: no-drag;
            }

            /* Dialogs, modals, context menus, toasts */
            .mx_Dialog,
            .mx_Dialog_background,
            .mx_ContextualMenu,
            .mx_ContextualMenu_background,
            .mx_Toast_toast,
            .mx_GenericToast {
                -webkit-app-region: no-drag;
            }

            /* Iframes (recaptcha, etc.) */
            iframe {
                -webkit-app-region: no-drag;
            }

            /* =========================================================
             * FULL-PAGE DRAG SURFACES — auth, splash, home
             * These pages have large empty areas that should be draggable
             * ========================================================= */

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

            /* =========================================================
             * IMAGE LIGHTBOX — drag the header bar area
             * ========================================================= */
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

            /* =========================================================
             * LAYOUT ADJUSTMENTS — push content below the drag bar
             * ========================================================= */

            /* Push the left panel content down so it doesn't hide under the drag bar */
            .mx_LeftPanel {
                padding-top: 28px;
            }

            /* Push room view header down to clear the drag bar */
            .mx_RoomView,
            .mx_SpaceRoomView {
                padding-top: 0;
            }

            /* The new room list header needs a top margin to clear traffic lights */
            .mx_LeftPanel_newRoomList {
                margin-top: 4px;
            }

            /* Space room views need top clearance */
            .mx_SpaceRoomView_landing {
                padding-top: 28px;
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
