/*
Copyright 2023, 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import type { BrowserWindow } from "electron";

/**
 * macOS title bar drag regions.
 *
 * Strategy: use ::before/::after pseudo-elements as drag overlays positioned
 * ON TOP of the header bars (not as separate strips that push content down).
 * This is the VS Code approach — a thin drag region overlaps the top portion
 * of the UI where there's padding/empty space, while interactive elements
 * below remain clickable.
 *
 * The left panel search area uses its container padding as drag surface.
 * The room header uses an overlay that covers its top padding zone.
 */
export function setupMacosTitleBar(window: BrowserWindow): void {
    if (process.platform !== "darwin") return;

    let cssKey: string | undefined;

    async function applyStyling(): Promise<void> {
        cssKey = await window.webContents.insertCSS(`
            /* =============================================================
             * USER MENU — traffic light clearance + drag handle
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

            /* Keep space panel toggle aligned */
            .mx_SpacePanel_toggleCollapse {
                top: calc(19px + 32px - 12px) !important;
            }

            /* =============================================================
             * LEFT PANEL — drag bar that sits alongside the search bar
             * ============================================================= */

            .mx_LeftPanel {
                flex-direction: column;
            }

            /* A drag strip above the left panel content, same height as
             * the traffic light zone */
            .mx_LeftPanel::before {
                content: "";
                height: 20px;
                -webkit-app-region: drag;
            }

            /* For the new room list layout */
            .mx_LeftPanel_newRoomList::before {
                height: 13px;
                border-right: 1px solid var(--cpd-color-bg-subtle-primary);
            }

            /* The search/filter container — make the PADDING area draggable
             * while the search input stays interactive */
            .mx_LeftPanel_filterContainer {
                -webkit-app-region: drag;
                -webkit-user-select: none;
            }
            .mx_LeftPanel_filterContainer .mx_RoomSearch,
            .mx_LeftPanel_filterContainer input,
            .mx_LeftPanel_filterContainer button,
            .mx_LeftPanel_filterContainer .mx_LeftPanel_dialPadButton,
            .mx_LeftPanel_filterContainer .mx_LeftPanel_exploreButton,
            .mx_LeftPanel_filterContainer .mx_AccessibleButton {
                -webkit-app-region: no-drag;
            }

            /* =============================================================
             * ROOM VIEW / SPACE VIEW — drag overlay on the header zone
             *
             * Uses ::before as an absolutely-positioned overlay covering the
             * top portion of the room view. This overlaps the top padding of
             * the room header, providing a drag surface without adding extra
             * space or pushing content down.
             * ============================================================= */

            .mx_RoomView,
            .mx_SpaceRoomView {
                position: relative;
            }

            .mx_RoomView::before,
            .mx_SpaceRoomView::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                /* Cover the top 10px of the header — this is padding/gap area,
                 * no interactive elements live here */
                height: 10px;
                -webkit-app-region: drag;
                z-index: 10;
                pointer-events: auto;
            }

            /* =============================================================
             * FULL-PAGE BACKGROUNDS — splash, auth, home
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

            /* Background drag when no modal is open */
            .mx_MatrixChat_wrapper[aria-hidden="false"] .mx_RoomView_wrapper,
            .mx_MatrixChat_wrapper[aria-hidden="false"] .mx_HomePage {
                -webkit-app-region: drag;
            }
            .mx_SpaceRoomView_landing > *,
            .mx_RoomPreviewBar,
            .mx_RoomView_body,
            .mx_AutoHideScrollbar,
            .mx_RightPanel_ResizeWrapper,
            .mx_RoomPreviewCard,
            .mx_LeftPanel,
            .mx_RoomView,
            .mx_SpaceRoomView,
            .mx_AccessibleButton,
            .mx_Dialog {
                -webkit-app-region: no-drag;
            }

            /* Context menus */
            .mx_ContextualMenu, .mx_ContextualMenu_background {
                -webkit-app-region: no-drag;
            }

            /* Iframes */
            iframe {
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
