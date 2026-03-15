/*
Copyright 2023, 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import type { BrowserWindow } from "electron";

/**
 * macOS title bar — zero added space, existing negative space is draggable.
 *
 * Key fixes over upstream:
 * 1. .mx_RoomHeader_infoWrapper overridden from height:100% to height:auto
 *    so header padding is exposed as drag surface.
 * 2. The infoWrapper button is NOT marked no-drag — it inherits drag from
 *    the header so the 52px right padding (empty space right of room name)
 *    is a drag surface.
 * 3. Only the heading text and non-infoWrapper buttons are no-drag.
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
             * ROOM HEADER — the whole 64px bar is draggable
             *
             * The infoWrapper button (room name area) KEEPS drag behavior
             * from the header. Only the actual heading text and right-side
             * buttons are carved out as no-drag. This means the empty
             * space to the right of the room name and the padding above/
             * below all header items are drag surfaces.
             * ============================================================= */
            header.mx_RoomHeader,
            .mx_RoomHeader.light-panel {
                -webkit-app-region: drag;
                -webkit-user-select: none;
            }

            /* Break the info wrapper's height:100% so the header's own
             * padding is exposed above and below */
            .mx_RoomHeader_infoWrapper {
                height: auto !important;
                align-self: center !important;
            }

            /* The room name / heading text — clickable (opens room info) */
            .mx_RoomHeader_heading {
                -webkit-app-region: no-drag;
            }

            /* All buttons EXCEPT the infoWrapper — clickable */
            .mx_RoomHeader button:not(.mx_RoomHeader_infoWrapper) {
                -webkit-app-region: no-drag;
            }

            /* Other interactive elements in the header */
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
             * SEARCH / FILTER AREA — container padding is draggable
             *
             * The filter container has 12px top + 8px bottom padding.
             * RoomSearch (flex:1, 28px) sits inside. The padding strips
             * above and below the search button are the drag surface.
             * The search button itself stays interactive.
             * ============================================================= */
            .mx_LeftPanel_filterContainer {
                -webkit-app-region: drag;
                -webkit-user-select: none;
            }
            /* The search button and other controls — interactive */
            .mx_LeftPanel_filterContainer .mx_RoomSearch,
            .mx_LeftPanel_filterContainer .mx_AccessibleButton,
            .mx_LeftPanel_filterContainer button {
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
