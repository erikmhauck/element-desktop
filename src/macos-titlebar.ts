/*
Copyright 2023, 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import type { BrowserWindow } from "electron";

/**
 * macOS title bar — full-width drag band using z-index overlays.
 *
 * Creates a continuous draggable band across the full window width by
 * applying drag overlays to all three columns (space panel, room list,
 * room view) at the same vertical position.
 *
 * Uses Electron 23+ z-index stacking: drag overlay on top wins over
 * no-drag elements below. Interactive elements raised above the overlay.
 */
export function setupMacosTitleBar(window: BrowserWindow): void {
    if (process.platform !== "darwin") return;

    let cssKey: string | undefined;

    async function applyStyling(): Promise<void> {
        cssKey = await window.webContents.insertCSS(`
            /* =============================================================
             * COLUMN 1: SPACE PANEL — push content below header band
             *
             * The space panel gets top padding equal to the room header
             * height (64px). Traffic lights sit in this area. The ::after
             * overlay makes it a drag surface. Space icons start below.
             * ============================================================= */
            .mx_SpacePanel {
                padding-top: 64px !important;
                position: relative !important;
            }
            .mx_SpacePanel::after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 64px;
                -webkit-app-region: drag;
                z-index: 5;
            }

            /* User menu no longer needs extra traffic light padding —
             * the 64px space panel padding handles it */
            .mx_UserMenu {
                padding-top: 0 !important;
                margin-top: 12px !important;
            }
            .mx_UserMenu > * {
                -webkit-app-region: no-drag;
            }

            /* Reset toggle collapse position */
            .mx_SpacePanel_toggleCollapse {
                top: 19px !important;
            }

            /* =============================================================
             * COLUMN 2: ROOM LIST — search/filter with overlay
             *
             * Convert margin to padding so the overlay covers the edges.
             * Push content down to align with space panel.
             * ============================================================= */
            .mx_LeftPanel_roomListContainer {
                padding-top: 64px !important;
                position: relative !important;
            }
            .mx_LeftPanel_roomListContainer::after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 64px;
                -webkit-app-region: drag;
                z-index: 5;
            }

            /* Search filter — sits in the content area below the 64px band.
             * Uses its own overlay for the padding around the search input. */
            .mx_LeftPanel_filterContainer {
                position: relative !important;
                -webkit-user-select: none;
                margin-left: 0 !important;
                margin-right: 0 !important;
                padding-left: 12px !important;
                padding-right: 12px !important;
            }
            .mx_LeftPanel_filterContainer::after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                -webkit-app-region: drag;
                z-index: 5;
            }
            .mx_LeftPanel_filterContainer > * {
                position: relative !important;
                z-index: 10 !important;
                -webkit-app-region: no-drag;
            }

            /* New room list header */
            .mx_RoomListHeaderView {
                position: relative !important;
                -webkit-user-select: none;
            }
            .mx_RoomListHeaderView::after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                -webkit-app-region: drag;
                z-index: 5;
            }
            .mx_RoomListHeaderView > * {
                position: relative !important;
                z-index: 10 !important;
                -webkit-app-region: no-drag;
            }

            /* Legacy room list header */
            .mx_LegacyRoomListHeader {
                position: relative !important;
                -webkit-user-select: none;
            }
            .mx_LegacyRoomListHeader::after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                -webkit-app-region: drag;
                z-index: 5;
            }
            .mx_LegacyRoomListHeader > * {
                position: relative !important;
                z-index: 10 !important;
                -webkit-app-region: no-drag;
            }

            /* Room list scroll — never draggable */
            .mx_LeftPanel .mx_AutoHideScrollbar,
            .mx_LeftPanel .mx_IndicatorScrollbar {
                -webkit-app-region: no-drag;
            }

            /* =============================================================
             * COLUMN 3: ROOM VIEW — header with overlay
             *
             * The room header (64px) IS the top bar for this column.
             * ::after overlay covers it. Interactive elements raised above.
             * InfoWrapper keeps flex:1 (buttons naturally flex-end).
             * ============================================================= */
            header.mx_RoomHeader,
            .mx_RoomHeader.light-panel {
                position: relative !important;
                -webkit-user-select: none;
            }
            header.mx_RoomHeader::after,
            .mx_RoomHeader.light-panel::after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                -webkit-app-region: drag;
                z-index: 5;
            }

            /* Raise all direct children above overlay EXCEPT infoWrapper */
            header.mx_RoomHeader > *:not(.mx_RoomHeader_infoWrapper),
            .mx_RoomHeader.light-panel > *:not(.mx_RoomHeader_infoWrapper) {
                position: relative !important;
                z-index: 10 !important;
                -webkit-app-region: no-drag;
            }

            /* InfoWrapper: NO stacking context → below overlay.
             * Keep flex:1 so buttons push to the right naturally.
             * Empty space right of room name → overlay wins → drag. */
            .mx_RoomHeader_infoWrapper {
                position: static !important;
                z-index: auto !important;
            }

            /* Room name text — raised above overlay, clickable */
            .mx_RoomHeader_heading {
                position: relative !important;
                z-index: 10 !important;
                -webkit-app-region: no-drag;
                cursor: pointer;
            }

            /* Info box — no stacking context */
            .mx_RoomHeader_info {
                position: static !important;
                z-index: auto !important;
            }

            /* Legacy room header */
            .mx_LegacyRoomHeader {
                position: relative !important;
                -webkit-user-select: none;
            }
            .mx_LegacyRoomHeader::after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                -webkit-app-region: drag;
                z-index: 5;
            }
            .mx_LegacyRoomHeader > * {
                position: relative !important;
                z-index: 10 !important;
                -webkit-app-region: no-drag;
            }

            /* Room view content — never draggable */
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
