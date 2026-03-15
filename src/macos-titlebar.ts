/*
Copyright 2023, 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import type { BrowserWindow } from "electron";

/**
 * macOS title bar — z-index overlay approach.
 *
 * Leverages Electron 23+ behavior: "a drag region on top of a no-drag
 * region will correctly cause the region to be draggable."
 *
 * An absolutely-positioned ::after pseudo-element covers the full header
 * as a drag surface. Interactive elements (buttons, heading text, avatar)
 * are raised above it with z-index + no-drag. The infoWrapper button
 * (which has flex:1 + height:100% and covers the entire header) is left
 * WITHOUT a stacking context so it sits below the overlay — its empty
 * space becomes drag territory.
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
             * ROOM HEADER — z-index overlay approach
             *
             * ::after = full-size drag overlay at z-index 5
             * Interactive elements raised to z-index 10 with no-drag
             * InfoWrapper has NO stacking context → sits below overlay
             * Heading text raised to z-index 10 independently
             * ============================================================= */
            header.mx_RoomHeader,
            .mx_RoomHeader.light-panel {
                position: relative !important;
                -webkit-user-select: none;
            }

            /* The drag overlay — covers the entire header */
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

            /* Raise ALL direct children above the overlay...
             * EXCEPT the infoWrapper which we want below it */
            header.mx_RoomHeader > *:not(.mx_RoomHeader_infoWrapper),
            .mx_RoomHeader.light-panel > *:not(.mx_RoomHeader_infoWrapper) {
                position: relative !important;
                z-index: 10 !important;
                -webkit-app-region: no-drag;
            }

            /* The infoWrapper: do NOT give it position/z-index.
             * Without a stacking context, it sits below the ::after overlay.
             * Clicks on its empty space (right of room name) hit the overlay → drag.
             * Also remove flex:1 visual waste — constrain to content width. */
            .mx_RoomHeader_infoWrapper {
                position: static !important;
                z-index: auto !important;
                /* Shrink to content instead of filling entire header width */
                flex: 0 1 auto !important;
                min-width: 0;
            }

            /* The heading text (room name) — raise ABOVE the overlay.
             * Since infoWrapper has no stacking context, this participates
             * in the header's stacking context directly. */
            .mx_RoomHeader_heading {
                position: relative !important;
                z-index: 10 !important;
                -webkit-app-region: no-drag;
                cursor: pointer;
            }

            /* The info box wrapper — also no stacking context */
            .mx_RoomHeader_info {
                position: static !important;
                z-index: auto !important;
            }

            /* Legacy room header — same overlay approach */
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

            /* =============================================================
             * SEARCH / FILTER — same overlay approach
             *
             * ::after = drag overlay covering the full container
             * RoomSearch button raised above it → clickable
             * Padding areas fall through to overlay → drag
             * ============================================================= */
            .mx_LeftPanel_filterContainer {
                position: relative !important;
                -webkit-user-select: none;
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
            /* Raise search button and controls above overlay */
            .mx_LeftPanel_filterContainer > * {
                position: relative !important;
                z-index: 10 !important;
                -webkit-app-region: no-drag;
            }

            /* New room list header — overlay approach */
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
