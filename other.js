import {mojo} from "chrome://resources/mojo/mojo/public/js/bindings.js";
import {html, Polymer, Base, dom, mixinBehaviors, PolymerElement, dashToCamelCase, dedupingMixin, useShadow} from "chrome://resources/polymer/v3_0/polymer/polymer_bundled.min.js";
import {TimeDeltaSpec} from "chrome://resources/mojo/mojo/public/mojom/base/time.mojom-webui.js";
import "./strings.m.js";
import {loadTimeData} from "chrome://resources/js/load_time_data.js";
import {PageHandlerRemote, PageCallbackRouter, PageHandlerFactory} from "./new_tab_page.mojom-webui.js";
// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const isMac = /Mac/.test(navigator.platform);
const isWindows = /Win/.test(navigator.platform);
const isAndroid = /Android/.test(navigator.userAgent);
const isIOS = /CriOS/.test(navigator.userAgent);
// Copyright 2016 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
function getSupportedScaleFactors() {
    const supportedScaleFactors = [];
    if (!isIOS) {
        supportedScaleFactors.push(1)
    }
    if (!isIOS && !isAndroid) {
        supportedScaleFactors.push(2)
    } else {
        supportedScaleFactors.push(window.devicePixelRatio)
    }
    return supportedScaleFactors
}
function getUrlForCss(s) {
    const s2 = s.replace(/(\(|\)|\,|\s|\'|\"|\\)/g, "\\$1");
    return `url("${s2}")`
}
function getImageSet(path) {
    const supportedScaleFactors = getSupportedScaleFactors();
    const replaceStartIndex = path.indexOf("SCALEFACTOR");
    if (replaceStartIndex < 0) {
        return getUrlForCss(path)
    }
    let s = "";
    for (let i = 0; i < supportedScaleFactors.length; ++i) {
        const scaleFactor = supportedScaleFactors[i];
        const pathWithScaleFactor = path.substr(0, replaceStartIndex) + scaleFactor + path.substr(replaceStartIndex + "scalefactor".length);
        s += getUrlForCss(pathWithScaleFactor) + " " + scaleFactor + "x";
        if (i !== supportedScaleFactors.length - 1) {
            s += ", "
        }
    }
    return "image-set(" + s + ")"
}
function getBaseFaviconUrl() {
    const faviconUrl = new URL("chrome://favicon2/");
    faviconUrl.searchParams.set("size", "16");
    faviconUrl.searchParams.set("scaleFactor", "SCALEFACTORx");
    return faviconUrl
}
function getFaviconForPageURL(url, isSyncedUrlForHistoryUi, remoteIconUrlForUma="", size=16, forceLightMode=false) {
    const faviconUrl = getBaseFaviconUrl();
    faviconUrl.searchParams.set("size", size.toString());
    faviconUrl.searchParams.set("pageUrl", url);
    const fallback = isSyncedUrlForHistoryUi ? "1" : "0";
    faviconUrl.searchParams.set("allowGoogleServerFallback", fallback);
    if (isSyncedUrlForHistoryUi) {
        faviconUrl.searchParams.set("iconUrl", remoteIconUrlForUma)
    }
    if (forceLightMode) {
        faviconUrl.searchParams.set("forceLightMode", "true")
    }
    return getImageSet(faviconUrl.toString())
}
/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
const template$3 = html`
<custom-style>
  <style is="custom-style">
    html {

      /* Material Design color palette for Google products */

      --google-red-100-rgb: 244, 199, 195;  /* #f4c7c3 */
      --google-red-100: rgb(var(--google-red-100-rgb));
      --google-red-300-rgb: 230, 124, 115;  /* #e67c73 */
      --google-red-300: rgb(var(--google-red-300-rgb));
      --google-red-500-rgb: 219, 68, 55;  /* #db4437 */
      --google-red-500: rgb(var(--google-red-500-rgb));
      --google-red-700-rgb: 197, 57, 41;  /* #c53929 */
      --google-red-700: rgb(var(--google-red-700-rgb));

      --google-blue-100-rgb: 198, 218, 252;  /* #c6dafc */
      --google-blue-100: rgb(var(--google-blue-100-rgb));
      --google-blue-300-rgb: 123, 170, 247;  /* #7baaf7 */
      --google-blue-300: rgb(var(--google-blue-300-rgb));
      --google-blue-500-rgb: 66, 133, 244;  /* #4285f4 */
      --google-blue-500: rgb(var(--google-blue-500-rgb));
      --google-blue-700-rgb: 51, 103, 214;  /* #3367d6 */
      --google-blue-700: rgb(var(--google-blue-700-rgb));

      --google-green-100-rgb: 183, 225, 205;  /* #b7e1cd */
      --google-green-100: rgb(var(--google-green-100-rgb));
      --google-green-300-rgb: 87, 187, 138;  /* #57bb8a */
      --google-green-300: rgb(var(--google-green-300-rgb));
      --google-green-500-rgb: 15, 157, 88;  /* #0f9d58 */
      --google-green-500: rgb(var(--google-green-500-rgb));
      --google-green-700-rgb: 11, 128, 67;  /* #0b8043 */
      --google-green-700: rgb(var(--google-green-700-rgb));

      --google-yellow-100-rgb: 252, 232, 178;  /* #fce8b2 */
      --google-yellow-100: rgb(var(--google-yellow-100-rgb));
      --google-yellow-300-rgb: 247, 203, 77;  /* #f7cb4d */
      --google-yellow-300: rgb(var(--google-yellow-300-rgb));
      --google-yellow-500-rgb: 244, 180, 0;  /* #f4b400 */
      --google-yellow-500: rgb(var(--google-yellow-500-rgb));
      --google-yellow-700-rgb: 240, 147, 0;  /* #f09300 */
      --google-yellow-700: rgb(var(--google-yellow-700-rgb));

      --google-grey-100-rgb: 245, 245, 245;  /* #f5f5f5 */
      --google-grey-100: rgb(var(--google-grey-100-rgb));
      --google-grey-300-rgb: 224, 224, 224;  /* #e0e0e0 */
      --google-grey-300: rgb(var(--google-grey-300-rgb));
      --google-grey-500-rgb: 158, 158, 158;  /* #9e9e9e */
      --google-grey-500: rgb(var(--google-grey-500-rgb));
      --google-grey-700-rgb: 97, 97, 97;  /* #616161 */
      --google-grey-700: rgb(var(--google-grey-700-rgb));

      /* Material Design color palette from online spec document */

      --paper-red-50: #ffebee;
      --paper-red-100: #ffcdd2;
      --paper-red-200: #ef9a9a;
      --paper-red-300: #e57373;
      --paper-red-400: #ef5350;
      --paper-red-500: #f44336;
      --paper-red-600: #e53935;
      --paper-red-700: #d32f2f;
      --paper-red-800: #c62828;
      --paper-red-900: #b71c1c;
      --paper-red-a100: #ff8a80;
      --paper-red-a200: #ff5252;
      --paper-red-a400: #ff1744;
      --paper-red-a700: #d50000;

      --paper-light-blue-50: #e1f5fe;
      --paper-light-blue-100: #b3e5fc;
      --paper-light-blue-200: #81d4fa;
      --paper-light-blue-300: #4fc3f7;
      --paper-light-blue-400: #29b6f6;
      --paper-light-blue-500: #03a9f4;
      --paper-light-blue-600: #039be5;
      --paper-light-blue-700: #0288d1;
      --paper-light-blue-800: #0277bd;
      --paper-light-blue-900: #01579b;
      --paper-light-blue-a100: #80d8ff;
      --paper-light-blue-a200: #40c4ff;
      --paper-light-blue-a400: #00b0ff;
      --paper-light-blue-a700: #0091ea;

      --paper-yellow-50: #fffde7;
      --paper-yellow-100: #fff9c4;
      --paper-yellow-200: #fff59d;
      --paper-yellow-300: #fff176;
      --paper-yellow-400: #ffee58;
      --paper-yellow-500: #ffeb3b;
      --paper-yellow-600: #fdd835;
      --paper-yellow-700: #fbc02d;
      --paper-yellow-800: #f9a825;
      --paper-yellow-900: #f57f17;
      --paper-yellow-a100: #ffff8d;
      --paper-yellow-a200: #ffff00;
      --paper-yellow-a400: #ffea00;
      --paper-yellow-a700: #ffd600;

      --paper-orange-50: #fff3e0;
      --paper-orange-100: #ffe0b2;
      --paper-orange-200: #ffcc80;
      --paper-orange-300: #ffb74d;
      --paper-orange-400: #ffa726;
      --paper-orange-500: #ff9800;
      --paper-orange-600: #fb8c00;
      --paper-orange-700: #f57c00;
      --paper-orange-800: #ef6c00;
      --paper-orange-900: #e65100;
      --paper-orange-a100: #ffd180;
      --paper-orange-a200: #ffab40;
      --paper-orange-a400: #ff9100;
      --paper-orange-a700: #ff6500;

      --paper-grey-50: #fafafa;
      --paper-grey-100: #f5f5f5;
      --paper-grey-200: #eeeeee;
      --paper-grey-300: #e0e0e0;
      --paper-grey-400: #bdbdbd;
      --paper-grey-500: #9e9e9e;
      --paper-grey-600: #757575;
      --paper-grey-700: #616161;
      --paper-grey-800: #424242;
      --paper-grey-900: #212121;

      --paper-blue-grey-50: #eceff1;
      --paper-blue-grey-100: #cfd8dc;
      --paper-blue-grey-200: #b0bec5;
      --paper-blue-grey-300: #90a4ae;
      --paper-blue-grey-400: #78909c;
      --paper-blue-grey-500: #607d8b;
      --paper-blue-grey-600: #546e7a;
      --paper-blue-grey-700: #455a64;
      --paper-blue-grey-800: #37474f;
      --paper-blue-grey-900: #263238;

      /* opacity for dark text on a light background */
      --dark-divider-opacity: 0.12;
      --dark-disabled-opacity: 0.38; /* or hint text or icon */
      --dark-secondary-opacity: 0.54;
      --dark-primary-opacity: 0.87;

      /* opacity for light text on a dark background */
      --light-divider-opacity: 0.12;
      --light-disabled-opacity: 0.3; /* or hint text or icon */
      --light-secondary-opacity: 0.7;
      --light-primary-opacity: 1.0;

    }

  </style>
</custom-style>
`;
template$3.setAttribute("style", "display: none;");
document.head.appendChild(template$3.content);
const template$2 = html`
<custom-style>
  <style>
html{--google-blue-50-rgb:232,240,254;--google-blue-50:rgb(var(--google-blue-50-rgb));--google-blue-100-rgb:210,227,252;--google-blue-100:rgb(var(--google-blue-100-rgb));--google-blue-200-rgb:174,203,250;--google-blue-200:rgb(var(--google-blue-200-rgb));--google-blue-300-rgb:138,180,248;--google-blue-300:rgb(var(--google-blue-300-rgb));--google-blue-400-rgb:102,157,246;--google-blue-400:rgb(var(--google-blue-400-rgb));--google-blue-500-rgb:66,133,244;--google-blue-500:rgb(var(--google-blue-500-rgb));--google-blue-600-rgb:26,115,232;--google-blue-600:rgb(var(--google-blue-600-rgb));--google-blue-700-rgb:25,103,210;--google-blue-700:rgb(var(--google-blue-700-rgb));--google-blue-800-rgb:24,90,188;--google-blue-800:rgb(var(--google-blue-800-rgb));--google-blue-900-rgb:23,78,166;--google-blue-900:rgb(var(--google-blue-900-rgb));--google-green-50-rgb:230,244,234;--google-green-50:rgb(var(--google-green-50-rgb));--google-green-200-rgb:168,218,181;--google-green-200:rgb(var(--google-green-200-rgb));--google-green-300-rgb:129,201,149;--google-green-300:rgb(var(--google-green-300-rgb));--google-green-400-rgb:91,185,116;--google-green-400:rgb(var(--google-green-400-rgb));--google-green-500-rgb:52,168,83;--google-green-500:rgb(var(--google-green-500-rgb));--google-green-600-rgb:30,142,62;--google-green-600:rgb(var(--google-green-600-rgb));--google-green-700-rgb:24,128,56;--google-green-700:rgb(var(--google-green-700-rgb));--google-green-800-rgb:19,115,51;--google-green-800:rgb(var(--google-green-800-rgb));--google-green-900-rgb:13,101,45;--google-green-900:rgb(var(--google-green-900-rgb));--google-grey-50-rgb:248,249,250;--google-grey-50:rgb(var(--google-grey-50-rgb));--google-grey-100-rgb:241,243,244;--google-grey-100:rgb(var(--google-grey-100-rgb));--google-grey-200-rgb:232,234,237;--google-grey-200:rgb(var(--google-grey-200-rgb));--google-grey-300-rgb:218,220,224;--google-grey-300:rgb(var(--google-grey-300-rgb));--google-grey-400-rgb:189,193,198;--google-grey-400:rgb(var(--google-grey-400-rgb));--google-grey-500-rgb:154,160,166;--google-grey-500:rgb(var(--google-grey-500-rgb));--google-grey-600-rgb:128,134,139;--google-grey-600:rgb(var(--google-grey-600-rgb));--google-grey-700-rgb:95,99,104;--google-grey-700:rgb(var(--google-grey-700-rgb));--google-grey-800-rgb:60,64,67;--google-grey-800:rgb(var(--google-grey-800-rgb));--google-grey-900-rgb:32,33,36;--google-grey-900:rgb(var(--google-grey-900-rgb));--google-grey-900-white-4-percent:#292a2d;--google-purple-200-rgb:215,174,251;--google-purple-200:rgb(var(--google-purple-200-rgb));--google-purple-900-rgb:104,29,168;--google-purple-900:rgb(var(--google-purple-900-rgb));--google-red-300-rgb:242,139,130;--google-red-300:rgb(var(--google-red-300-rgb));--google-red-500-rgb:234,67,53;--google-red-500:rgb(var(--google-red-500-rgb));--google-red-600-rgb:217,48,37;--google-red-600:rgb(var(--google-red-600-rgb));--google-yellow-50-rgb:254,247,224;--google-yellow-50:rgb(var(--google-yellow-50-rgb));--google-yellow-100-rgb:254,239,195;--google-yellow-100:rgb(var(--google-yellow-100-rgb));--google-yellow-200-rgb:253,226,147;--google-yellow-200:rgb(var(--google-yellow-200-rgb));--google-yellow-300-rgb:253,214,51;--google-yellow-300:rgb(var(--google-yellow-300-rgb));--google-yellow-400-rgb:252,201,52;--google-yellow-400:rgb(var(--google-yellow-400-rgb));--google-yellow-500-rgb:251,188,4;--google-yellow-500:rgb(var(--google-yellow-500-rgb));--cr-primary-text-color:var(--google-grey-900);--cr-secondary-text-color:var(--google-grey-700);--cr-card-background-color:white;--cr-shadow-color:var(--google-grey-800);--cr-shadow-key-color_:color-mix(in srgb, var(--cr-shadow-color) 30%, transparent);--cr-shadow-ambient-color_:color-mix(in srgb, var(--cr-shadow-color) 15%, transparent);--cr-elevation-1:var(--cr-shadow-key-color_) 0 1px 2px 0,var(--cr-shadow-ambient-color_) 0 1px 3px 1px;--cr-elevation-2:var(--cr-shadow-key-color_) 0 1px 2px 0,var(--cr-shadow-ambient-color_) 0 2px 6px 2px;--cr-elevation-3:var(--cr-shadow-key-color_) 0 1px 3px 0,var(--cr-shadow-ambient-color_) 0 4px 8px 3px;--cr-elevation-4:var(--cr-shadow-key-color_) 0 2px 3px 0,var(--cr-shadow-ambient-color_) 0 6px 10px 4px;--cr-elevation-5:var(--cr-shadow-key-color_) 0 4px 4px 0,var(--cr-shadow-ambient-color_) 0 8px 12px 6px;--cr-card-shadow:var(--cr-elevation-2);--cr-checked-color:var(--google-blue-600);--cr-focused-item-color:var(--google-grey-300);--cr-form-field-label-color:var(--google-grey-700);--cr-hairline-rgb:0,0,0;--cr-iph-anchor-highlight-color:rgba(var(--google-blue-600-rgb), 0.1);--cr-link-color:var(--google-blue-700);--cr-menu-background-color:white;--cr-menu-background-focus-color:var(--google-grey-400);--cr-menu-shadow:0 2px 6px var(--paper-grey-500);--cr-separator-color:rgba(0, 0, 0, .06);--cr-title-text-color:rgb(90, 90, 90);--cr-toolbar-background-color:white;--cr-hover-background-color:rgba(var(--google-grey-900-rgb), .1);--cr-active-background-color:rgba(var(--google-grey-900-rgb), .16);--cr-focus-outline-color:rgba(var(--google-blue-600-rgb), .4)}@media (prefers-color-scheme:dark){html{--cr-primary-text-color:var(--google-grey-200);--cr-secondary-text-color:var(--google-grey-500);--cr-card-background-color:var(--google-grey-900-white-4-percent);--cr-card-shadow-color-rgb:0,0,0;--cr-checked-color:var(--google-blue-300);--cr-focused-item-color:var(--google-grey-800);--cr-form-field-label-color:var(--dark-secondary-color);--cr-hairline-rgb:255,255,255;--cr-iph-anchor-highlight-color:rgba(var(--google-grey-100-rgb), 0.1);--cr-link-color:var(--google-blue-300);--cr-menu-background-color:var(--google-grey-900);--cr-menu-background-focus-color:var(--google-grey-700);--cr-menu-background-sheen:rgba(255, 255, 255, .06);--cr-menu-shadow:rgba(0, 0, 0, .3) 0 1px 2px 0,rgba(0, 0, 0, .15) 0 3px 6px 2px;--cr-separator-color:rgba(255, 255, 255, .1);--cr-title-text-color:var(--cr-primary-text-color);--cr-toolbar-background-color:var(--google-grey-900-white-4-percent);--cr-hover-background-color:rgba(255, 255, 255, .1);--cr-active-background-color:rgba(var(--google-grey-200-rgb), .16);--cr-focus-outline-color:rgba(var(--google-blue-300-rgb), .4)}}@media (forced-colors:active){html{--cr-focus-outline-hcm:2px solid transparent;--cr-border-hcm:2px solid transparent}}html{--cr-button-edge-spacing:12px;--cr-button-height:32px;--cr-controlled-by-spacing:24px;--cr-default-input-max-width:264px;--cr-icon-ripple-size:36px;--cr-icon-ripple-padding:8px;--cr-icon-size:20px;--cr-icon-button-margin-start:16px;--cr-icon-ripple-margin:calc(var(--cr-icon-ripple-padding) * -1);--cr-section-min-height:48px;--cr-section-two-line-min-height:64px;--cr-section-padding:20px;--cr-section-vertical-padding:12px;--cr-section-indent-width:40px;--cr-section-indent-padding:calc(
      var(--cr-section-padding) + var(--cr-section-indent-width));--cr-section-vertical-margin:21px;--cr-centered-card-max-width:680px;--cr-centered-card-width-percentage:0.96;--cr-hairline:1px solid rgba(var(--cr-hairline-rgb), .14);--cr-separator-height:1px;--cr-separator-line:var(--cr-separator-height) solid var(--cr-separator-color);--cr-toolbar-overlay-animation-duration:150ms;--cr-toolbar-height:56px;--cr-container-shadow-height:6px;--cr-container-shadow-margin:calc(-1 * var(--cr-container-shadow-height));--cr-container-shadow-max-opacity:1;--cr-card-border-radius:8px;--cr-disabled-opacity:.38;--cr-form-field-bottom-spacing:16px;--cr-form-field-label-font-size:.625rem;--cr-form-field-label-height:1em;--cr-form-field-label-line-height:1}html[chrome-refresh-2023]{--cr-fallback-color-outline:rgb(116, 119, 117);--cr-fallback-color-primary:rgb(11, 87, 208);--cr-fallback-color-on-primary:rgb(255, 255, 255);--cr-fallback-color-primary-container:rgb(211, 227, 253);--cr-fallback-color-on-primary-container:rgb(4, 30, 73);--cr-fallback-color-secondary-container:rgb(194, 231, 255);--cr-fallback-color-on-secondary-container:rgb(0, 29, 53);--cr-fallback-color-neutral-container:rgb(242, 242, 242);--cr-fallback-color-neutral-outline:rgb(199, 199, 199);--cr-fallback-color-surface:rgb(255, 255, 255);--cr-fallback-color-on-surface-rgb:31,31,31;--cr-fallback-color-on-surface:rgb(var(--cr-fallback-color-on-surface-rgb));--cr-fallback-color-surface-variant:rgb(225, 227, 225);--cr-fallback-color-on-surface-variant:rgb(68, 71, 70);--cr-fallback-color-on-surface-subtle:rgb(71, 71, 71);--cr-fallback-color-inverse-primary:rgb(168, 199, 250);--cr-fallback-color-inverse-surface:rgb(48, 48, 48);--cr-fallback-color-inverse-on-surface:rgb(242, 242, 242);--cr-fallback-color-tonal-container:rgb(211, 227, 253);--cr-fallback-color-on-tonal-container:rgb(4, 30, 73);--cr-fallback-color-tonal-outline:rgb(168, 199, 250);--cr-fallback-color-error:rgb(179, 38, 30);--cr-fallback-color-divider:rgb(211, 227, 253);--cr-fallback-color-state-hover-on-prominent_:rgba(253, 252, 251, .1);--cr-fallback-color-state-on-subtle-rgb_:31,31,31;--cr-fallback-color-state-hover-on-subtle_:rgba(
      var(--cr-fallback-color-state-on-subtle-rgb_), .06);--cr-fallback-color-state-ripple-neutral-on-subtle_:rgba(
      var(--cr-fallback-color-state-on-subtle-rgb_), .08);--cr-fallback-color-state-ripple-primary-rgb_:124,172,248;--cr-fallback-color-state-ripple-primary_:rgba(
      var(--cr-fallback-color-state-ripple-primary-rgb_), 0.32);--cr-fallback-color-base-container:rgba(105, 145, 214, .12);--cr-fallback-color-disabled-background:rgba(
      var(--cr-fallback-color-on-surface-rgb), .12);--cr-fallback-color-disabled-foreground:rgba(
      var(--cr-fallback-color-on-surface-rgb), var(--cr-disabled-opacity));--cr-hover-background-color:var(--color-sys-state-hover,
      rgba(var(--cr-fallback-color-on-surface-rgb), .08));--cr-hover-on-prominent-background-color:var(
      --color-sys-state-hover-on-prominent,
      var(--cr-fallback-color-state-hover-on-prominent_));--cr-hover-on-subtle-background-color:var(
      --color-sys-state-hover-on-subtle,
      var(--cr-fallback-color-state-hover-on-subtle_));--cr-active-background-color:var(--color-sys-state-pressed,
      rgba(var(--cr-fallback-color-on-surface-rgb), .12));--cr-active-on-primary-background-color:var(
      --color-sys-state-ripple-primary,
      var(--cr-fallback-color-state-ripple-primary_));--cr-active-neutral-on-subtle-background-color:var(
      --color-sys-state-ripple-neutral-on-subtle,
      var(--cr-fallback-color-state-ripple-neutral-on-subtle_));--cr-focus-outline-color:var(--color-sys-state-focus-ring,
      var(--cr-fallback-color-primary));--cr-primary-text-color:var(--color-primary-foreground,
      var(--cr-fallback-color-on-surface));--cr-secondary-text-color:var(--color-secondary-foreground,
      var(--cr-fallback-color-on-surface-variant));--cr-link-color:var(--color-link-foreground-default,
      var(--cr-fallback-color-primary));--cr-button-height:36px;--cr-shadow-color:var(--color-sys-shadow, rgb(0, 0, 0))}@media (prefers-color-scheme:dark){html[chrome-refresh-2023]{--cr-fallback-color-outline:rgb(142, 145, 143);--cr-fallback-color-primary:rgb(168, 199, 250);--cr-fallback-color-on-primary:rgb(6, 46, 111);--cr-fallback-color-primary-container:rgb(8, 66, 160);--cr-fallback-color-on-primary-container:rgb(211, 227, 253);--cr-fallback-color-secondary-container:rgb(0, 74, 119);--cr-fallback-color-on-secondary-container:rgb(194, 231, 255);--cr-fallback-color-neutral-container:rgb(42, 42, 42);--cr-fallback-color-neutral-outline:rgb(117, 117, 117);--cr-fallback-color-surface:rgb(26, 27, 30);--cr-fallback-color-on-surface-rgb:227,227,227;--cr-fallback-color-surface-variant:rgb(68, 71, 70);--cr-fallback-color-on-surface-variant:rgb(196, 199, 197);--cr-fallback-color-on-surface-subtle:rgb(199, 199, 199);--cr-fallback-color-inverse-primary:rgb(11, 87, 208);--cr-fallback-color-inverse-surface:rgb(227, 227, 227);--cr-fallback-color-inverse-on-surface:rgb(31, 31, 31);--cr-fallback-color-tonal-container:rgb(0, 74, 119);--cr-fallback-color-on-tonal-container:rgb(194, 231, 255);--cr-fallback-color-tonal-outline:rgb(0, 99, 155);--cr-fallback-color-error:rgb(242, 184, 181);--cr-fallback-color-divider:rgb(71, 71, 71);--cr-fallback-color-state-hover-on-prominent_:rgba(31, 31, 31, .06);--cr-fallback-color-state-on-subtle-rgb_:253,252,251;--cr-fallback-color-state-hover-on-subtle_:rgba(
        var(--cr-fallback-color-state-on-subtle-rgb_), .10);--cr-fallback-color-state-ripple-neutral-on-subtle_:rgba(
        var(--cr-fallback-color-state-on-subtle-rgb_), .16);--cr-fallback-color-state-ripple-primary-rgb_:76,141,246;--cr-fallback-color-base-container:rgba(40, 40, 40, 1)}}@media (forced-colors:active){html[chrome-refresh-2023]{--cr-fallback-color-disabled-background:Canvas;--cr-fallback-color-disabled-foreground:GrayText}}
  </style>
</custom-style>
`;
document.head.appendChild(template$2.content);
const styleMod$3 = document.createElement("dom-module");
styleMod$3.appendChild(html`
  <template>
    <style>
:host([hidden]),[hidden]{display:none!important}
    </style>
  </template>
`.content);
styleMod$3.register("cr-hidden-style");
const styleMod$2 = document.createElement("dom-module");
styleMod$2.appendChild(html`
  <template>
    <style>
.icon-arrow-back{--cr-icon-image:url(chrome://resources/images/icon_arrow_back.svg)}.icon-arrow-dropdown{--cr-icon-image:url(chrome://resources/images/icon_arrow_dropdown.svg)}.icon-cancel{--cr-icon-image:url(chrome://resources/images/icon_cancel.svg)}.icon-clear{--cr-icon-image:url(chrome://resources/images/icon_clear.svg)}.icon-copy-content{--cr-icon-image:url(chrome://resources/images/icon_copy_content.svg)}.icon-delete-gray{--cr-icon-image:url(chrome://resources/images/icon_delete_gray.svg)}.icon-edit{--cr-icon-image:url(chrome://resources/images/icon_edit.svg)}.icon-file{--cr-icon-image:url(chrome://resources/images/icon_filetype_generic.svg)}.icon-folder-open{--cr-icon-image:url(chrome://resources/images/icon_folder_open.svg)}.icon-picture-delete{--cr-icon-image:url(chrome://resources/images/icon_picture_delete.svg)}.icon-expand-less{--cr-icon-image:url(chrome://resources/images/icon_expand_less.svg)}.icon-expand-more{--cr-icon-image:url(chrome://resources/images/icon_expand_more.svg)}.icon-external{--cr-icon-image:url(chrome://resources/images/open_in_new.svg)}.icon-more-vert{--cr-icon-image:url(chrome://resources/images/icon_more_vert.svg)}.icon-refresh{--cr-icon-image:url(chrome://resources/images/icon_refresh.svg)}.icon-search{--cr-icon-image:url(chrome://resources/images/icon_search.svg)}.icon-settings{--cr-icon-image:url(chrome://resources/images/icon_settings.svg)}.icon-visibility{--cr-icon-image:url(chrome://resources/images/icon_visibility.svg)}.icon-visibility-off{--cr-icon-image:url(chrome://resources/images/icon_visibility_off.svg)}.subpage-arrow{--cr-icon-image:url(chrome://resources/images/arrow_right.svg)}.cr-icon{-webkit-mask-image:var(--cr-icon-image);-webkit-mask-position:center;-webkit-mask-repeat:no-repeat;-webkit-mask-size:var(--cr-icon-size);background-color:var(--cr-icon-color,var(--google-grey-700));flex-shrink:0;height:var(--cr-icon-ripple-size);margin-inline-end:var(--cr-icon-ripple-margin);margin-inline-start:var(--cr-icon-button-margin-start);user-select:none;width:var(--cr-icon-ripple-size)}:host-context([dir=rtl]) .cr-icon{transform:scaleX(-1)}.cr-icon.no-overlap{margin-inline-end:0;margin-inline-start:0}@media (prefers-color-scheme:dark){.cr-icon{background-color:var(--cr-icon-color,var(--google-grey-500))}}
    </style>
  </template>
`.content);
styleMod$2.register("cr-icons");
const styleMod$1 = document.createElement("dom-module");
styleMod$1.appendChild(html`
  <template>
    <style include="cr-hidden-style cr-icons">
:host,html{--scrollable-border-color:var(--google-grey-300)}@media (prefers-color-scheme:dark){:host,html{--scrollable-border-color:var(--google-grey-700)}}[actionable]{cursor:pointer}.hr{border-top:var(--cr-separator-line)}iron-list.cr-separators>:not([first]){border-top:var(--cr-separator-line)}[scrollable]{border-color:transparent;border-style:solid;border-width:1px 0;overflow-y:auto}[scrollable].is-scrolled{border-top-color:var(--scrollable-border-color)}[scrollable].can-scroll:not(.scrolled-to-bottom){border-bottom-color:var(--scrollable-border-color)}[scrollable] iron-list>:not(.no-outline):focus,[selectable]:focus,[selectable]>:focus{background-color:var(--cr-focused-item-color);outline:0}.scroll-container{display:flex;flex-direction:column;min-height:1px}[selectable]>*{cursor:pointer}.cr-centered-card-container{box-sizing:border-box;display:block;height:inherit;margin:0 auto;max-width:var(--cr-centered-card-max-width);min-width:550px;position:relative;width:calc(100% * var(--cr-centered-card-width-percentage))}.cr-container-shadow{box-shadow:inset 0 5px 6px -3px rgba(0,0,0,.4);height:var(--cr-container-shadow-height);left:0;margin:0 0 var(--cr-container-shadow-margin);opacity:0;pointer-events:none;position:relative;right:0;top:0;transition:opacity .5s;z-index:1}#cr-container-shadow-bottom{margin-bottom:0;margin-top:var(--cr-container-shadow-margin);transform:scaleY(-1)}#cr-container-shadow-bottom.has-shadow,#cr-container-shadow-top.has-shadow{opacity:var(--cr-container-shadow-max-opacity)}.cr-row{align-items:center;border-top:var(--cr-separator-line);display:flex;min-height:var(--cr-section-min-height);padding:0 var(--cr-section-padding)}.cr-row.continuation,.cr-row.first{border-top:none}.cr-row-gap{padding-inline-start:16px}.cr-button-gap{margin-inline-start:8px}paper-tooltip::part(tooltip){border-radius:var(--paper-tooltip-border-radius,2px);font-size:92.31%;font-weight:500;max-width:330px;min-width:var(--paper-tooltip-min-width,200px);padding:var(--paper-tooltip-padding,10px 8px)}.cr-padded-text{padding-block-end:var(--cr-section-vertical-padding);padding-block-start:var(--cr-section-vertical-padding)}.cr-title-text{color:var(--cr-title-text-color);font-size:107.6923%;font-weight:500}.cr-secondary-text{color:var(--cr-secondary-text-color);font-weight:400}.cr-form-field-label{color:var(--cr-form-field-label-color);display:block;font-size:var(--cr-form-field-label-font-size);font-weight:500;letter-spacing:.4px;line-height:var(--cr-form-field-label-line-height);margin-bottom:8px}.cr-vertical-tab{align-items:center;display:flex}.cr-vertical-tab::before{border-radius:0 3px 3px 0;content:'';display:block;flex-shrink:0;height:var(--cr-vertical-tab-height,100%);width:4px}.cr-vertical-tab.selected::before{background:var(--cr-vertical-tab-selected-color,var(--cr-checked-color))}:host-context([dir=rtl]) .cr-vertical-tab::before{transform:scaleX(-1)}.iph-anchor-highlight{background-color:var(--cr-iph-anchor-highlight-color)}
    </style>
  </template>
`.content);
styleMod$1.register("cr-shared-style");
// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
function assert(value, message) {
    if (value) {
        return
    }
    throw new Error("Assertion failed" + (message ? `: ${message}` : ""))
}
function assertInstanceof(value, type, message) {
    if (value instanceof type) {
        return
    }
    throw new Error(message || `Value ${value} is not of type ${type.name || typeof type}`)
}
function assertNotReached(message="Unreachable code hit") {
    assert(false, message)
}
// Copyright 2012 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
function sanitizeInnerHtmlInternal(rawString, opts) {
    opts = opts || {};
    const html = parseHtmlSubset(`<b>${rawString}</b>`, opts.tags, opts.attrs).firstElementChild;
    return html.innerHTML
}
let sanitizedPolicy = null;
function sanitizeInnerHtml(rawString, opts) {
    assert(window.trustedTypes);
    if (sanitizedPolicy === null) {
        sanitizedPolicy = window.trustedTypes.createPolicy("sanitize-inner-html", {
            createHTML: sanitizeInnerHtmlInternal,
            createScript: ()=>assertNotReached(),
            createScriptURL: ()=>assertNotReached()
        })
    }
    return sanitizedPolicy.createHTML(rawString, opts)
}
const allowAttribute = (_node,_value)=>true;
const allowedAttributes = new Map([["href", (node,value)=>node.tagName === "A" && (value.startsWith("chrome://") || value.startsWith("https://") || value === "#")], ["target", (node,value)=>node.tagName === "A" && value === "_blank"]]);
const allowedOptionalAttributes = new Map([["class", allowAttribute], ["id", allowAttribute], ["is", (_node,value)=>value === "action-link" || value === ""], ["role", (_node,value)=>value === "link"], ["src", (node,value)=>node.tagName === "IMG" && value.startsWith("chrome://")], ["tabindex", allowAttribute], ["aria-hidden", allowAttribute], ["aria-label", allowAttribute], ["aria-labelledby", allowAttribute]]);
const allowedTags = new Set(["A", "B", "I", "BR", "DIV", "EM", "KBD", "P", "PRE", "SPAN", "STRONG"]);
const allowedOptionalTags = new Set(["IMG", "LI", "UL"]);
let unsanitizedPolicy;
function mergeTags(optTags) {
    const clone = new Set(allowedTags);
    optTags.forEach((str=>{
        const tag = str.toUpperCase();
        if (allowedOptionalTags.has(tag)) {
            clone.add(tag)
        }
    }
    ));
    return clone
}
function mergeAttrs(optAttrs) {
    const clone = new Map(allowedAttributes);
    optAttrs.forEach((key=>{
        if (allowedOptionalAttributes.has(key)) {
            clone.set(key, allowedOptionalAttributes.get(key))
        }
    }
    ));
    return clone
}
function walk(n, f) {
    f(n);
    for (let i = 0; i < n.childNodes.length; i++) {
        walk(n.childNodes[i], f)
    }
}
function assertElement(tags, node) {
    if (!tags.has(node.tagName)) {
        throw Error(node.tagName + " is not supported")
    }
}
function assertAttribute(attrs, attrNode, node) {
    const n = attrNode.nodeName;
    const v = attrNode.nodeValue || "";
    if (!attrs.has(n) || !attrs.get(n)(node, v)) {
        throw Error(node.tagName + "[" + n + '="' + v + '"] is not supported')
    }
}
function parseHtmlSubset(s, extraTags, extraAttrs) {
    const tags = extraTags ? mergeTags(extraTags) : allowedTags;
    const attrs = extraAttrs ? mergeAttrs(extraAttrs) : allowedAttributes;
    const doc = document.implementation.createHTMLDocument("");
    const r = doc.createRange();
    r.selectNode(doc.body);
    if (window.trustedTypes) {
        if (!unsanitizedPolicy) {
            unsanitizedPolicy = window.trustedTypes.createPolicy("parse-html-subset", {
                createHTML: untrustedHTML=>untrustedHTML,
                createScript: ()=>assertNotReached(),
                createScriptURL: ()=>assertNotReached()
            })
        }
        s = unsanitizedPolicy.createHTML(s)
    }
    const df = r.createContextualFragment(s);
    walk(df, (function(node) {
        switch (node.nodeType) {
        case Node.ELEMENT_NODE:
            assertElement(tags, node);
            const nodeAttrs = node.attributes;
            for (let i = 0; i < nodeAttrs.length; ++i) {
                assertAttribute(attrs, nodeAttrs[i], node)
            }
            break;
        case Node.COMMENT_NODE:
        case Node.DOCUMENT_FRAGMENT_NODE:
        case Node.TEXT_NODE:
            break;
        default:
            throw Error("Node type " + node.nodeType + " is not supported")
        }
    }
    ));
    return df
}
/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
class IronMeta {
    constructor(options) {
        IronMeta[" "](options);
        this.type = options && options.type || "default";
        this.key = options && options.key;
        if (options && "value"in options) {
            this.value = options.value
        }
    }
    get value() {
        var type = this.type;
        var key = this.key;
        if (type && key) {
            return IronMeta.types[type] && IronMeta.types[type][key]
        }
    }
    set value(value) {
        var type = this.type;
        var key = this.key;
        if (type && key) {
            type = IronMeta.types[type] = IronMeta.types[type] || {};
            if (value == null) {
                delete type[key]
            } else {
                type[key] = value
            }
        }
    }
    get list() {
        var type = this.type;
        if (type) {
            var items = IronMeta.types[this.type];
            if (!items) {
                return []
            }
            return Object.keys(items).map((function(key) {
                return metaDatas[this.type][key]
            }
            ), this)
        }
    }
    byKey(key) {
        this.key = key;
        return this.value
    }
}
IronMeta[" "] = function() {}
;
IronMeta.types = {};
var metaDatas = IronMeta.types;
Polymer({
    is: "iron-meta",
    properties: {
        type: {
            type: String,
            value: "default"
        },
        key: {
            type: String
        },
        value: {
            type: String,
            notify: true
        },
        self: {
            type: Boolean,
            observer: "_selfChanged"
        },
        __meta: {
            type: Boolean,
            computed: "__computeMeta(type, key, value)"
        }
    },
    hostAttributes: {
        hidden: true
    },
    __computeMeta: function(type, key, value) {
        var meta = new IronMeta({
            type: type,
            key: key
        });
        if (value !== undefined && value !== meta.value) {
            meta.value = value
        } else if (this.value !== meta.value) {
            this.value = meta.value
        }
        return meta
    },
    get list() {
        return this.__meta && this.__meta.list
    },
    _selfChanged: function(self) {
        if (self) {
            this.value = this
        }
    },
    byKey: function(key) {
        return new IronMeta({
            type: this.type,
            key: key
        }).value
    }
});
/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
Polymer({
    _template: html`
    <style>
      :host {
        align-items: center;
        display: inline-flex;
        justify-content: center;
        position: relative;

        vertical-align: middle;

        fill: var(--iron-icon-fill-color, currentcolor);
        stroke: var(--iron-icon-stroke-color, none);

        width: var(--iron-icon-width, 24px);
        height: var(--iron-icon-height, 24px);
      }

      :host([hidden]) {
        display: none;
      }
    </style>
`,
    is: "iron-icon",
    properties: {
        icon: {
            type: String
        },
        theme: {
            type: String
        },
        src: {
            type: String
        },
        _meta: {
            value: Base.create("iron-meta", {
                type: "iconset"
            })
        }
    },
    observers: ["_updateIcon(_meta, isAttached)", "_updateIcon(theme, isAttached)", "_srcChanged(src, isAttached)", "_iconChanged(icon, isAttached)"],
    _DEFAULT_ICONSET: "icons",
    _iconChanged: function(icon) {
        var parts = (icon || "").split(":");
        this._iconName = parts.pop();
        this._iconsetName = parts.pop() || this._DEFAULT_ICONSET;
        this._updateIcon()
    },
    _srcChanged: function(src) {
        this._updateIcon()
    },
    _usesIconset: function() {
        return this.icon || !this.src
    },
    _updateIcon: function() {
        if (this._usesIconset()) {
            if (this._img && this._img.parentNode) {
                dom(this.root).removeChild(this._img)
            }
            if (this._iconName === "") {
                if (this._iconset) {
                    this._iconset.removeIcon(this)
                }
            } else if (this._iconsetName && this._meta) {
                this._iconset = this._meta.byKey(this._iconsetName);
                if (this._iconset) {
                    this._iconset.applyIcon(this, this._iconName, this.theme);
                    this.unlisten(window, "iron-iconset-added", "_updateIcon")
                } else {
                    this.listen(window, "iron-iconset-added", "_updateIcon")
                }
            }
        } else {
            if (this._iconset) {
                this._iconset.removeIcon(this)
            }
            if (!this._img) {
                this._img = document.createElement("img");
                this._img.style.width = "100%";
                this._img.style.height = "100%";
                this._img.draggable = false
            }
            this._img.src = this.src;
            dom(this.root).appendChild(this._img)
        }
    }
});
/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
var KEY_IDENTIFIER = {
    "U+0008": "backspace",
    "U+0009": "tab",
    "U+001B": "esc",
    "U+0020": "space",
    "U+007F": "del"
};
var KEY_CODE = {
    8: "backspace",
    9: "tab",
    13: "enter",
    27: "esc",
    33: "pageup",
    34: "pagedown",
    35: "end",
    36: "home",
    32: "space",
    37: "left",
    38: "up",
    39: "right",
    40: "down",
    46: "del",
    106: "*"
};
var MODIFIER_KEYS = {
    shift: "shiftKey",
    ctrl: "ctrlKey",
    alt: "altKey",
    meta: "metaKey"
};
var KEY_CHAR = /[a-z0-9*]/;
var IDENT_CHAR = /U\+/;
var ARROW_KEY = /^arrow/;
var SPACE_KEY = /^space(bar)?/;
var ESC_KEY = /^escape$/;
function transformKey(key, noSpecialChars) {
    var validKey = "";
    if (key) {
        var lKey = key.toLowerCase();
        if (lKey === " " || SPACE_KEY.test(lKey)) {
            validKey = "space"
        } else if (ESC_KEY.test(lKey)) {
            validKey = "esc"
        } else if (lKey.length == 1) {
            if (!noSpecialChars || KEY_CHAR.test(lKey)) {
                validKey = lKey
            }
        } else if (ARROW_KEY.test(lKey)) {
            validKey = lKey.replace("arrow", "")
        } else if (lKey == "multiply") {
            validKey = "*"
        } else {
            validKey = lKey
        }
    }
    return validKey
}
function transformKeyIdentifier(keyIdent) {
    var validKey = "";
    if (keyIdent) {
        if (keyIdent in KEY_IDENTIFIER) {
            validKey = KEY_IDENTIFIER[keyIdent]
        } else if (IDENT_CHAR.test(keyIdent)) {
            keyIdent = parseInt(keyIdent.replace("U+", "0x"), 16);
            validKey = String.fromCharCode(keyIdent).toLowerCase()
        } else {
            validKey = keyIdent.toLowerCase()
        }
    }
    return validKey
}
function transformKeyCode(keyCode) {
    var validKey = "";
    if (Number(keyCode)) {
        if (keyCode >= 65 && keyCode <= 90) {
            validKey = String.fromCharCode(32 + keyCode)
        } else if (keyCode >= 112 && keyCode <= 123) {
            validKey = "f" + (keyCode - 112 + 1)
        } else if (keyCode >= 48 && keyCode <= 57) {
            validKey = String(keyCode - 48)
        } else if (keyCode >= 96 && keyCode <= 105) {
            validKey = String(keyCode - 96)
        } else {
            validKey = KEY_CODE[keyCode]
        }
    }
    return validKey
}
function normalizedKeyForEvent(keyEvent, noSpecialChars) {
    if (keyEvent.key) {
        return transformKey(keyEvent.key, noSpecialChars)
    }
    if (keyEvent.detail && keyEvent.detail.key) {
        return transformKey(keyEvent.detail.key, noSpecialChars)
    }
    return transformKeyIdentifier(keyEvent.keyIdentifier) || transformKeyCode(keyEvent.keyCode) || ""
}
function keyComboMatchesEvent(keyCombo, event) {
    var keyEvent = normalizedKeyForEvent(event, keyCombo.hasModifiers);
    return keyEvent === keyCombo.key && (!keyCombo.hasModifiers || !!event.shiftKey === !!keyCombo.shiftKey && !!event.ctrlKey === !!keyCombo.ctrlKey && !!event.altKey === !!keyCombo.altKey && !!event.metaKey === !!keyCombo.metaKey)
}
function parseKeyComboString(keyComboString) {
    if (keyComboString.length === 1) {
        return {
            combo: keyComboString,
            key: keyComboString,
            event: "keydown"
        }
    }
    return keyComboString.split("+").reduce((function(parsedKeyCombo, keyComboPart) {
        var eventParts = keyComboPart.split(":");
        var keyName = eventParts[0];
        var event = eventParts[1];
        if (keyName in MODIFIER_KEYS) {
            parsedKeyCombo[MODIFIER_KEYS[keyName]] = true;
            parsedKeyCombo.hasModifiers = true
        } else {
            parsedKeyCombo.key = keyName;
            parsedKeyCombo.event = event || "keydown"
        }
        return parsedKeyCombo
    }
    ), {
        combo: keyComboString.split(":").shift()
    })
}
function parseEventString(eventString) {
    return eventString.trim().split(" ").map((function(keyComboString) {
        return parseKeyComboString(keyComboString)
    }
    ))
}
const IronA11yKeysBehavior = {
    properties: {
        keyEventTarget: {
            type: Object,
            value: function() {
                return this
            }
        },
        stopKeyboardEventPropagation: {
            type: Boolean,
            value: false
        },
        _boundKeyHandlers: {
            type: Array,
            value: function() {
                return []
            }
        },
        _imperativeKeyBindings: {
            type: Object,
            value: function() {
                return {}
            }
        }
    },
    observers: ["_resetKeyEventListeners(keyEventTarget, _boundKeyHandlers)"],
    keyBindings: {},
    registered: function() {
        this._prepKeyBindings()
    },
    attached: function() {
        this._listenKeyEventListeners()
    },
    detached: function() {
        this._unlistenKeyEventListeners()
    },
    addOwnKeyBinding: function(eventString, handlerName) {
        this._imperativeKeyBindings[eventString] = handlerName;
        this._prepKeyBindings();
        this._resetKeyEventListeners()
    },
    removeOwnKeyBindings: function() {
        this._imperativeKeyBindings = {};
        this._prepKeyBindings();
        this._resetKeyEventListeners()
    },
    keyboardEventMatchesKeys: function(event, eventString) {
        var keyCombos = parseEventString(eventString);
        for (var i = 0; i < keyCombos.length; ++i) {
            if (keyComboMatchesEvent(keyCombos[i], event)) {
                return true
            }
        }
        return false
    },
    _collectKeyBindings: function() {
        var keyBindings = this.behaviors.map((function(behavior) {
            return behavior.keyBindings
        }
        ));
        if (keyBindings.indexOf(this.keyBindings) === -1) {
            keyBindings.push(this.keyBindings)
        }
        return keyBindings
    },
    _prepKeyBindings: function() {
        this._keyBindings = {};
        this._collectKeyBindings().forEach((function(keyBindings) {
            for (var eventString in keyBindings) {
                this._addKeyBinding(eventString, keyBindings[eventString])
            }
        }
        ), this);
        for (var eventString in this._imperativeKeyBindings) {
            this._addKeyBinding(eventString, this._imperativeKeyBindings[eventString])
        }
        for (var eventName in this._keyBindings) {
            this._keyBindings[eventName].sort((function(kb1, kb2) {
                var b1 = kb1[0].hasModifiers;
                var b2 = kb2[0].hasModifiers;
                return b1 === b2 ? 0 : b1 ? -1 : 1
            }
            ))
        }
    },
    _addKeyBinding: function(eventString, handlerName) {
        parseEventString(eventString).forEach((function(keyCombo) {
            this._keyBindings[keyCombo.event] = this._keyBindings[keyCombo.event] || [];
            this._keyBindings[keyCombo.event].push([keyCombo, handlerName])
        }
        ), this)
    },
    _resetKeyEventListeners: function() {
        this._unlistenKeyEventListeners();
        if (this.isAttached) {
            this._listenKeyEventListeners()
        }
    },
    _listenKeyEventListeners: function() {
        if (!this.keyEventTarget) {
            return
        }
        Object.keys(this._keyBindings).forEach((function(eventName) {
            var keyBindings = this._keyBindings[eventName];
            var boundKeyHandler = this._onKeyBindingEvent.bind(this, keyBindings);
            this._boundKeyHandlers.push([this.keyEventTarget, eventName, boundKeyHandler]);
            this.keyEventTarget.addEventListener(eventName, boundKeyHandler)
        }
        ), this)
    },
    _unlistenKeyEventListeners: function() {
        var keyHandlerTuple;
        var keyEventTarget;
        var eventName;
        var boundKeyHandler;
        while (this._boundKeyHandlers.length) {
            keyHandlerTuple = this._boundKeyHandlers.pop();
            keyEventTarget = keyHandlerTuple[0];
            eventName = keyHandlerTuple[1];
            boundKeyHandler = keyHandlerTuple[2];
            keyEventTarget.removeEventListener(eventName, boundKeyHandler)
        }
    },
    _onKeyBindingEvent: function(keyBindings, event) {
        if (this.stopKeyboardEventPropagation) {
            event.stopPropagation()
        }
        if (event.defaultPrevented) {
            return
        }
        for (var i = 0; i < keyBindings.length; i++) {
            var keyCombo = keyBindings[i][0];
            var handlerName = keyBindings[i][1];
            if (keyComboMatchesEvent(keyCombo, event)) {
                this._triggerKeyHandler(keyCombo, handlerName, event);
                if (event.defaultPrevented) {
                    return
                }
            }
        }
    },
    _triggerKeyHandler: function(keyCombo, handlerName, keyboardEvent) {
        var detail = Object.create(keyCombo);
        detail.keyboardEvent = keyboardEvent;
        var event = new CustomEvent(keyCombo.event,{
            detail: detail,
            cancelable: true
        });
        this[handlerName].call(this, event);
        if (event.defaultPrevented) {
            keyboardEvent.preventDefault()
        }
    }
};
var MAX_RADIUS_PX = 300;
var MIN_DURATION_MS = 800;
var distance = function(x1, y1, x2, y2) {
    var xDelta = x1 - x2;
    var yDelta = y1 - y2;
    return Math.sqrt(xDelta * xDelta + yDelta * yDelta)
};
Polymer({
    _template: html`
    <style>
      :host {
        bottom: 0;
        display: block;
        left: 0;
        overflow: hidden;
        pointer-events: none;
        position: absolute;
        right: 0;
        top: 0;
        /* For rounded corners: http://jsbin.com/temexa/4. */
        transform: translate3d(0, 0, 0);
      }

      .ripple {
        background-color: currentcolor;
        left: 0;
        opacity: var(--paper-ripple-opacity, 0.25);
        pointer-events: none;
        position: absolute;
        will-change: height, transform, width;
      }

      .ripple,
      :host(.circle) {
        border-radius: 50%;
      }
    </style>
`,
    is: "paper-ripple",
    behaviors: [IronA11yKeysBehavior],
    properties: {
        center: {
            type: Boolean,
            value: false
        },
        holdDown: {
            type: Boolean,
            value: false,
            observer: "_holdDownChanged"
        },
        recenters: {
            type: Boolean,
            value: false
        },
        noink: {
            type: Boolean,
            value: false
        }
    },
    keyBindings: {
        "enter:keydown": "_onEnterKeydown",
        "space:keydown": "_onSpaceKeydown",
        "space:keyup": "_onSpaceKeyup"
    },
    created: function() {
        this.ripples = []
    },
    attached: function() {
        this.keyEventTarget = this.parentNode.nodeType == 11 ? dom(this).getOwnerRoot().host : this.parentNode;
        this.keyEventTarget = this.keyEventTarget;
        this.listen(this.keyEventTarget, "up", "uiUpAction");
        this.listen(this.keyEventTarget, "down", "uiDownAction")
    },
    detached: function() {
        this.unlisten(this.keyEventTarget, "up", "uiUpAction");
        this.unlisten(this.keyEventTarget, "down", "uiDownAction");
        this.keyEventTarget = null
    },
    simulatedRipple: function() {
        this.downAction();
        this.async(function() {
            this.upAction()
        }
        .bind(this), 1)
    },
    uiDownAction: function(e) {
        if (!this.noink)
            this.downAction(e)
    },
    downAction: function(e) {
        if (this.ripples.length && this.holdDown)
            return;
        this.debounce("show ripple", (function() {
            this.__showRipple(e)
        }
        ), 1)
    },
    clear: function() {
        this.__hideRipple();
        this.holdDown = false
    },
    showAndHoldDown: function() {
        this.ripples.forEach((ripple=>{
            ripple.remove()
        }
        ));
        this.ripples = [];
        this.holdDown = true
    },
    __showRipple: function(e) {
        var rect = this.getBoundingClientRect();
        var roundedCenterX = function() {
            return Math.round(rect.width / 2)
        };
        var roundedCenterY = function() {
            return Math.round(rect.height / 2)
        };
        var centered = !e || this.center;
        if (centered) {
            var x = roundedCenterX();
            var y = roundedCenterY()
        } else {
            var sourceEvent = e.detail.sourceEvent;
            var x = Math.round(sourceEvent.clientX - rect.left);
            var y = Math.round(sourceEvent.clientY - rect.top)
        }
        var corners = [{
            x: 0,
            y: 0
        }, {
            x: rect.width,
            y: 0
        }, {
            x: 0,
            y: rect.height
        }, {
            x: rect.width,
            y: rect.height
        }];
        var cornerDistances = corners.map((function(corner) {
            return Math.round(distance(x, y, corner.x, corner.y))
        }
        ));
        var radius = Math.min(MAX_RADIUS_PX, Math.max.apply(Math, cornerDistances));
        var startTranslate = x - radius + "px, " + (y - radius) + "px";
        if (this.recenters && !centered) {
            var endTranslate = roundedCenterX() - radius + "px, " + (roundedCenterY() - radius) + "px"
        } else {
            var endTranslate = startTranslate
        }
        var ripple = document.createElement("div");
        ripple.classList.add("ripple");
        ripple.style.height = ripple.style.width = 2 * radius + "px";
        this.ripples.push(ripple);
        this.shadowRoot.appendChild(ripple);
        ripple.animate({
            transform: ["translate(" + startTranslate + ") scale(0)", "translate(" + endTranslate + ") scale(1)"]
        }, {
            duration: Math.max(MIN_DURATION_MS, Math.log(radius) * radius) || 0,
            easing: "cubic-bezier(.2, .9, .1, .9)",
            fill: "forwards"
        })
    },
    uiUpAction: function(e) {
        if (!this.noink)
            this.upAction()
    },
    upAction: function(e) {
        if (!this.holdDown)
            this.debounce("hide ripple", (function() {
                this.__hideRipple()
            }
            ), 1)
    },
    __hideRipple: function() {
        Promise.all(this.ripples.map((function(ripple) {
            return new Promise((function(resolve) {
                var removeRipple = function() {
                    ripple.remove();
                    resolve()
                };
                var opacity = getComputedStyle(ripple).opacity;
                if (!opacity.length) {
                    removeRipple()
                } else {
                    var animation = ripple.animate({
                        opacity: [opacity, 0]
                    }, {
                        duration: 150,
                        fill: "forwards"
                    });
                    animation.addEventListener("finish", removeRipple);
                    animation.addEventListener("cancel", removeRipple)
                }
            }
            ))
        }
        ))).then(function() {
            this.fire("transitionend")
        }
        .bind(this));
        this.ripples = []
    },
    _onEnterKeydown: function() {
        this.uiDownAction();
        this.async(this.uiUpAction, 1)
    },
    _onSpaceKeydown: function() {
        this.uiDownAction()
    },
    _onSpaceKeyup: function() {
        this.uiUpAction()
    },
    _holdDownChanged: function(newHoldDown, oldHoldDown) {
        if (oldHoldDown === undefined)
            return;
        if (newHoldDown)
            this.downAction();
        else
            this.upAction()
    }
});
/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
const IronButtonStateImpl = {
    properties: {
        pressed: {
            type: Boolean,
            readOnly: true,
            value: false,
            reflectToAttribute: true,
            observer: "_pressedChanged"
        },
        toggles: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
        },
        active: {
            type: Boolean,
            value: false,
            notify: true,
            reflectToAttribute: true
        },
        pointerDown: {
            type: Boolean,
            readOnly: true,
            value: false
        },
        receivedFocusFromKeyboard: {
            type: Boolean,
            readOnly: true
        },
        ariaActiveAttribute: {
            type: String,
            value: "aria-pressed",
            observer: "_ariaActiveAttributeChanged"
        }
    },
    listeners: {
        down: "_downHandler",
        up: "_upHandler",
        tap: "_tapHandler"
    },
    observers: ["_focusChanged(focused)", "_activeChanged(active, ariaActiveAttribute)"],
    keyBindings: {
        "enter:keydown": "_asyncClick",
        "space:keydown": "_spaceKeyDownHandler",
        "space:keyup": "_spaceKeyUpHandler"
    },
    _mouseEventRe: /^mouse/,
    _tapHandler: function() {
        if (this.toggles) {
            this._userActivate(!this.active)
        } else {
            this.active = false
        }
    },
    _focusChanged: function(focused) {
        this._detectKeyboardFocus(focused);
        if (!focused) {
            this._setPressed(false)
        }
    },
    _detectKeyboardFocus: function(focused) {
        this._setReceivedFocusFromKeyboard(!this.pointerDown && focused)
    },
    _userActivate: function(active) {
        if (this.active !== active) {
            this.active = active;
            this.fire("change")
        }
    },
    _downHandler: function(event) {
        this._setPointerDown(true);
        this._setPressed(true);
        this._setReceivedFocusFromKeyboard(false)
    },
    _upHandler: function() {
        this._setPointerDown(false);
        this._setPressed(false)
    },
    _spaceKeyDownHandler: function(event) {
        var keyboardEvent = event.detail.keyboardEvent;
        var target = dom(keyboardEvent).localTarget;
        if (this.isLightDescendant(target))
            return;
        keyboardEvent.preventDefault();
        keyboardEvent.stopImmediatePropagation();
        this._setPressed(true)
    },
    _spaceKeyUpHandler: function(event) {
        var keyboardEvent = event.detail.keyboardEvent;
        var target = dom(keyboardEvent).localTarget;
        if (this.isLightDescendant(target))
            return;
        if (this.pressed) {
            this._asyncClick()
        }
        this._setPressed(false)
    },
    _asyncClick: function() {
        this.async((function() {
            this.click()
        }
        ), 1)
    },
    _pressedChanged: function(pressed) {
        this._changedButtonState()
    },
    _ariaActiveAttributeChanged: function(value, oldValue) {
        if (oldValue && oldValue != value && this.hasAttribute(oldValue)) {
            this.removeAttribute(oldValue)
        }
    },
    _activeChanged: function(active, ariaActiveAttribute) {
        if (this.toggles) {
            this.setAttribute(this.ariaActiveAttribute, active ? "true" : "false")
        } else {
            this.removeAttribute(this.ariaActiveAttribute)
        }
        this._changedButtonState()
    },
    _controlStateChanged: function() {
        if (this.disabled) {
            this._setPressed(false)
        } else {
            this._changedButtonState()
        }
    },
    _changedButtonState: function() {
        if (this._buttonStateChanged) {
            this._buttonStateChanged()
        }
    }
};
/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
const PaperRippleBehavior = {
    properties: {
        noink: {
            type: Boolean,
            observer: "_noinkChanged"
        },
        _rippleContainer: {
            type: Object
        }
    },
    _buttonStateChanged: function() {
        if (this.focused) {
            this.ensureRipple()
        }
    },
    _downHandler: function(event) {
        IronButtonStateImpl._downHandler.call(this, event);
        if (this.pressed) {
            this.ensureRipple(event)
        }
    },
    ensureRipple: function(optTriggeringEvent) {
        if (!this.hasRipple()) {
            this._ripple = this._createRipple();
            this._ripple.noink = this.noink;
            var rippleContainer = this._rippleContainer || this.root;
            if (rippleContainer) {
                dom(rippleContainer).appendChild(this._ripple)
            }
            if (optTriggeringEvent) {
                var domContainer = dom(this._rippleContainer || this);
                var target = dom(optTriggeringEvent).rootTarget;
                if (domContainer.deepContains(target)) {
                    this._ripple.uiDownAction(optTriggeringEvent)
                }
            }
        }
    },
    getRipple: function() {
        this.ensureRipple();
        return this._ripple
    },
    hasRipple: function() {
        return Boolean(this._ripple)
    },
    _createRipple: function() {
        var element = document.createElement("paper-ripple");
        return element
    },
    _noinkChanged: function(noink) {
        if (this.hasRipple()) {
            this._ripple.noink = noink
        }
    }
};
function getTemplate$6() {
    return html`<!--_html_template_start_-->    <style>:host{--cr-icon-button-fill-color:var(--google-grey-700);--cr-icon-button-icon-start-offset:0;--cr-icon-button-icon-size:20px;--cr-icon-button-size:36px;--cr-icon-button-height:var(--cr-icon-button-size);--cr-icon-button-transition:150ms ease-in-out;--cr-icon-button-width:var(--cr-icon-button-size);-webkit-tap-highlight-color:transparent;border-radius:50%;color:var(--cr-icon-button-stroke-color,var(--cr-icon-button-fill-color));cursor:pointer;display:inline-flex;flex-shrink:0;height:var(--cr-icon-button-height);margin-inline-end:var(--cr-icon-button-margin-end,var(--cr-icon-ripple-margin));margin-inline-start:var(--cr-icon-button-margin-start);outline:0;overflow:hidden;user-select:none;vertical-align:middle;width:var(--cr-icon-button-width)}:host-context([chrome-refresh-2023]):host{--cr-icon-button-fill-color:currentColor;--cr-icon-button-size:32px;position:relative}:host(:hover){background-color:var(--cr-icon-button-hover-background-color,var(--cr-hover-background-color))}:host(:focus-visible:focus){box-shadow:inset 0 0 0 2px var(--cr-icon-button-focus-outline-color,var(--cr-focus-outline-color))}@media (forced-colors:active){:host(:focus-visible:focus){outline:var(--cr-focus-outline-hcm)}}:host-context(html:not([chrome-refresh-2023])) :host(:active){background-color:var(--cr-icon-button-active-background-color,var(--cr-active-background-color))}paper-ripple{display:none}:host-context([chrome-refresh-2023]) paper-ripple{--paper-ripple-opacity:1;color:var(--cr-active-background-color);display:block}:host([disabled]){cursor:initial;opacity:var(--cr-disabled-opacity);pointer-events:none}:host(.no-overlap){--cr-icon-button-margin-end:0;--cr-icon-button-margin-start:0}:host-context([dir=rtl]):host(:not([dir=ltr]):not([multiple-icons_])){transform:scaleX(-1)}:host-context([dir=rtl]):host(:not([dir=ltr])[multiple-icons_]) iron-icon{transform:scaleX(-1)}:host(:not([iron-icon])) #maskedImage{-webkit-mask-image:var(--cr-icon-image);-webkit-mask-position:center;-webkit-mask-repeat:no-repeat;-webkit-mask-size:var(--cr-icon-button-icon-size);-webkit-transform:var(--cr-icon-image-transform,none);background-color:var(--cr-icon-button-fill-color);height:100%;transition:background-color var(--cr-icon-button-transition);width:100%}@media (forced-colors:active){:host(:not([iron-icon])) #maskedImage{background-color:ButtonText}}#icon{align-items:center;border-radius:4px;display:flex;height:100%;justify-content:center;padding-inline-start:var(--cr-icon-button-icon-start-offset);position:relative;width:100%}iron-icon{--iron-icon-fill-color:var(--cr-icon-button-fill-color);--iron-icon-stroke-color:var(--cr-icon-button-stroke-color, none);--iron-icon-height:var(--cr-icon-button-icon-size);--iron-icon-width:var(--cr-icon-button-icon-size);transition:fill var(--cr-icon-button-transition),stroke var(--cr-icon-button-transition)}@media (prefers-color-scheme:dark){:host{--cr-icon-button-fill-color:var(--google-grey-500)}}</style>
    <div id="icon">
      <div id="maskedImage"></div>
    </div>
<!--_html_template_end_-->`
}
// Copyright 2018 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const CrIconbuttonElementBase = mixinBehaviors([PaperRippleBehavior], PolymerElement);
class CrIconButtonElement extends CrIconbuttonElementBase {
    static get is() {
        return "cr-icon-button"
    }
    static get template() {
        return getTemplate$6()
    }
    static get properties() {
        return {
            disabled: {
                type: Boolean,
                value: false,
                reflectToAttribute: true,
                observer: "disabledChanged_"
            },
            customTabIndex: {
                type: Number,
                observer: "applyTabIndex_"
            },
            ironIcon: {
                type: String,
                observer: "onIronIconChanged_",
                reflectToAttribute: true
            },
            multipleIcons_: {
                type: Boolean,
                reflectToAttribute: true
            }
        }
    }
    constructor() {
        super();
        this.spaceKeyDown_ = false;
        this.addEventListener("blur", this.onBlur_.bind(this));
        this.addEventListener("click", this.onClick_.bind(this));
        this.addEventListener("keydown", this.onKeyDown_.bind(this));
        this.addEventListener("keyup", this.onKeyUp_.bind(this));
        if (document.documentElement.hasAttribute("chrome-refresh-2023")) {
            this.addEventListener("pointerdown", this.onPointerDown_.bind(this))
        }
    }
    ready() {
        super.ready();
        this.setAttribute("aria-disabled", this.disabled ? "true" : "false");
        if (!this.hasAttribute("role")) {
            this.setAttribute("role", "button")
        }
        if (!this.hasAttribute("tabindex")) {
            this.setAttribute("tabindex", "0")
        }
    }
    toggleClass(className) {
        this.classList.toggle(className)
    }
    disabledChanged_(newValue, oldValue) {
        if (!newValue && oldValue === undefined) {
            return
        }
        if (this.disabled) {
            this.blur()
        }
        this.setAttribute("aria-disabled", this.disabled ? "true" : "false");
        this.applyTabIndex_()
    }
    applyTabIndex_() {
        let value = this.customTabIndex;
        if (value === undefined) {
            value = this.disabled ? -1 : 0
        }
        this.setAttribute("tabindex", value.toString())
    }
    onBlur_() {
        this.spaceKeyDown_ = false
    }
    onClick_(e) {
        if (this.disabled) {
            e.stopImmediatePropagation()
        }
    }
    onIronIconChanged_() {
        this.shadowRoot.querySelectorAll("iron-icon").forEach((el=>el.remove()));
        if (!this.ironIcon) {
            return
        }
        const icons = (this.ironIcon || "").split(",");
        this.multipleIcons_ = icons.length > 1;
        icons.forEach((icon=>{
            const ironIcon = document.createElement("iron-icon");
            ironIcon.icon = icon;
            this.$.icon.appendChild(ironIcon);
            if (ironIcon.shadowRoot) {
                ironIcon.shadowRoot.querySelectorAll("svg, img").forEach((child=>child.setAttribute("role", "none")))
            }
        }
        ))
    }
    onKeyDown_(e) {
        if (e.key !== " " && e.key !== "Enter") {
            return
        }
        e.preventDefault();
        e.stopPropagation();
        if (e.repeat) {
            return
        }
        if (e.key === "Enter") {
            this.click()
        } else if (e.key === " ") {
            this.spaceKeyDown_ = true
        }
    }
    onKeyUp_(e) {
        if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation()
        }
        if (this.spaceKeyDown_ && e.key === " ") {
            this.spaceKeyDown_ = false;
            this.click()
        }
    }
    onPointerDown_() {
        this.ensureRipple()
    }
}
customElements.define(CrIconButtonElement.is, CrIconButtonElement);
// Copyright 2020 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const AUTO_SRC = "auto-src";
const CLEAR_SRC = "clear-src";
const IS_GOOGLE_PHOTOS = "is-google-photos";
const STATIC_ENCODE = "static-encode";
const ENCODE_TYPE = "encode-type";
class CrAutoImgElement extends HTMLImageElement {
    static get observedAttributes() {
        return [AUTO_SRC, IS_GOOGLE_PHOTOS, STATIC_ENCODE, ENCODE_TYPE]
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name !== AUTO_SRC && name !== IS_GOOGLE_PHOTOS && name !== STATIC_ENCODE && name !== ENCODE_TYPE) {
            return
        }
        if (name === IS_GOOGLE_PHOTOS && oldValue === null === (newValue === null)) {
            return
        }
        if (this.hasAttribute(CLEAR_SRC)) {
            this.removeAttribute("src")
        }
        let url = null;
        try {
            url = new URL(this.getAttribute(AUTO_SRC) || "")
        } catch (_) {}
        if (!url || url.protocol === "chrome-untrusted:") {
            this.removeAttribute("src");
            return
        }
        if (url.protocol === "data:" || url.protocol === "chrome:") {
            this.src = url.href;
            return
        }
        if (!this.hasAttribute(IS_GOOGLE_PHOTOS) && !this.hasAttribute(STATIC_ENCODE) && !this.hasAttribute(ENCODE_TYPE)) {
            this.src = "chrome://image?" + url.href;
            return
        }
        this.src = `chrome://image?url=${encodeURIComponent(url.href)}`;
        if (this.hasAttribute(IS_GOOGLE_PHOTOS)) {
            this.src += `&isGooglePhotos=true`
        }
        if (this.hasAttribute(STATIC_ENCODE)) {
            this.src += `&staticEncode=true`
        }
        if (this.hasAttribute(ENCODE_TYPE)) {
            this.src += `&encodeType=${this.getAttribute(ENCODE_TYPE)}`
        }
    }
    set autoSrc(src) {
        this.setAttribute(AUTO_SRC, src)
    }
    get autoSrc() {
        return this.getAttribute(AUTO_SRC) || ""
    }
    set clearSrc(_) {
        this.setAttribute(CLEAR_SRC, "")
    }
    get clearSrc() {
        return this.getAttribute(CLEAR_SRC) || ""
    }
    set isGooglePhotos(enabled) {
        if (enabled) {
            this.setAttribute(IS_GOOGLE_PHOTOS, "")
        } else {
            this.removeAttribute(IS_GOOGLE_PHOTOS)
        }
    }
    get isGooglePhotos() {
        return this.hasAttribute(IS_GOOGLE_PHOTOS)
    }
    set staticEncode(enabled) {
        if (enabled) {
            this.setAttribute(STATIC_ENCODE, "")
        } else {
            this.removeAttribute(STATIC_ENCODE)
        }
    }
    get staticEncode() {
        return this.hasAttribute(STATIC_ENCODE)
    }
    set encodeType(type) {
        if (type) {
            this.setAttribute(ENCODE_TYPE, type)
        } else {
            this.removeAttribute(ENCODE_TYPE)
        }
    }
    get encodeType() {
        return this.getAttribute(ENCODE_TYPE) || ""
    }
}
customElements.define("cr-auto-img", CrAutoImgElement, {
    extends: "img"
});
// Copyright 2020 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const CommandSpec = {
    $: mojo.internal.Enum()
};
var Command;
(function(Command) {
    Command[Command["MIN_VALUE"] = 0] = "MIN_VALUE";
    Command[Command["MAX_VALUE"] = 10] = "MAX_VALUE";
    Command[Command["kUnknownCommand"] = 0] = "kUnknownCommand";
    Command[Command["kOpenSafetyCheck"] = 1] = "kOpenSafetyCheck";
    Command[Command["kOpenSafeBrowsingEnhancedProtectionSettings"] = 2] = "kOpenSafeBrowsingEnhancedProtectionSettings";
    Command[Command["kOpenFeedbackForm"] = 3] = "kOpenFeedbackForm";
    Command[Command["kOpenPrivacyGuide"] = 4] = "kOpenPrivacyGuide";
    Command[Command["kStartTabGroupTutorial"] = 5] = "kStartTabGroupTutorial";
    Command[Command["kOpenPasswordManager"] = 6] = "kOpenPasswordManager";
    Command[Command["kNoOpCommand"] = 7] = "kNoOpCommand";
    Command[Command["kOpenPerformanceSettings"] = 8] = "kOpenPerformanceSettings";
    Command[Command["kOpenNTPAndStartCustomizeChromeTutorial"] = 9] = "kOpenNTPAndStartCustomizeChromeTutorial";
    Command[Command["kStartPasswordManagerTutorial"] = 10] = "kStartPasswordManagerTutorial"
}
)(Command || (Command = {}));
class CommandHandlerFactoryPendingReceiver {
    constructor(handle) {
        this.handle = mojo.internal.interfaceSupport.getEndpointForReceiver(handle)
    }
    bindInBrowser(scope="context") {
        mojo.internal.interfaceSupport.bind(this.handle, "browser_command.mojom.CommandHandlerFactory", scope)
    }
}
class CommandHandlerFactoryRemote {
    constructor(handle) {
        this.proxy = new mojo.internal.interfaceSupport.InterfaceRemoteBase(CommandHandlerFactoryPendingReceiver,handle);
        this.$ = new mojo.internal.interfaceSupport.InterfaceRemoteBaseWrapper(this.proxy);
        this.onConnectionError = this.proxy.getConnectionErrorEventRouter()
    }
    createBrowserCommandHandler(handler) {
        this.proxy.sendMessage(2018756530, CommandHandlerFactory_CreateBrowserCommandHandler_ParamsSpec.$, null, [handler])
    }
}
class CommandHandlerFactory {
    static get $interfaceName() {
        return "browser_command.mojom.CommandHandlerFactory"
    }
    static getRemote() {
        let remote = new CommandHandlerFactoryRemote;
        remote.$.bindNewPipeAndPassReceiver().bindInBrowser();
        return remote
    }
}
class CommandHandlerPendingReceiver {
    constructor(handle) {
        this.handle = mojo.internal.interfaceSupport.getEndpointForReceiver(handle)
    }
    bindInBrowser(scope="context") {
        mojo.internal.interfaceSupport.bind(this.handle, "browser_command.mojom.CommandHandler", scope)
    }
}
class CommandHandlerRemote {
    constructor(handle) {
        this.proxy = new mojo.internal.interfaceSupport.InterfaceRemoteBase(CommandHandlerPendingReceiver,handle);
        this.$ = new mojo.internal.interfaceSupport.InterfaceRemoteBaseWrapper(this.proxy);
        this.onConnectionError = this.proxy.getConnectionErrorEventRouter()
    }
    canExecuteCommand(commandId) {
        return this.proxy.sendMessage(1904782400, CommandHandler_CanExecuteCommand_ParamsSpec.$, CommandHandler_CanExecuteCommand_ResponseParamsSpec.$, [commandId])
    }
    executeCommand(commandId, clickInfo) {
        return this.proxy.sendMessage(15352997, CommandHandler_ExecuteCommand_ParamsSpec.$, CommandHandler_ExecuteCommand_ResponseParamsSpec.$, [commandId, clickInfo])
    }
}
const ClickInfoSpec = {
    $: {}
};
const CommandHandlerFactory_CreateBrowserCommandHandler_ParamsSpec = {
    $: {}
};
const CommandHandler_CanExecuteCommand_ParamsSpec = {
    $: {}
};
const CommandHandler_CanExecuteCommand_ResponseParamsSpec = {
    $: {}
};
const CommandHandler_ExecuteCommand_ParamsSpec = {
    $: {}
};
const CommandHandler_ExecuteCommand_ResponseParamsSpec = {
    $: {}
};
mojo.internal.Struct(ClickInfoSpec.$, "ClickInfo", [mojo.internal.StructField("middleButton", 0, 0, mojo.internal.Bool, false, false, 0), mojo.internal.StructField("altKey", 0, 1, mojo.internal.Bool, false, false, 0), mojo.internal.StructField("ctrlKey", 0, 2, mojo.internal.Bool, false, false, 0), mojo.internal.StructField("metaKey", 0, 3, mojo.internal.Bool, false, false, 0), mojo.internal.StructField("shiftKey", 0, 4, mojo.internal.Bool, false, false, 0)], [[0, 16]]);
mojo.internal.Struct(CommandHandlerFactory_CreateBrowserCommandHandler_ParamsSpec.$, "CommandHandlerFactory_CreateBrowserCommandHandler_Params", [mojo.internal.StructField("handler", 0, 0, mojo.internal.InterfaceRequest(CommandHandlerPendingReceiver), null, false, 0)], [[0, 16]]);
mojo.internal.Struct(CommandHandler_CanExecuteCommand_ParamsSpec.$, "CommandHandler_CanExecuteCommand_Params", [mojo.internal.StructField("commandId", 0, 0, CommandSpec.$, 0, false, 0)], [[0, 16]]);
mojo.internal.Struct(CommandHandler_CanExecuteCommand_ResponseParamsSpec.$, "CommandHandler_CanExecuteCommand_ResponseParams", [mojo.internal.StructField("canExecute", 0, 0, mojo.internal.Bool, false, false, 0)], [[0, 16]]);
mojo.internal.Struct(CommandHandler_ExecuteCommand_ParamsSpec.$, "CommandHandler_ExecuteCommand_Params", [mojo.internal.StructField("commandId", 0, 0, CommandSpec.$, 0, false, 0), mojo.internal.StructField("clickInfo", 8, 0, ClickInfoSpec.$, null, false, 0)], [[0, 24]]);
mojo.internal.Struct(CommandHandler_ExecuteCommand_ResponseParamsSpec.$, "CommandHandler_ExecuteCommand_ResponseParams", [mojo.internal.StructField("commandExecuted", 0, 0, mojo.internal.Bool, false, false, 0)], [[0, 16]]);
// Copyright 2020 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
let instance$3 = null;
class BrowserCommandProxy {
    static getInstance() {
        return instance$3 || (instance$3 = new BrowserCommandProxy)
    }
    static setInstance(newInstance) {
        instance$3 = newInstance
    }
    constructor() {
        this.handler = new CommandHandlerRemote;
        const factory = CommandHandlerFactory.getRemote();
        factory.createBrowserCommandHandler(this.handler.$.bindNewPipeAndPassReceiver())
    }
}
function getTemplate$5() {
    return html`<!--_html_template_start_--><style>:host(:not([hidden])){display:block}#iframe{border:none;border-radius:inherit;display:block;height:inherit;max-height:inherit;max-width:inherit;width:inherit}</style>
<iframe id="iframe" src="[[src_]]" allow="[[allow]]"></iframe>
<!--_html_template_end_-->`
}
// Copyright 2020 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
function createScrollBorders(container, topBorder, bottomBorder, showAttribute) {
    const topProbe = document.createElement("div");
    container.prepend(topProbe);
    const bottomProbe = document.createElement("div");
    container.append(bottomProbe);
    const observer = new IntersectionObserver((entries=>{
        entries.forEach((({target: target, intersectionRatio: intersectionRatio})=>{
            const show = intersectionRatio === 0;
            if (target === topProbe) {
                topBorder.toggleAttribute(showAttribute, show)
            } else if (target === bottomProbe) {
                bottomBorder.toggleAttribute(showAttribute, show)
            }
        }
        ))
    }
    ),{
        root: container
    });
    observer.observe(topProbe);
    observer.observe(bottomProbe);
    return observer
}
function decodeString16(str) {
    return str ? str.data.map((ch=>String.fromCodePoint(ch))).join("") : ""
}
function mojoString16(str) {
    const array = new Array(str.length);
    for (let i = 0; i < str.length; ++i) {
        array[i] = str.charCodeAt(i)
    }
    return {
        data: array
    }
}
function $$(element, selector) {
    return element.shadowRoot.querySelector(selector)
}
function strictQuery(root, selector, type) {
    const element = root.querySelector(selector);
    assert(element && element instanceof type);
    return element
}
// Copyright 2021 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
let instance$2 = null;
class WindowProxy {
    static getInstance() {
        return instance$2 || (instance$2 = new WindowProxy)
    }
    static setInstance(newInstance) {
        instance$2 = newInstance
    }
    navigate(href) {
        window.location.href = href
    }
    open(url) {
        window.open(url, "_blank")
    }
    setTimeout(callback, duration) {
        return window.setTimeout(callback, duration)
    }
    clearTimeout(id) {
        window.clearTimeout(id !== null ? id : undefined)
    }
    random() {
        return Math.random()
    }
    createIframeSrc(src) {
        return src
    }
    matchMedia(query) {
        return window.matchMedia(query)
    }
    now() {
        return Date.now()
    }
    waitForLazyRender() {
        return new Promise((resolve=>{
            requestIdleCallback((()=>resolve()), {
                timeout: 500
            })
        }
        ))
    }
    postMessage(iframe, message, targetOrigin) {
        iframe.contentWindow.postMessage(message, targetOrigin)
    }
    get url() {
        return new URL(window.location.href)
    }
    get onLine() {
        return window.navigator.onLine
    }
}
// Copyright 2020 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
class IframeElement extends PolymerElement {
    static get is() {
        return "ntp-iframe"
    }
    static get template() {
        return getTemplate$5()
    }
    static get properties() {
        return {
            allow: {
                reflectToAttribute: true,
                type: String
            },
            src: {
                reflectToAttribute: true,
                type: String
            },
            src_: {
                type: String,
                computed: "computeSrc_(src)"
            }
        }
    }
    postMessage(message) {
        assert(this.shadowRoot);
        WindowProxy.getInstance().postMessage(strictQuery(this.shadowRoot, "#iframe", HTMLIFrameElement), message, new URL(this.src).origin)
    }
    computeSrc_() {
        return WindowProxy.getInstance().createIframeSrc(this.src)
    }
}
customElements.define(IframeElement.is, IframeElement);
/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
class IronSelection {
    constructor(selectCallback) {
        this.selection = [];
        this.selectCallback = selectCallback
    }
    get() {
        return this.multi ? this.selection.slice() : this.selection[0]
    }
    clear(excludes) {
        this.selection.slice().forEach((function(item) {
            if (!excludes || excludes.indexOf(item) < 0) {
                this.setItemSelected(item, false)
            }
        }
        ), this)
    }
    isSelected(item) {
        return this.selection.indexOf(item) >= 0
    }
    setItemSelected(item, isSelected) {
        if (item != null) {
            if (isSelected !== this.isSelected(item)) {
                if (isSelected) {
                    this.selection.push(item)
                } else {
                    var i = this.selection.indexOf(item);
                    if (i >= 0) {
                        this.selection.splice(i, 1)
                    }
                }
                if (this.selectCallback) {
                    this.selectCallback(item, isSelected)
                }
            }
        }
    }
    select(item) {
        if (this.multi) {
            this.toggle(item)
        } else if (this.get() !== item) {
            this.setItemSelected(this.get(), false);
            this.setItemSelected(item, true)
        }
    }
    toggle(item) {
        this.setItemSelected(item, !this.isSelected(item))
    }
}
/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
const IronSelectableBehavior = {
    properties: {
        attrForSelected: {
            type: String,
            value: null
        },
        selected: {
            type: String,
            notify: true
        },
        selectedItem: {
            type: Object,
            readOnly: true,
            notify: true
        },
        activateEvent: {
            type: String,
            value: "tap",
            observer: "_activateEventChanged"
        },
        selectable: String,
        selectedClass: {
            type: String,
            value: "iron-selected"
        },
        selectedAttribute: {
            type: String,
            value: null
        },
        fallbackSelection: {
            type: String,
            value: null
        },
        items: {
            type: Array,
            readOnly: true,
            notify: true,
            value: function() {
                return []
            }
        },
        _excludedLocalNames: {
            type: Object,
            value: function() {
                return {
                    template: 1,
                    "dom-bind": 1,
                    "dom-if": 1,
                    "dom-repeat": 1
                }
            }
        }
    },
    observers: ["_updateAttrForSelected(attrForSelected)", "_updateSelected(selected)", "_checkFallback(fallbackSelection)"],
    created: function() {
        this._bindFilterItem = this._filterItem.bind(this);
        this._selection = new IronSelection(this._applySelection.bind(this))
    },
    attached: function() {
        this._observer = this._observeItems(this);
        this._addListener(this.activateEvent)
    },
    detached: function() {
        if (this._observer) {
            dom(this).unobserveNodes(this._observer)
        }
        this._removeListener(this.activateEvent)
    },
    indexOf: function(item) {
        return this.items ? this.items.indexOf(item) : -1
    },
    select: function(value) {
        this.selected = value
    },
    selectPrevious: function() {
        var length = this.items.length;
        var index = length - 1;
        if (this.selected !== undefined) {
            index = (Number(this._valueToIndex(this.selected)) - 1 + length) % length
        }
        this.selected = this._indexToValue(index)
    },
    selectNext: function() {
        var index = 0;
        if (this.selected !== undefined) {
            index = (Number(this._valueToIndex(this.selected)) + 1) % this.items.length
        }
        this.selected = this._indexToValue(index)
    },
    selectIndex: function(index) {
        this.select(this._indexToValue(index))
    },
    forceSynchronousItemUpdate: function() {
        if (this._observer && typeof this._observer.flush === "function") {
            this._observer.flush()
        } else {
            this._updateItems()
        }
    },
    get _shouldUpdateSelection() {
        return this.selected != null
    },
    _checkFallback: function() {
        this._updateSelected()
    },
    _addListener: function(eventName) {
        this.listen(this, eventName, "_activateHandler")
    },
    _removeListener: function(eventName) {
        this.unlisten(this, eventName, "_activateHandler")
    },
    _activateEventChanged: function(eventName, old) {
        this._removeListener(old);
        this._addListener(eventName)
    },
    _updateItems: function() {
        var nodes = dom(this).queryDistributedElements(this.selectable || "*");
        nodes = Array.prototype.filter.call(nodes, this._bindFilterItem);
        this._setItems(nodes)
    },
    _updateAttrForSelected: function() {
        if (this.selectedItem) {
            this.selected = this._valueForItem(this.selectedItem)
        }
    },
    _updateSelected: function() {
        this._selectSelected(this.selected)
    },
    _selectSelected: function(selected) {
        if (!this.items) {
            return
        }
        var item = this._valueToItem(this.selected);
        if (item) {
            this._selection.select(item)
        } else {
            this._selection.clear()
        }
        if (this.fallbackSelection && this.items.length && this._selection.get() === undefined) {
            this.selected = this.fallbackSelection
        }
    },
    _filterItem: function(node) {
        return !this._excludedLocalNames[node.localName]
    },
    _valueToItem: function(value) {
        return value == null ? null : this.items[this._valueToIndex(value)]
    },
    _valueToIndex: function(value) {
        if (this.attrForSelected) {
            for (var i = 0, item; item = this.items[i]; i++) {
                if (this._valueForItem(item) == value) {
                    return i
                }
            }
        } else {
            return Number(value)
        }
    },
    _indexToValue: function(index) {
        if (this.attrForSelected) {
            var item = this.items[index];
            if (item) {
                return this._valueForItem(item)
            }
        } else {
            return index
        }
    },
    _valueForItem: function(item) {
        if (!item) {
            return null
        }
        if (!this.attrForSelected) {
            var i = this.indexOf(item);
            return i === -1 ? null : i
        }
        var propValue = item[dashToCamelCase(this.attrForSelected)];
        return propValue != undefined ? propValue : item.getAttribute(this.attrForSelected)
    },
    _applySelection: function(item, isSelected) {
        if (this.selectedClass) {
            this.toggleClass(this.selectedClass, isSelected, item)
        }
        if (this.selectedAttribute) {
            this.toggleAttribute(this.selectedAttribute, isSelected, item)
        }
        this._selectionChange();
        this.fire("iron-" + (isSelected ? "select" : "deselect"), {
            item: item
        })
    },
    _selectionChange: function() {
        this._setSelectedItem(this._selection.get())
    },
    _observeItems: function(node) {
        return dom(node).observeNodes((function(mutation) {
            this._updateItems();
            this._updateSelected();
            this.fire("iron-items-changed", mutation, {
                bubbles: false,
                cancelable: false
            })
        }
        ))
    },
    _activateHandler: function(e) {
        var t = e.target;
        var items = this.items;
        while (t && t != this) {
            var i = items.indexOf(t);
            if (i >= 0) {
                var value = this._indexToValue(i);
                this._itemActivate(value, t);
                return
            }
            t = t.parentNode
        }
    },
    _itemActivate: function(value, item) {
        if (!this.fire("iron-activate", {
            selected: value,
            item: item
        }, {
            cancelable: true
        }).defaultPrevented) {
            this.select(value)
        }
    }
};
/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
const IronMultiSelectableBehaviorImpl = {
    properties: {
        multi: {
            type: Boolean,
            value: false,
            observer: "multiChanged"
        },
        selectedValues: {
            type: Array,
            notify: true,
            value: function() {
                return []
            }
        },
        selectedItems: {
            type: Array,
            readOnly: true,
            notify: true,
            value: function() {
                return []
            }
        }
    },
    observers: ["_updateSelected(selectedValues.splices)"],
    select: function(value) {
        if (this.multi) {
            this._toggleSelected(value)
        } else {
            this.selected = value
        }
    },
    multiChanged: function(multi) {
        this._selection.multi = multi;
        this._updateSelected()
    },
    get _shouldUpdateSelection() {
        return this.selected != null || this.selectedValues != null && this.selectedValues.length
    },
    _updateAttrForSelected: function() {
        if (!this.multi) {
            IronSelectableBehavior._updateAttrForSelected.apply(this)
        } else if (this.selectedItems && this.selectedItems.length > 0) {
            this.selectedValues = this.selectedItems.map((function(selectedItem) {
                return this._indexToValue(this.indexOf(selectedItem))
            }
            ), this).filter((function(unfilteredValue) {
                return unfilteredValue != null
            }
            ), this)
        }
    },
    _updateSelected: function() {
        if (this.multi) {
            this._selectMulti(this.selectedValues)
        } else {
            this._selectSelected(this.selected)
        }
    },
    _selectMulti: function(values) {
        values = values || [];
        var selectedItems = (this._valuesToItems(values) || []).filter((function(item) {
            return item !== null && item !== undefined
        }
        ));
        this._selection.clear(selectedItems);
        for (var i = 0; i < selectedItems.length; i++) {
            this._selection.setItemSelected(selectedItems[i], true)
        }
        if (this.fallbackSelection && !this._selection.get().length) {
            var fallback = this._valueToItem(this.fallbackSelection);
            if (fallback) {
                this.select(this.fallbackSelection)
            }
        }
    },
    _selectionChange: function() {
        var s = this._selection.get();
        if (this.multi) {
            this._setSelectedItems(s);
            this._setSelectedItem(s.length ? s[0] : null)
        } else {
            if (s !== null && s !== undefined) {
                this._setSelectedItems([s]);
                this._setSelectedItem(s)
            } else {
                this._setSelectedItems([]);
                this._setSelectedItem(null)
            }
        }
    },
    _toggleSelected: function(value) {
        var i = this.selectedValues.indexOf(value);
        var unselected = i < 0;
        if (unselected) {
            this.push("selectedValues", value)
        } else {
            this.splice("selectedValues", i, 1)
        }
    },
    _valuesToItems: function(values) {
        return values == null ? null : values.map((function(value) {
            return this._valueToItem(value)
        }
        ), this)
    }
};
const IronMultiSelectableBehavior = [IronSelectableBehavior, IronMultiSelectableBehaviorImpl];
/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
Polymer({
    is: "iron-selector",
    behaviors: [IronMultiSelectableBehavior]
});
// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
function getDeepActiveElement() {
    let a = document.activeElement;
    while (a && a.shadowRoot && a.shadowRoot.activeElement) {
        a = a.shadowRoot.activeElement
    }
    return a
}
function isRTL() {
    return document.documentElement.dir === "rtl"
}
function listenOnce(target, eventNames, callback) {
    const eventNamesArray = Array.isArray(eventNames) ? eventNames : eventNames.split(/ +/);
    const removeAllAndCallCallback = function(event) {
        eventNamesArray.forEach((function(eventName) {
            target.removeEventListener(eventName, removeAllAndCallCallback, false)
        }
        ));
        return callback(event)
    };
    eventNamesArray.forEach((function(eventName) {
        target.addEventListener(eventName, removeAllAndCallCallback, false)
    }
    ))
}
function hasKeyModifiers(e) {
    return !!(e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)
}
// Copyright 2021 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const I18nMixin = dedupingMixin((superClass=>{
    class I18nMixin extends superClass {
        i18nRaw_(id, ...varArgs) {
            return varArgs.length === 0 ? loadTimeData.getString(id) : loadTimeData.getStringF(id, ...varArgs)
        }
        i18n(id, ...varArgs) {
            const rawString = this.i18nRaw_(id, ...varArgs);
            return parseHtmlSubset(`<b>${rawString}</b>`).firstChild.textContent
        }
        i18nAdvanced(id, opts) {
            opts = opts || {};
            const rawString = this.i18nRaw_(id, ...opts.substitutions || []);
            return sanitizeInnerHtml(rawString, opts)
        }
        i18nDynamic(_locale, id, ...varArgs) {
            return this.i18n(id, ...varArgs)
        }
        i18nRecursive(locale, id, ...varArgs) {
            let args = varArgs;
            if (args.length > 0) {
                args = args.map((str=>this.i18nExists(str) ? loadTimeData.getString(str) : str))
            }
            return this.i18nDynamic(locale, id, ...args)
        }
        i18nExists(id) {
            return loadTimeData.valueExists(id)
        }
    }
    return I18nMixin
}
));
// Copyright 2012 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const CLASS_NAME = "focus-outline-visible";
const docsToManager = new Map;
class FocusOutlineManager {
    constructor(doc) {
        this.focusByKeyboard_ = true;
        this.classList_ = doc.documentElement.classList;
        doc.addEventListener("keydown", (()=>this.onEvent_(true)), true);
        doc.addEventListener("mousedown", (()=>this.onEvent_(false)), true);
        this.updateVisibility()
    }
    onEvent_(focusByKeyboard) {
        if (this.focusByKeyboard_ === focusByKeyboard) {
            return
        }
        this.focusByKeyboard_ = focusByKeyboard;
        this.updateVisibility()
    }
    updateVisibility() {
        this.visible = this.focusByKeyboard_
    }
    set visible(visible) {
        this.classList_.toggle(CLASS_NAME, visible)
    }
    get visible() {
        return this.classList_.contains(CLASS_NAME)
    }
    static forDocument(doc) {
        let manager = docsToManager.get(doc);
        if (!manager) {
            manager = new FocusOutlineManager(doc);
            docsToManager.set(doc, manager)
        }
        return manager
    }
}
function getTemplate$4() {
    return html`<!--_html_template_start_-->    <style include="cr-hidden-style">:host{--active-shadow-rgb:var(--google-grey-800-rgb);--active-shadow-action-rgb:var(--google-blue-500-rgb);--bg-action:var(--google-blue-600);--border-color:var(--google-grey-300);--disabled-bg-action:var(--google-grey-100);--disabled-bg:white;--disabled-border-color:var(--google-grey-100);--disabled-text-color:var(--google-grey-600);--focus-shadow-color:rgba(var(--google-blue-600-rgb), .4);--hover-bg-action:rgba(var(--google-blue-600-rgb), .9);--hover-bg-color:rgba(var(--google-blue-500-rgb), .04);--hover-border-color:var(--google-blue-100);--hover-shadow-action-rgb:var(--google-blue-500-rgb);--ink-color-action:white;--ink-color:var(--google-blue-600);--ripple-opacity-action:.32;--ripple-opacity:.1;--text-color-action:white;--text-color:var(--google-blue-600)}@media (prefers-color-scheme:dark){:host{--active-bg:black linear-gradient(rgba(255, 255, 255, .06),
                                             rgba(255, 255, 255, .06));--active-shadow-rgb:0,0,0;--active-shadow-action-rgb:var(--google-blue-500-rgb);--bg-action:var(--google-blue-300);--border-color:var(--google-grey-700);--disabled-bg-action:var(--google-grey-800);--disabled-bg:transparent;--disabled-border-color:var(--google-grey-800);--disabled-text-color:var(--google-grey-500);--focus-shadow-color:rgba(var(--google-blue-300-rgb), .5);--hover-bg-action:var(--bg-action) linear-gradient(rgba(0, 0, 0, .08), rgba(0, 0, 0, .08));--hover-bg-color:rgba(var(--google-blue-300-rgb), .08);--ink-color-action:black;--ink-color:var(--google-blue-300);--ripple-opacity-action:.16;--ripple-opacity:.16;--text-color-action:var(--google-grey-900);--text-color:var(--google-blue-300)}}:host{--paper-ripple-opacity:var(--ripple-opacity);-webkit-tap-highlight-color:transparent;align-items:center;border:1px solid var(--border-color);border-radius:4px;box-sizing:border-box;color:var(--text-color);cursor:pointer;display:inline-flex;flex-shrink:0;font-weight:500;height:var(--cr-button-height);justify-content:center;min-width:5.14em;outline-width:0;overflow:hidden;padding:8px 16px;position:relative;user-select:none}:host-context([chrome-refresh-2023]):host{--border-color:var(--color-button-border,
            var(--cr-fallback-color-tonal-outline));--text-color:var(--color-button-foreground,
            var(--cr-fallback-color-primary));--hover-bg-color:transparent;--hover-border-color:var(--border-color);--active-bg:transparent;--active-shadow:none;--ink-color:var(--cr-active-background-color);--ripple-opacity:1;--disabled-bg:transparent;--disabled-border-color:var(--color-button-border-disabled,
            var(--cr-fallback-color-disabled-background));--disabled-text-color:var(--color-button-foreground-disabled,
            var(--cr-fallback-color-disabled-foreground));--bg-action:var(--color-button-background-prominent,
            var(--cr-fallback-color-primary));--text-color-action:var(--color-button-foreground-prominent,
            var(--cr-fallback-color-on-primary));--hover-bg-action:var(--bg-action);--active-shadow-action:none;--ink-color-action:var(--cr-active-background-color);--ripple-opacity-action:1;--disabled-bg-action:var(--color-button-background-prominent-disabled,
            var(--cr-fallback-color-disabled-background));background:0 0;border-radius:100px;isolation:isolate;line-height:20px}:host([has-prefix-icon_]),:host([has-suffix-icon_]){--iron-icon-height:16px;--iron-icon-width:16px;gap:8px;padding:8px}:host-context([chrome-refresh-2023]):host([has-prefix-icon_]),:host-context([chrome-refresh-2023]):host([has-suffix-icon_]){--iron-icon-height:20px;--iron-icon-width:20px;--icon-block-padding-large:16px;--icon-block-padding-small:12px;padding-block-end:8px;padding-block-start:8px}:host-context([chrome-refresh-2023]):host([has-prefix-icon_]){padding-inline-end:var(--icon-block-padding-large);padding-inline-start:var(--icon-block-padding-small)}:host-context([chrome-refresh-2023]):host([has-suffix-icon_]){padding-inline-end:var(--icon-block-padding-small);padding-inline-start:var(--icon-block-padding-large)}:host-context(.focus-outline-visible):host(:focus){box-shadow:0 0 0 2px var(--focus-shadow-color)}@media (forced-colors:active){:host-context(.focus-outline-visible):host(:focus){outline:var(--cr-focus-outline-hcm)}:host-context([chrome-refresh-2023]):host{forced-color-adjust:none}}:host-context([chrome-refresh-2023].focus-outline-visible):host(:focus){box-shadow:none;outline:2px solid var(--cr-focus-outline-color);outline-offset:2px}:host(:active){background:var(--active-bg);box-shadow:var(--active-shadow,0 1px 2px 0 rgba(var(--active-shadow-rgb),.3),0 3px 6px 2px rgba(var(--active-shadow-rgb),.15))}:host(:hover){background-color:var(--hover-bg-color)}@media (prefers-color-scheme:light){:host(:hover){border-color:var(--hover-border-color)}}#background{border-radius:inherit;inset:0;pointer-events:none;position:absolute;z-index:0}:host-context([chrome-refresh-2023]):host(:hover) #background{background-color:var(--hover-bg-color)}:host-context([chrome-refresh-2023].focus-outline-visible):host(:focus) #background{background-clip:padding-box}:host-context([chrome-refresh-2023]):host(.action-button) #background{background-color:var(--bg-action)}:host-context([chrome-refresh-2023]):host([disabled]) #background{background-color:var(--disabled-bg)}:host-context([chrome-refresh-2023]):host(.action-button[disabled]) #background{background-color:var(--disabled-bg-action)}:host-context([chrome-refresh-2023]):host(.floating-button) #background,:host-context([chrome-refresh-2023]):host(.tonal-button) #background{background-color:var(--color-button-background-tonal,var(--cr-fallback-color-secondary-container))}:host-context([chrome-refresh-2023]):host([disabled].floating-button) #background,:host-context([chrome-refresh-2023]):host([disabled].tonal-button) #background{background-color:var(--color-button-background-tonal-disabled,var(--cr-fallback-color-disabled-background))}#content{display:contents}:host-context([chrome-refresh-2023]) #content{display:inline;z-index:2}:host-context([chrome-refresh-2023]) ::slotted(*){z-index:2}#hoverBackground{content:'';display:none;inset:0;pointer-events:none;position:absolute;z-index:1}:host-context([chrome-refresh-2023]):host(:hover) #hoverBackground{background:var(--cr-hover-background-color);display:block}:host-context([chrome-refresh-2023]):host(.action-button:hover) #hoverBackground{background:var(--cr-hover-on-prominent-background-color)}:host(.action-button){--ink-color:var(--ink-color-action);--paper-ripple-opacity:var(--ripple-opacity-action);background-color:var(--bg-action);border:none;color:var(--text-color-action)}:host-context([chrome-refresh-2023]):host(.action-button){--ink-color:var(--cr-active-on-primary-background-color);background-color:transparent}:host(.action-button:active){box-shadow:var(--active-shadow-action,0 1px 2px 0 rgba(var(--active-shadow-action-rgb),.3),0 3px 6px 2px rgba(var(--active-shadow-action-rgb),.15))}:host(.action-button:hover){background:var(--hover-bg-action)}@media (prefers-color-scheme:light){:host(.action-button:not(:active):hover){box-shadow:0 1px 2px 0 rgba(var(--hover-shadow-action-rgb),.3),0 1px 3px 1px rgba(var(--hover-shadow-action-rgb),.15)}:host-context([chrome-refresh-2023]):host(.action-button:not(:active):hover){box-shadow:none}}:host([disabled]){background-color:var(--disabled-bg);border-color:var(--disabled-border-color);color:var(--disabled-text-color);cursor:auto;pointer-events:none}:host(.action-button[disabled]){background-color:var(--disabled-bg-action);border-color:transparent}:host(.cancel-button){margin-inline-end:8px}:host(.action-button),:host(.cancel-button){line-height:154%}:host-context([chrome-refresh-2023]):host(.floating-button),:host-context([chrome-refresh-2023]):host(.tonal-button){border:none;color:var(--color-button-foreground-tonal,var(--cr-fallback-color-on-tonal-container))}:host-context([chrome-refresh-2023]):host(.floating-button[disabled]),:host-context([chrome-refresh-2023]):host(.tonal-button[disabled]){border:none;color:var(--disabled-text-color)}:host-context([chrome-refresh-2023]):host(.floating-button){border-radius:8px;height:40px;transition:box-shadow 80ms linear}:host-context([chrome-refresh-2023]):host(.floating-button:hover){box-shadow:var(--cr-elevation-3)}paper-ripple{color:var(--ink-color);height:var(--paper-ripple-height);left:var(--paper-ripple-left,0);top:var(--paper-ripple-top,0);width:var(--paper-ripple-width)}:host-context([chrome-refresh-2023]) paper-ripple{z-index:1}</style>

    <div id="background"></div>
    <slot id="prefixIcon" name="prefix-icon" on-slotchange="onPrefixIconSlotChanged_">
    </slot>
    <span id="content"><slot></slot></span>
    <slot id="suffixIcon" name="suffix-icon" on-slotchange="onSuffixIconSlotChanged_">
    </slot>
    <div id="hoverBackground" part="hoverBackground"></div>
<!--_html_template_end_-->`
}
// Copyright 2019 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const CrButtonElementBase = mixinBehaviors([PaperRippleBehavior], PolymerElement);
class CrButtonElement extends CrButtonElementBase {
    static get is() {
        return "cr-button"
    }
    static get template() {
        return getTemplate$4()
    }
    static get properties() {
        return {
            disabled: {
                type: Boolean,
                value: false,
                reflectToAttribute: true,
                observer: "disabledChanged_"
            },
            customTabIndex: {
                type: Number,
                observer: "applyTabIndex_"
            },
            circleRipple: {
                type: Boolean,
                value: false
            },
            hasPrefixIcon_: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            hasSuffixIcon_: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            }
        }
    }
    constructor() {
        super();
        this.spaceKeyDown_ = false;
        this.timeoutIds_ = new Set;
        this.addEventListener("blur", this.onBlur_.bind(this));
        this.addEventListener("click", this.onClick_.bind(this));
        this.addEventListener("keydown", this.onKeyDown_.bind(this));
        this.addEventListener("keyup", this.onKeyUp_.bind(this));
        this.addEventListener("pointerdown", this.onPointerDown_.bind(this))
    }
    ready() {
        super.ready();
        if (!this.hasAttribute("role")) {
            this.setAttribute("role", "button")
        }
        if (!this.hasAttribute("tabindex")) {
            this.setAttribute("tabindex", "0")
        }
        if (!this.hasAttribute("aria-disabled")) {
            this.setAttribute("aria-disabled", this.disabled ? "true" : "false")
        }
        FocusOutlineManager.forDocument(document)
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.timeoutIds_.forEach(clearTimeout);
        this.timeoutIds_.clear()
    }
    setTimeout_(fn, delay) {
        if (!this.isConnected) {
            return
        }
        const id = setTimeout((()=>{
            this.timeoutIds_.delete(id);
            fn()
        }
        ), delay);
        this.timeoutIds_.add(id)
    }
    disabledChanged_(newValue, oldValue) {
        if (!newValue && oldValue === undefined) {
            return
        }
        if (this.disabled) {
            this.blur()
        }
        this.setAttribute("aria-disabled", this.disabled ? "true" : "false");
        this.applyTabIndex_()
    }
    applyTabIndex_() {
        let value = this.customTabIndex;
        if (value === undefined) {
            value = this.disabled ? -1 : 0
        }
        this.setAttribute("tabindex", value.toString())
    }
    onBlur_() {
        this.spaceKeyDown_ = false;
        this.setTimeout_((()=>this.getRipple().uiUpAction()), 100)
    }
    onClick_(e) {
        if (this.disabled) {
            e.stopImmediatePropagation()
        }
    }
    onPrefixIconSlotChanged_() {
        this.hasPrefixIcon_ = this.$.prefixIcon.assignedElements().length > 0
    }
    onSuffixIconSlotChanged_() {
        this.hasSuffixIcon_ = this.$.suffixIcon.assignedElements().length > 0
    }
    onKeyDown_(e) {
        if (e.key !== " " && e.key !== "Enter") {
            return
        }
        e.preventDefault();
        e.stopPropagation();
        if (e.repeat) {
            return
        }
        this.getRipple().uiDownAction();
        if (e.key === "Enter") {
            this.click();
            this.setTimeout_((()=>this.getRipple().uiUpAction()), 100)
        } else if (e.key === " ") {
            this.spaceKeyDown_ = true
        }
    }
    onKeyUp_(e) {
        if (e.key !== " " && e.key !== "Enter") {
            return
        }
        e.preventDefault();
        e.stopPropagation();
        if (this.spaceKeyDown_ && e.key === " ") {
            this.spaceKeyDown_ = false;
            this.click();
            this.getRipple().uiUpAction()
        }
    }
    onPointerDown_() {
        this.ensureRipple()
    }
    _createRipple() {
        const ripple = super._createRipple();
        if (this.circleRipple) {
            ripple.setAttribute("center", "");
            ripple.classList.add("circle")
        }
        return ripple
    }
}
customElements.define(CrButtonElement.is, CrButtonElement);
// Copyright 2017 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var CrContainerShadowSide;
(function(CrContainerShadowSide) {
    CrContainerShadowSide["TOP"] = "top";
    CrContainerShadowSide["BOTTOM"] = "bottom"
}
)(CrContainerShadowSide || (CrContainerShadowSide = {}));
const CrContainerShadowMixin = dedupingMixin((superClass=>{
    class CrContainerShadowMixin extends superClass {
        constructor() {
            super(...arguments);
            this.intersectionObserver_ = null;
            this.dropShadows_ = new Map;
            this.intersectionProbes_ = new Map;
            this.sides_ = null
        }
        connectedCallback() {
            super.connectedCallback();
            const hasBottomShadow = this.getContainer_().hasAttribute("show-bottom-shadow");
            this.sides_ = hasBottomShadow ? [CrContainerShadowSide.TOP, CrContainerShadowSide.BOTTOM] : [CrContainerShadowSide.TOP];
            this.sides_.forEach((side=>{
                const shadow = document.createElement("div");
                shadow.id = `cr-container-shadow-${side}`;
                shadow.classList.add("cr-container-shadow");
                this.dropShadows_.set(side, shadow);
                this.intersectionProbes_.set(side, document.createElement("div"))
            }
            ));
            this.getContainer_().parentNode.insertBefore(this.dropShadows_.get(CrContainerShadowSide.TOP), this.getContainer_());
            this.getContainer_().prepend(this.intersectionProbes_.get(CrContainerShadowSide.TOP));
            if (hasBottomShadow) {
                this.getContainer_().parentNode.insertBefore(this.dropShadows_.get(CrContainerShadowSide.BOTTOM), this.getContainer_().nextSibling);
                this.getContainer_().append(this.intersectionProbes_.get(CrContainerShadowSide.BOTTOM))
            }
            this.enableShadowBehavior(true)
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            this.enableShadowBehavior(false)
        }
        getContainer_() {
            return this.shadowRoot.querySelector("#container")
        }
        getIntersectionObserver_() {
            const callback = entries=>{
                for (const entry of entries) {
                    const target = entry.target;
                    this.sides_.forEach((side=>{
                        if (target === this.intersectionProbes_.get(side)) {
                            this.dropShadows_.get(side).classList.toggle("has-shadow", entry.intersectionRatio === 0)
                        }
                    }
                    ))
                }
            }
            ;
            return new IntersectionObserver(callback,{
                root: this.getContainer_(),
                threshold: 0
            })
        }
        enableShadowBehavior(enable) {
            if (enable === !!this.intersectionObserver_) {
                return
            }
            if (!enable) {
                this.intersectionObserver_.disconnect();
                this.intersectionObserver_ = null;
                return
            }
            this.intersectionObserver_ = this.getIntersectionObserver_();
            window.setTimeout((()=>{
                if (this.intersectionObserver_) {
                    this.intersectionProbes_.forEach((probe=>{
                        this.intersectionObserver_.observe(probe)
                    }
                    ))
                }
            }
            ))
        }
        showDropShadows() {
            assert(!this.intersectionObserver_);
            assert(this.sides_);
            for (const side of this.sides_) {
                this.dropShadows_.get(side).classList.toggle("has-shadow", true)
            }
        }
    }
    return CrContainerShadowMixin
}
));
function getTemplate$3() {
    return html`<!--_html_template_start_-->    <style include="cr-hidden-style cr-icons">dialog{--scroll-border-color:var(--paper-grey-300);--scroll-border:1px solid var(--scroll-border-color);background-color:var(--cr-dialog-background-color,#fff);border:0;border-radius:var(--cr-dialog-border-radius,8px);bottom:50%;box-shadow:0 0 16px rgba(0,0,0,.12),0 16px 16px rgba(0,0,0,.24);color:inherit;max-height:initial;max-width:initial;overflow-y:hidden;padding:0;position:absolute;top:50%;width:var(--cr-dialog-width,512px)}@media (prefers-color-scheme:dark){dialog{--scroll-border-color:var(--google-grey-700);background-color:var(--cr-dialog-background-color,var(--google-grey-900));background-image:linear-gradient(rgba(255,255,255,.04),rgba(255,255,255,.04))}}@media (forced-colors:active){dialog{border:var(--cr-border-hcm)}}dialog[open] #content-wrapper{display:flex;flex-direction:column;max-height:100vh;overflow:auto}.top-container,:host ::slotted([slot=button-container]),:host ::slotted([slot=footer]){flex-shrink:0}dialog::backdrop{background-color:rgba(0,0,0,.6);bottom:0;left:0;position:fixed;right:0;top:0}:host ::slotted([slot=body]){color:var(--cr-secondary-text-color);padding:0 var(--cr-dialog-body-padding-horizontal,20px)}:host ::slotted([slot=title]){color:var(--cr-primary-text-color);flex:1;font-family:var(--cr-dialog-font-family,inherit);font-size:var(--cr-dialog-title-font-size,calc(15 / 13 * 100%));line-height:1;padding-bottom:var(--cr-dialog-title-slot-padding-bottom,16px);padding-inline-end:var(--cr-dialog-title-slot-padding-end,20px);padding-inline-start:var(--cr-dialog-title-slot-padding-start,20px);padding-top:var(--cr-dialog-title-slot-padding-top,20px)}:host ::slotted([slot=button-container]){display:flex;justify-content:flex-end;padding-bottom:var(--cr-dialog-button-container-padding-bottom,16px);padding-inline-end:var(--cr-dialog-button-container-padding-horizontal,16px);padding-inline-start:var(--cr-dialog-button-container-padding-horizontal,16px);padding-top:var(--cr-dialog-button-container-padding-top,16px)}:host ::slotted([slot=footer]){border-bottom-left-radius:inherit;border-bottom-right-radius:inherit;border-top:1px solid #dbdbdb;margin:0;padding:16px 20px}:host([hide-backdrop]) dialog::backdrop{opacity:0}@media (prefers-color-scheme:dark){:host ::slotted([slot=footer]){border-top-color:var(--cr-separator-color)}}.body-container{box-sizing:border-box;display:flex;flex-direction:column;min-height:1.375rem;overflow:auto}:host{--transparent-border:1px solid transparent}#cr-container-shadow-top{border-bottom:var(--cr-dialog-body-border-top,var(--transparent-border))}#cr-container-shadow-bottom{border-bottom:var(--cr-dialog-body-border-bottom,var(--transparent-border))}#cr-container-shadow-bottom.has-shadow,#cr-container-shadow-top.has-shadow{border-bottom:var(--scroll-border)}.top-container{align-items:flex-start;display:flex;min-height:var(--cr-dialog-top-container-min-height,31px)}.title-container{display:flex;flex:1;font-size:inherit;font-weight:inherit;margin:0;outline:0}#close{align-self:flex-start;margin-inline-end:4px;margin-top:4px}</style>
    <dialog id="dialog" on-close="onNativeDialogClose_" on-cancel="onNativeDialogCancel_" part="dialog" aria-labelledby="title" aria-describedby="container">
    
      <div id="content-wrapper" part="wrapper">
        <div class="top-container">
          <h2 id="title" class="title-container" tabindex="-1">
            <slot name="title"></slot>
          </h2>
          <cr-icon-button id="close" class="icon-clear" hidden$="[[!showCloseButton]]" aria-label$="[[closeText]]" on-click="cancel" on-keypress="onCloseKeypress_">
          </cr-icon-button>
        </div>
        <slot name="header"></slot>
        <div class="body-container" id="container" show-bottom-shadow part="body-container">
          <slot name="body"></slot>
        </div>
        <slot name="button-container"></slot>
        <slot name="footer"></slot>
      </div>
    </dialog>
<!--_html_template_end_-->`
}
// Copyright 2016 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const CrDialogElementBase = CrContainerShadowMixin(PolymerElement);
class CrDialogElement extends CrDialogElementBase {
    constructor() {
        super(...arguments);
        this.intersectionObserver_ = null;
        this.mutationObserver_ = null;
        this.boundKeydown_ = null
    }
    static get is() {
        return "cr-dialog"
    }
    static get template() {
        return getTemplate$3()
    }
    static get properties() {
        return {
            open: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            closeText: String,
            ignorePopstate: {
                type: Boolean,
                value: false
            },
            ignoreEnterKey: {
                type: Boolean,
                value: false
            },
            consumeKeydownEvent: {
                type: Boolean,
                value: false
            },
            noCancel: {
                type: Boolean,
                value: false
            },
            showCloseButton: {
                type: Boolean,
                value: false
            },
            showOnAttach: {
                type: Boolean,
                value: false
            }
        }
    }
    ready() {
        super.ready();
        window.addEventListener("popstate", (()=>{
            if (!this.ignorePopstate && this.$.dialog.open) {
                this.cancel()
            }
        }
        ));
        if (!this.ignoreEnterKey) {
            this.addEventListener("keypress", this.onKeypress_.bind(this))
        }
        this.addEventListener("pointerdown", (e=>this.onPointerdown_(e)))
    }
    connectedCallback() {
        super.connectedCallback();
        const mutationObserverCallback = ()=>{
            if (this.$.dialog.open) {
                this.enableShadowBehavior(true);
                this.addKeydownListener_()
            } else {
                this.enableShadowBehavior(false);
                this.removeKeydownListener_()
            }
        }
        ;
        this.mutationObserver_ = new MutationObserver(mutationObserverCallback);
        this.mutationObserver_.observe(this.$.dialog, {
            attributes: true,
            attributeFilter: ["open"]
        });
        mutationObserverCallback();
        if (this.showOnAttach) {
            this.showModal()
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeKeydownListener_();
        if (this.mutationObserver_) {
            this.mutationObserver_.disconnect();
            this.mutationObserver_ = null
        }
    }
    addKeydownListener_() {
        if (!this.consumeKeydownEvent) {
            return
        }
        this.boundKeydown_ = this.boundKeydown_ || this.onKeydown_.bind(this);
        this.addEventListener("keydown", this.boundKeydown_);
        document.body.addEventListener("keydown", this.boundKeydown_)
    }
    removeKeydownListener_() {
        if (!this.boundKeydown_) {
            return
        }
        this.removeEventListener("keydown", this.boundKeydown_);
        document.body.removeEventListener("keydown", this.boundKeydown_);
        this.boundKeydown_ = null
    }
    showModal() {
        this.$.dialog.showModal();
        assert(this.$.dialog.open);
        this.open = true;
        this.dispatchEvent(new CustomEvent("cr-dialog-open",{
            bubbles: true,
            composed: true
        }))
    }
    cancel() {
        this.dispatchEvent(new CustomEvent("cancel",{
            bubbles: true,
            composed: true
        }));
        this.$.dialog.close();
        assert(!this.$.dialog.open);
        this.open = false
    }
    close() {
        this.$.dialog.close("success");
        assert(!this.$.dialog.open);
        this.open = false
    }
    setTitleAriaLabel(title) {
        this.$.dialog.removeAttribute("aria-labelledby");
        this.$.dialog.setAttribute("aria-label", title)
    }
    onCloseKeypress_(e) {
        e.stopPropagation()
    }
    onNativeDialogClose_(e) {
        if (e.target !== this.getNative()) {
            return
        }
        this.dispatchEvent(new CustomEvent("close",{
            bubbles: true,
            composed: true
        }))
    }
    onNativeDialogCancel_(e) {
        if (e.target !== this.getNative()) {
            return
        }
        if (this.noCancel) {
            e.preventDefault();
            return
        }
        this.open = false;
        this.dispatchEvent(new CustomEvent("cancel",{
            bubbles: true,
            composed: true
        }))
    }
    getNative() {
        return this.$.dialog
    }
    onKeypress_(e) {
        if (e.key !== "Enter") {
            return
        }
        const accept = e.target === this || e.composedPath().some((el=>el.tagName === "CR-INPUT" && el.type !== "search"));
        if (!accept) {
            return
        }
        const actionButton = this.querySelector(".action-button:not([disabled]):not([hidden])");
        if (actionButton) {
            actionButton.click();
            e.preventDefault()
        }
    }
    onKeydown_(e) {
        assert(this.consumeKeydownEvent);
        if (!this.getNative().open) {
            return
        }
        if (this.ignoreEnterKey && e.key === "Enter") {
            return
        }
        e.stopPropagation()
    }
    onPointerdown_(e) {
        if (e.button !== 0 || e.composedPath()[0].tagName !== "DIALOG") {
            return
        }
        this.$.dialog.animate([{
            transform: "scale(1)",
            offset: 0
        }, {
            transform: "scale(1.02)",
            offset: .4
        }, {
            transform: "scale(1.02)",
            offset: .6
        }, {
            transform: "scale(1)",
            offset: 1
        }], {
            duration: 180,
            easing: "ease-in-out",
            iterations: 1
        });
        e.preventDefault()
    }
    focus() {
        const titleContainer = this.shadowRoot.querySelector(".title-container");
        assert(titleContainer);
        titleContainer.focus()
    }
}
customElements.define(CrDialogElement.is, CrDialogElement);
const styleMod = document.createElement("dom-module");
styleMod.appendChild(html`
  <template>
    <style>
:host{--cr-input-background-color:var(--google-grey-100);--cr-input-color:var(--cr-primary-text-color);--cr-input-error-color:var(--google-red-600);--cr-input-focus-color:var(--google-blue-600);display:block;outline:0}:host-context([chrome-refresh-2023]):host{--cr-input-background-color:var(--color-textfield-filled-background,
            var(--cr-fallback-color-surface-variant));--cr-input-border-bottom:1px solid var(--color-textfield-filled-underline,
                var(--cr-fallback-color-outline));--cr-input-border-radius:8px 8px 0 0;--cr-input-error-color:var(--color-textfield-filled-error,
            var(--cr-fallback-color-error));--cr-input-focus-color:var(--color-textfield-filled-underline-focused,
            var(--cr-fallback-color-primary));--cr-input-hover-background-color:var(--cr-hover-background-color);--cr-input-padding-bottom:10px;--cr-input-padding-end:10px;--cr-input-padding-start:10px;--cr-input-padding-top:10px;--cr-input-placeholder-color:var(--color-textfield-foreground-placeholder,
                var(--cr-fallback-on-surface-subtle));isolation:isolate}:host-context([chrome-refresh-2023]):host([readonly]){--cr-input-border-radius:8px 8px}@media (prefers-color-scheme:dark){:host{--cr-input-background-color:rgba(0, 0, 0, .3);--cr-input-error-color:var(--google-red-300);--cr-input-focus-color:var(--google-blue-300)}}:host-context(html:not([chrome-refresh-2023])):host([focused_]:not([readonly]):not([invalid])) #label{color:var(--cr-input-focus-color)}:host-context([chrome-refresh-2023]) #label{color:var(--color-textfield-foreground-label,var(--cr-fallback-color-on-surface-subtle));font-size:11px;line-height:16px}#input-container{border-radius:var(--cr-input-border-radius,4px);overflow:hidden;position:relative;width:var(--cr-input-width,100%)}#inner-input-container{background-color:var(--cr-input-background-color);box-sizing:border-box;padding:0}:host-context([chrome-refresh-2023]) #inner-input-content ::slotted(*){--cr-icon-button-fill-color:var(--color-textfield-foreground-icon,
            var(--cr-fallback-color-on-surface-subtle));--cr-icon-button-icon-size:16px;--cr-icon-button-size:24px;--cr-icon-button-margin-start:0;--cr-icon-color:var(--color-textfield-foreground-icon,
            var(--cr-fallback-color-on-surface-subtle))}:host-context([chrome-refresh-2023]) #inner-input-content ::slotted([slot=inline-prefix]){--cr-icon-button-margin-start:-8px}:host-context([chrome-refresh-2023]) #inner-input-content ::slotted([slot=inline-suffix]){--cr-icon-button-margin-end:-4px}:host-context([chrome-refresh-2023]):host([invalid]) #inner-input-content ::slotted(*){--cr-icon-color:var(--cr-input-error-color);--cr-icon-button-fill-color:var(--cr-input-error-color)}#hover-layer{display:none}:host-context([chrome-refresh-2023]) #hover-layer{background-color:var(--cr-input-hover-background-color);inset:0;pointer-events:none;position:absolute;z-index:0}:host-context([chrome-refresh-2023]):host(:not([readonly]):not([disabled])) #input-container:hover #hover-layer{display:block}#input{-webkit-appearance:none;background-color:transparent;border:none;box-sizing:border-box;caret-color:var(--cr-input-focus-color);color:var(--cr-input-color);font-family:inherit;font-size:inherit;font-weight:inherit;line-height:inherit;min-height:var(--cr-input-min-height,auto);outline:0;padding-bottom:var(--cr-input-padding-bottom,6px);padding-inline-end:var(--cr-input-padding-end,8px);padding-inline-start:var(--cr-input-padding-start,8px);padding-top:var(--cr-input-padding-top,6px);text-align:inherit;text-overflow:ellipsis;width:100%}:host-context([chrome-refresh-2023]) #input{font-size:12px;line-height:16px;padding:0}:host-context([chrome-refresh-2023]) #inner-input-content{padding-bottom:var(--cr-input-padding-bottom);padding-inline-end:var(--cr-input-padding-end);padding-inline-start:var(--cr-input-padding-start);padding-top:var(--cr-input-padding-top)}#underline{border-bottom:2px solid var(--cr-input-focus-color);border-radius:var(--cr-input-underline-border-radius,0);bottom:0;box-sizing:border-box;display:var(--cr-input-underline-display);height:var(--cr-input-underline-height,0);left:0;margin:auto;opacity:0;position:absolute;right:0;transition:opacity 120ms ease-out,width 0s linear 180ms;width:0}:host([focused_]) #underline,:host([force-underline]) #underline,:host([invalid]) #underline{opacity:1;transition:opacity 120ms ease-in,width 180ms ease-out;width:100%}#underline-base{display:none}:host-context([chrome-refresh-2023]):host([readonly]) #underline{display:none}:host-context([chrome-refresh-2023]):host(:not([readonly])) #underline-base{border-bottom:var(--cr-input-border-bottom);bottom:0;display:block;left:0;position:absolute;right:0}:host-context([chrome-refresh-2023]):host([disabled]){color:var(--color-textfield-foreground-disabled,var(--cr-fallback-color-disabled-foreground));--cr-input-border-bottom:1px solid currentColor;--cr-input-placeholder-color:currentColor;--cr-input-color:currentColor;--cr-input-background-color:var(--color-textfield-background-disabled,
            var(--cr-fallback-color-disabled-background))}:host-context([chrome-refresh-2023]):host([disabled]) #inner-input-content ::slotted(*){--cr-icon-color:currentColor;--cr-icon-button-fill-color:currentColor}
    </style>
  </template>
`.content);
styleMod.register("cr-input-style");
function getTemplate$2() {
    return html`<!--_html_template_start_-->    <style include="cr-hidden-style cr-input-style cr-shared-style">:host([disabled]) :-webkit-any(#label,#error,#input-container){opacity:var(--cr-disabled-opacity);pointer-events:none}:host-context([chrome-refresh-2023]):host([disabled]) :is(#label,#error,#input-container){opacity:1}:host ::slotted(cr-button[slot=suffix]){margin-inline-start:var(--cr-button-edge-spacing)!important}:host([invalid]) #label{color:var(--cr-input-error-color)}#input{border-bottom:var(--cr-input-border-bottom,none);letter-spacing:var(--cr-input-letter-spacing)}:host-context([chrome-refresh-2023]) #input{border-bottom:none}:host-context([chrome-refresh-2023]) #input-container{border:var(--cr-input-border,none)}#input::placeholder{color:var(--cr-input-placeholder-color,var(--cr-secondary-text-color));letter-spacing:var(--cr-input-placeholder-letter-spacing)}:host([invalid]) #input{caret-color:var(--cr-input-error-color)}:host([readonly]) #input{opacity:var(--cr-input-readonly-opacity,.6)}:host([invalid]) #underline{border-color:var(--cr-input-error-color)}#error{color:var(--cr-input-error-color);display:var(--cr-input-error-display,block);font-size:var(--cr-form-field-label-font-size);height:var(--cr-form-field-label-height);line-height:var(--cr-form-field-label-line-height);margin:8px 0;visibility:hidden;white-space:var(--cr-input-error-white-space)}:host-context([chrome-refresh-2023]) #error{font-size:11px;line-height:16px;margin:4px 10px}:host([invalid]) #error{visibility:visible}#inner-input-content,#row-container{align-items:center;display:flex;justify-content:space-between;position:relative}:host-context([chrome-refresh-2023]) #inner-input-content{gap:4px;height:16px;z-index:1}#input[type=search]::-webkit-search-cancel-button{display:none}:host-context([dir=rtl]) #input[type=url]{text-align:right}#input[type=url]{direction:ltr}</style>
    <div id="label" class="cr-form-field-label" hidden="[[!label]]" aria-hidden="true">
      [[label]]
    </div>
    <div id="row-container" part="row-container">
      <div id="input-container">
        <div id="inner-input-container">
          <div id="hover-layer"></div>
          <div id="inner-input-content">
            <slot name="inline-prefix"></slot>
            
            <input id="input" disabled="[[disabled]]" autofocus="[[autofocus]]" value="{{value::input}}" tabindex$="[[inputTabindex]]" type="[[type]]" readonly$="[[readonly]]" maxlength$="[[maxlength]]" pattern$="[[pattern]]" required="[[required]]" minlength$="[[minlength]]" inputmode$="[[inputmode]]" aria-description$="[[ariaDescription]]" aria-label$="[[getAriaLabel_(ariaLabel, label, placeholder)]]" aria-invalid$="[[getAriaInvalid_(invalid)]]" max="[[max]]" min="[[min]]" on-focus="onInputFocus_" on-blur="onInputBlur_" on-change="onInputChange_" part="input" autocomplete="off">
            <slot name="inline-suffix"></slot>
          </div>
        </div>
        <div id="underline-base"></div>
        <div id="underline"></div>
      </div>
      <slot name="suffix"></slot>
    </div>
    <div id="error" aria-live="assertive">[[displayErrorMessage_]]</div>
<!--_html_template_end_-->`
}
// Copyright 2018 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const SUPPORTED_INPUT_TYPES = new Set(["number", "password", "search", "text", "url"]);
class CrInputElement extends PolymerElement {
    static get is() {
        return "cr-input"
    }
    static get template() {
        return getTemplate$2()
    }
    static get properties() {
        return {
            ariaDescription: {
                type: String
            },
            ariaLabel: {
                type: String,
                value: ""
            },
            autofocus: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            autoValidate: Boolean,
            disabled: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            errorMessage: {
                type: String,
                value: "",
                observer: "onInvalidOrErrorMessageChanged_"
            },
            displayErrorMessage_: {
                type: String,
                value: ""
            },
            focused_: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            invalid: {
                type: Boolean,
                value: false,
                notify: true,
                reflectToAttribute: true,
                observer: "onInvalidOrErrorMessageChanged_"
            },
            max: {
                type: Number,
                reflectToAttribute: true
            },
            min: {
                type: Number,
                reflectToAttribute: true
            },
            maxlength: {
                type: Number,
                reflectToAttribute: true
            },
            minlength: {
                type: Number,
                reflectToAttribute: true
            },
            pattern: {
                type: String,
                reflectToAttribute: true
            },
            inputmode: String,
            label: {
                type: String,
                value: ""
            },
            placeholder: {
                type: String,
                value: null,
                observer: "placeholderChanged_"
            },
            readonly: {
                type: Boolean,
                reflectToAttribute: true
            },
            required: {
                type: Boolean,
                reflectToAttribute: true
            },
            inputTabindex: {
                type: Number,
                value: 0,
                observer: "onInputTabindexChanged_"
            },
            type: {
                type: String,
                value: "text",
                observer: "onTypeChanged_"
            },
            value: {
                type: String,
                value: "",
                notify: true,
                observer: "onValueChanged_"
            }
        }
    }
    ready() {
        super.ready();
        assert(!this.hasAttribute("tabindex"))
    }
    onInputTabindexChanged_() {
        assert(this.inputTabindex === 0 || this.inputTabindex === -1)
    }
    onTypeChanged_() {
        assert(SUPPORTED_INPUT_TYPES.has(this.type))
    }
    get inputElement() {
        return this.$.input
    }
    getAriaLabel_(ariaLabel, label, placeholder) {
        return ariaLabel || label || placeholder
    }
    getAriaInvalid_(invalid) {
        return invalid ? "true" : "false"
    }
    onInvalidOrErrorMessageChanged_() {
        this.displayErrorMessage_ = this.invalid ? this.errorMessage : "";
        const ERROR_ID = "error";
        const errorElement = this.shadowRoot.querySelector(`#${ERROR_ID}`);
        assert(errorElement);
        if (this.invalid) {
            errorElement.setAttribute("role", "alert");
            this.inputElement.setAttribute("aria-errormessage", ERROR_ID)
        } else {
            errorElement.removeAttribute("role");
            this.inputElement.removeAttribute("aria-errormessage")
        }
    }
    placeholderChanged_() {
        if (this.placeholder || this.placeholder === "") {
            this.inputElement.setAttribute("placeholder", this.placeholder)
        } else {
            this.inputElement.removeAttribute("placeholder")
        }
    }
    focus() {
        this.focusInput()
    }
    focusInput() {
        if (this.shadowRoot.activeElement === this.inputElement) {
            return false
        }
        this.inputElement.focus();
        return true
    }
    onValueChanged_(newValue, oldValue) {
        if (!newValue && !oldValue) {
            return
        }
        if (this.autoValidate) {
            this.validate()
        }
    }
    onInputChange_(e) {
        this.dispatchEvent(new CustomEvent("change",{
            bubbles: true,
            composed: true,
            detail: {
                sourceEvent: e
            }
        }))
    }
    onInputFocus_() {
        this.focused_ = true
    }
    onInputBlur_() {
        this.focused_ = false
    }
    select(start, end) {
        this.inputElement.focus();
        if (start !== undefined && end !== undefined) {
            this.inputElement.setSelectionRange(start, end)
        } else {
            assert(start === undefined && end === undefined);
            this.inputElement.select()
        }
    }
    validate() {
        this.invalid = !this.inputElement.checkValidity();
        return !this.invalid
    }
}
customElements.define(CrInputElement.is, CrInputElement);
// Copyright 2020 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
function skColorToRgba(skColor) {
    const a = skColor.value >> 24 & 255;
    const r = skColor.value >> 16 & 255;
    const g = skColor.value >> 8 & 255;
    const b = skColor.value & 255;
    return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`
}
function hexColorToSkColor(hexColor) {
    if (!/^#[0-9a-f]{6}$/.test(hexColor)) {
        return {
            value: 0
        }
    }
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);
    return {
        value: 4278190080 + (r << 16) + (g << 8) + b
    }
}
// Copyright 2011 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
class EventTracker {
    constructor() {
        this.listeners_ = []
    }
    add(target, eventType, listener, capture=false) {
        const h = {
            target: target,
            eventType: eventType,
            listener: listener,
            capture: capture
        };
        this.listeners_.push(h);
        target.addEventListener(eventType, listener, capture)
    }
    remove(target, eventType) {
        this.listeners_ = this.listeners_.filter((listener=>{
            if (listener.target === target && (!eventType || listener.eventType === eventType)) {
                EventTracker.removeEventListener(listener);
                return false
            }
            return true
        }
        ))
    }
    removeAll() {
        this.listeners_.forEach((listener=>EventTracker.removeEventListener(listener)));
        this.listeners_ = []
    }
    static removeEventListener(entry) {
        entry.target.removeEventListener(entry.eventType, entry.listener, entry.capture)
    }
}
// Copyright 2021 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
let instance$1 = null;
class NewTabPageProxy {
    static getInstance() {
        if (!instance$1) {
            const handler = new PageHandlerRemote;
            const callbackRouter = new PageCallbackRouter;
            PageHandlerFactory.getRemote().createPageHandler(callbackRouter.$.bindNewPipeAndPassRemote(), handler.$.bindNewPipeAndPassReceiver());
            instance$1 = new NewTabPageProxy(handler,callbackRouter)
        }
        return instance$1
    }
    static setInstance(handler, callbackRouter) {
        instance$1 = new NewTabPageProxy(handler,callbackRouter)
    }
    constructor(handler, callbackRouter) {
        this.handler = handler;
        this.callbackRouter = callbackRouter
    }
}
/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
Polymer({
    is: "iron-iconset-svg",
    properties: {
        name: {
            type: String,
            observer: "_nameChanged"
        },
        size: {
            type: Number,
            value: 24
        },
        rtlMirroring: {
            type: Boolean,
            value: false
        },
        useGlobalRtlAttribute: {
            type: Boolean,
            value: false
        }
    },
    created: function() {
        this._meta = new IronMeta({
            type: "iconset",
            key: null,
            value: null
        })
    },
    attached: function() {
        this.style.display = "none"
    },
    getIconNames: function() {
        this._icons = this._createIconMap();
        return Object.keys(this._icons).map((function(n) {
            return this.name + ":" + n
        }
        ), this)
    },
    applyIcon: function(element, iconName) {
        this.removeIcon(element);
        var svg = this._cloneIcon(iconName, this.rtlMirroring && this._targetIsRTL(element));
        if (svg) {
            var pde = dom(element.root || element);
            pde.insertBefore(svg, pde.childNodes[0]);
            return element._svgIcon = svg
        }
        return null
    },
    createIcon: function(iconName, targetIsRTL) {
        return this._cloneIcon(iconName, this.rtlMirroring && targetIsRTL)
    },
    removeIcon: function(element) {
        if (element._svgIcon) {
            dom(element.root || element).removeChild(element._svgIcon);
            element._svgIcon = null
        }
    },
    _targetIsRTL: function(target) {
        if (this.__targetIsRTL == null) {
            if (this.useGlobalRtlAttribute) {
                var globalElement = document.body && document.body.hasAttribute("dir") ? document.body : document.documentElement;
                this.__targetIsRTL = globalElement.getAttribute("dir") === "rtl"
            } else {
                if (target && target.nodeType !== Node.ELEMENT_NODE) {
                    target = target.host
                }
                this.__targetIsRTL = target && window.getComputedStyle(target)["direction"] === "rtl"
            }
        }
        return this.__targetIsRTL
    },
    _nameChanged: function() {
        this._meta.value = null;
        this._meta.key = this.name;
        this._meta.value = this;
        this.async((function() {
            this.fire("iron-iconset-added", this, {
                node: window
            })
        }
        ))
    },
    _createIconMap: function() {
        var icons = Object.create(null);
        dom(this).querySelectorAll("[id]").forEach((function(icon) {
            icons[icon.id] = icon
        }
        ));
        return icons
    },
    _cloneIcon: function(id, mirrorAllowed) {
        this._icons = this._icons || this._createIconMap();
        return this._prepareSvgClone(this._icons[id], this.size, mirrorAllowed)
    },
    _prepareSvgClone: function(sourceSvg, size, mirrorAllowed) {
        if (sourceSvg) {
            var content = sourceSvg.cloneNode(true)
              , svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
              , viewBox = content.getAttribute("viewBox") || "0 0 " + size + " " + size
              , cssText = "pointer-events: none; display: block; width: 100%; height: 100%;";
            if (mirrorAllowed && content.hasAttribute("mirror-in-rtl")) {
                cssText += "-webkit-transform:scale(-1,1);transform:scale(-1,1);transform-origin:center;"
            }
            svg.setAttribute("viewBox", viewBox);
            svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
            svg.setAttribute("focusable", "false");
            svg.style.cssText = cssText;
            svg.appendChild(content).removeAttribute("id");
            return svg
        }
        return null
    }
});
const template$1 = html`
<iron-iconset-svg name="cr20" size="20">
  <svg>
    <defs>
      
      <g id="block">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM2 10C2 5.58 5.58 2 10 2C11.85 2 13.55 2.63 14.9 3.69L3.69 14.9C2.63 13.55 2 11.85 2 10ZM5.1 16.31C6.45 17.37 8.15 18 10 18C14.42 18 18 14.42 18 10C18 8.15 17.37 6.45 16.31 5.1L5.1 16.31Z">
        </path>
      </g>
      <g id="cloud-off">
        <path d="M16 18.125L13.875 16H5C3.88889 16 2.94444 15.6111 2.16667 14.8333C1.38889 14.0556 1 13.1111 1 12C1 10.9444 1.36111 10.0347 2.08333 9.27083C2.80556 8.50694 3.6875 8.09028 4.72917 8.02083C4.77083 7.86805 4.8125 7.72222 4.85417 7.58333C4.90972 7.44444 4.97222 7.30555 5.04167 7.16667L1.875 4L2.9375 2.9375L17.0625 17.0625L16 18.125ZM5 14.5H12.375L6.20833 8.33333C6.15278 8.51389 6.09722 8.70139 6.04167 8.89583C6 9.07639 5.95139 9.25694 5.89583 9.4375L4.83333 9.52083C4.16667 9.57639 3.61111 9.84028 3.16667 10.3125C2.72222 10.7708 2.5 11.3333 2.5 12C2.5 12.6944 2.74306 13.2847 3.22917 13.7708C3.71528 14.2569 4.30556 14.5 5 14.5ZM17.5 15.375L16.3958 14.2917C16.7153 14.125 16.9792 13.8819 17.1875 13.5625C17.3958 13.2431 17.5 12.8889 17.5 12.5C17.5 11.9444 17.3056 11.4722 16.9167 11.0833C16.5278 10.6944 16.0556 10.5 15.5 10.5H14.125L14 9.14583C13.9028 8.11806 13.4722 7.25694 12.7083 6.5625C11.9444 5.85417 11.0417 5.5 10 5.5C9.65278 5.5 9.31944 5.54167 9 5.625C8.69444 5.70833 8.39583 5.82639 8.10417 5.97917L7.02083 4.89583C7.46528 4.61806 7.93056 4.40278 8.41667 4.25C8.91667 4.08333 9.44444 4 10 4C11.4306 4 12.6736 4.48611 13.7292 5.45833C14.7847 6.41667 15.375 7.59722 15.5 9C16.4722 9 17.2986 9.34028 17.9792 10.0208C18.6597 10.7014 19 11.5278 19 12.5C19 13.0972 18.8611 13.6458 18.5833 14.1458C18.3194 14.6458 17.9583 15.0556 17.5 15.375Z">
        </path>
      </g>
      <g id="domain">
        <path d="M2,3 L2,17 L11.8267655,17 L13.7904799,17 L18,17 L18,7 L12,7 L12,3 L2,3 Z M8,13 L10,13 L10,15 L8,15 L8,13 Z M4,13 L6,13 L6,15 L4,15 L4,13 Z M8,9 L10,9 L10,11 L8,11 L8,9 Z M4,9 L6,9 L6,11 L4,11 L4,9 Z M12,9 L16,9 L16,15 L12,15 L12,9 Z M12,11 L14,11 L14,13 L12,13 L12,11 Z M8,5 L10,5 L10,7 L8,7 L8,5 Z M4,5 L6,5 L6,7 L4,7 L4,5 Z">
        </path>
      </g>
      <g id="kite">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M4.6327 8.00094L10.3199 2L16 8.00094L10.1848 16.8673C10.0995 16.9873 10.0071 17.1074 9.90047 17.2199C9.42417 17.7225 8.79147 18 8.11611 18C7.44076 18 6.80806 17.7225 6.33175 17.2199C5.85545 16.7173 5.59242 16.0497 5.59242 15.3371C5.59242 14.977 5.46445 14.647 5.22275 14.3919C4.98104 14.1369 4.66825 14.0019 4.32701 14.0019H4V12.6667H4.32701C5.00237 12.6667 5.63507 12.9442 6.11137 13.4468C6.58768 13.9494 6.85071 14.617 6.85071 15.3296C6.85071 15.6896 6.97867 16.0197 7.22038 16.2747C7.46209 16.5298 7.77488 16.6648 8.11611 16.6648C8.45735 16.6648 8.77014 16.5223 9.01185 16.2747C9.02396 16.2601 9.03607 16.246 9.04808 16.2319C9.08541 16.1883 9.12176 16.1458 9.15403 16.0947L9.55213 15.4946L4.6327 8.00094ZM10.3199 13.9371L6.53802 8.17116L10.3199 4.1814L14.0963 8.17103L10.3199 13.9371Z">
        </path>
      </g>
      <g id="menu">
        <path d="M2 4h16v2H2zM2 9h16v2H2zM2 14h16v2H2z"></path>
      </g>
      
  </defs></svg>
</iron-iconset-svg>


<iron-iconset-svg name="cr" size="24">
  <svg>
    <defs>
      
      <g id="account-child-invert" viewBox="0 0 48 48">
        <path d="M24 4c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6z"></path>
        <path fill="none" d="M0 0h48v48H0V0z"></path>
        <circle fill="none" cx="24" cy="26" r="4"></circle>
        <path d="M24 18c-6.16 0-13 3.12-13 7.23v11.54c0 2.32 2.19 4.33 5.2 5.63 2.32 1 5.12 1.59 7.8 1.59.66 0 1.33-.06 2-.14v-5.2c-.67.08-1.34.14-2 .14-2.63 0-5.39-.57-7.68-1.55.67-2.12 4.34-3.65 7.68-3.65.86 0 1.75.11 2.6.29 2.79.62 5.2 2.15 5.2 4.04v4.47c3.01-1.31 5.2-3.31 5.2-5.63V25.23C37 21.12 30.16 18 24 18zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z">
        </path>
      </g>
      <g id="add">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </g>
      <g id="arrow-back">
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z">
        </path>
      </g>
      <g id="arrow-drop-up">
        <path d="M7 14l5-5 5 5z"></path>
      </g>
      <g id="arrow-drop-down">
        <path d="M7 10l5 5 5-5z"></path>
      </g>
      <g id="arrow-forward">
        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z">
        </path>
      </g>
      <g id="arrow-right">
        <path d="M10 7l5 5-5 5z"></path>
      </g>
      
      <g id="cancel">
        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z">
        </path>
      </g>
      <g id="check">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
      </g>
      <g id="check-circle">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z">
        </path>
      </g>
      <g id="chevron-left">
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
      </g>
      <g id="chevron-right">
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
      </g>
      <g id="clear">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z">
        </path>
      </g>
      <g id="close">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z">
        </path>
      </g>
      <g id="computer">
        <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z">
        </path>
      </g>
      <g id="create">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z">
        </path>
      </g>
      <g id="delete">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z">
        </path>
      </g>
      <g id="domain">
        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z">
        </path>
      </g>
      <g id="error">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z">
        </path>
      </g>
      <g id="error-outline">
        <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z">
        </path>
      </g>
      <g id="expand-less">
        <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"></path>
      </g>
      <g id="expand-more">
        <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"></path>
      </g>
      <g id="extension">
        <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z">
        </path>
      </g>
      <g id="file-download">
        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path>
      </g>
      
      <g id="fullscreen">
        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z">
        </path>
      </g>
      <g id="group">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z">
        </path>
      </g>
      <g id="help-outline">
        <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z">
        </path>
      </g>
      <g id="history">
        <path d="M12.945312 22.75 C 10.320312 22.75 8.074219 21.839844 6.207031 20.019531 C 4.335938 18.199219 3.359375 15.972656 3.269531 13.34375 L 5.089844 13.34375 C 5.175781 15.472656 5.972656 17.273438 7.480469 18.742188 C 8.988281 20.210938 10.808594 20.945312 12.945312 20.945312 C 15.179688 20.945312 17.070312 20.164062 18.621094 18.601562 C 20.167969 17.039062 20.945312 15.144531 20.945312 12.910156 C 20.945312 10.714844 20.164062 8.855469 18.601562 7.335938 C 17.039062 5.816406 15.15625 5.054688 12.945312 5.054688 C 11.710938 5.054688 10.554688 5.339844 9.480469 5.902344 C 8.402344 6.46875 7.476562 7.226562 6.699219 8.179688 L 9.585938 8.179688 L 9.585938 9.984375 L 3.648438 9.984375 L 3.648438 4.0625 L 5.453125 4.0625 L 5.453125 6.824219 C 6.386719 5.707031 7.503906 4.828125 8.804688 4.199219 C 10.109375 3.566406 11.488281 3.25 12.945312 3.25 C 14.300781 3.25 15.570312 3.503906 16.761719 4.011719 C 17.949219 4.519531 18.988281 5.214844 19.875 6.089844 C 20.761719 6.964844 21.464844 7.992188 21.976562 9.167969 C 22.492188 10.34375 22.75 11.609375 22.75 12.964844 C 22.75 14.316406 22.492188 15.589844 21.976562 16.777344 C 21.464844 17.964844 20.761719 19.003906 19.875 19.882812 C 18.988281 20.765625 17.949219 21.464844 16.761719 21.976562 C 15.570312 22.492188 14.300781 22.75 12.945312 22.75 Z M 16.269531 17.460938 L 12.117188 13.34375 L 12.117188 7.527344 L 13.921875 7.527344 L 13.921875 12.601562 L 17.550781 16.179688 Z M 16.269531 17.460938">
        </path>
      </g>
      <g id="info">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z">
        </path>
      </g>
      <g id="info-outline">
        <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z">
        </path>
      </g>
      <g id="insert-drive-file">
        <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z">
        </path>
      </g>
      <g id="location-on">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z">
        </path>
      </g>
      <g id="mic">
        <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z">
        </path>
      </g>
      <g id="more-vert">
        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z">
        </path>
      </g>
      <g id="open-in-new">
        <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z">
        </path>
      </g>
      <g id="person">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z">
        </path>
      </g>
      <g id="phonelink">
        <path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z">
        </path>
      </g>
      <g id="print">
        <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z">
        </path>
      </g>
      <g id="schedule">
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z">
        </path>
      </g>
      <g id="search">
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z">
        </path>
      </g>
      <g id="security">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z">
        </path>
      </g>
      
      
      <g id="settings_icon">
        <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z">
        </path>
      </g>
      <g id="star">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z">
        </path>
      </g>
      <g id="sync">
        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z">
        </path>
      </g>
      <g id="thumbs-down">
        <path d="M6 3h11v13l-7 7-1.25-1.25a1.454 1.454 0 0 1-.3-.475c-.067-.2-.1-.392-.1-.575v-.35L9.45 16H3c-.533 0-1-.2-1.4-.6-.4-.4-.6-.867-.6-1.4v-2c0-.117.017-.242.05-.375s.067-.258.1-.375l3-7.05c.15-.333.4-.617.75-.85C5.25 3.117 5.617 3 6 3Zm9 2H6l-3 7v2h9l-1.35 5.5L15 15.15V5Zm0 10.15V5v10.15Zm2 .85v-2h3V5h-3V3h5v13h-5Z">
        </path>
      </g>
      <g id="thumbs-up">
        <path d="M18 21H7V8l7-7 1.25 1.25c.117.117.208.275.275.475.083.2.125.392.125.575v.35L14.55 8H21c.533 0 1 .2 1.4.6.4.4.6.867.6 1.4v2c0 .117-.017.242-.05.375s-.067.258-.1.375l-3 7.05c-.15.333-.4.617-.75.85-.35.233-.717.35-1.1.35Zm-9-2h9l3-7v-2h-9l1.35-5.5L9 8.85V19ZM9 8.85V19 8.85ZM7 8v2H4v9h3v2H2V8h5Z">
        </path>
      </g>
      <g id="videocam">
        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z">
        </path>
      </g>
      <g id="warning">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"></path>
      </g>
    </defs>
  </svg>
</iron-iconset-svg>
`;
document.head.appendChild(template$1.content);
const template = html`<iron-iconset-svg name="iph" size="24">
  <svg>
    <defs>
      
      <g id="celebration">
        <path fill="none" d="M0 0h20v20H0z"></path>
        <path fill-rule="evenodd" d="m2 22 14-5-9-9-5 14Zm10.35-5.82L5.3 18.7l2.52-7.05 4.53 4.53ZM14.53 12.53l5.59-5.59a1.25 1.25 0 0 1 1.77 0l.59.59 1.06-1.06-.59-.59a2.758 2.758 0 0 0-3.89 0l-5.59 5.59 1.06 1.06ZM10.06 6.88l-.59.59 1.06 1.06.59-.59a2.758 2.758 0 0 0 0-3.89l-.59-.59-1.06 1.07.59.59c.48.48.48 1.28 0 1.76ZM17.06 11.88l-1.59 1.59 1.06 1.06 1.59-1.59a1.25 1.25 0 0 1 1.77 0l1.61 1.61 1.06-1.06-1.61-1.61a2.758 2.758 0 0 0-3.89 0ZM15.06 5.88l-3.59 3.59 1.06 1.06 3.59-3.59a2.758 2.758 0 0 0 0-3.89l-1.59-1.59-1.06 1.06 1.59 1.59c.48.49.48 1.29 0 1.77Z">
        </path>
      </g>
      <g id="lightbulb_outline">
        <path fill="none" d="M0 0h24v24H0z"></path>
        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2 11.7V16h-4v-2.3C8.48 12.63 7 11.53 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.49-1.51 3.65-3 4.7z">
        </path>
      </g>
      <g id="lightbulb_outline_chrome_refresh" width="20" height="20" viewBox="0 -960 960 960">
        <path d="M479.779-81.413q-30.975 0-52.812-22.704-21.837-22.704-21.837-55.035h149.74q0 32.631-22.058 55.185-22.058 22.554-53.033 22.554ZM333.848-209.065v-75.587h292.304v75.587H333.848Zm-15-125.5Q254.696-374 219.282-440.533q-35.413-66.532-35.413-142.163 0-123.288 86.364-209.59 86.363-86.301 209.739-86.301t209.767 86.301q86.392 86.302 86.392 209.59 0 75.87-35.413 142.283Q705.304-374 641.152-334.565H318.848Zm26.348-83h269.608q37.283-30.522 57.805-73.566 20.521-43.043 20.521-91.512 0-89.424-61.812-151.184-61.813-61.76-151.087-61.76-89.274 0-151.318 61.76-62.043 61.76-62.043 151.184 0 48.469 20.521 91.512 20.522 43.044 57.805 73.566Zm134.804 0Z">
        </path>
      </g>
  </defs>
  </svg>
</iron-iconset-svg>
`;
document.head.appendChild(template.content);
function getTemplate$1() {
    return html`<!--_html_template_start_--><link rel="stylesheet" href="chrome://theme/colors.css?sets=ui,chrome&shadow_host=true">
<style include="cr-hidden-style">:host{--help-bubble-background:var(--color-feature-promo-bubble-background,
        var(--google-blue-700));--help-bubble-foreground:var(--color-feature-promo-bubble-foreground,
        var(--google-grey-200));--help-bubble-border-radius:8px;--help-bubble-close-button-icon-size:16px;--help-bubble-close-button-size:24px;--help-bubble-element-spacing:8px;--help-bubble-padding:16px 20px;--help-bubble-font-weight:500;border-radius:var(--help-bubble-border-radius);box-shadow:0 6px 10px 4px rgba(60,64,67,.15),0 2px 3px rgba(60,64,67,.3);box-sizing:border-box;position:absolute;z-index:1}:host-context([chrome-refresh-2023]):host{--help-bubble-border-radius:12px;--help-bubble-close-button-size:20px;--help-bubble-padding:20px;--help-bubble-font-weight:400}#arrow{--help-bubble-arrow-size:11.3px;--help-bubble-arrow-size-half:calc(var(--help-bubble-arrow-size) / 2);--help-bubble-arrow-diameter:16px;--help-bubble-arrow-radius:calc(var(--help-bubble-arrow-diameter) / 2);--help-bubble-arrow-edge-offset:22px;--help-bubble-arrow-offset:calc(var(--help-bubble-arrow-edge-offset) +
                                     var(--help-bubble-arrow-radius));--help-bubble-arrow-border-radius:2px;position:absolute}#inner-arrow{background-color:var(--help-bubble-background);height:var(--help-bubble-arrow-size);left:calc(0px - var(--help-bubble-arrow-size-half));position:absolute;top:calc(0px - var(--help-bubble-arrow-size-half));transform:rotate(45deg);width:var(--help-bubble-arrow-size);z-index:-1}#arrow.bottom-edge{bottom:0}#arrow.bottom-edge #inner-arrow{border-bottom-right-radius:var(--help-bubble-arrow-border-radius)}#arrow.top-edge{top:0}#arrow.top-edge #inner-arrow{border-top-left-radius:var(--help-bubble-arrow-border-radius)}#arrow.right-edge{right:0}#arrow.right-edge #inner-arrow{border-top-right-radius:var(--help-bubble-arrow-border-radius)}#arrow.left-edge{left:0}#arrow.left-edge #inner-arrow{border-bottom-left-radius:var(--help-bubble-arrow-border-radius)}#arrow.top-position{top:var(--help-bubble-arrow-offset)}#arrow.vertical-center-position{top:50%}#arrow.bottom-position{bottom:var(--help-bubble-arrow-offset)}#arrow.left-position{left:var(--help-bubble-arrow-offset)}#arrow.horizontal-center-position{left:50%}#arrow.right-position{right:var(--help-bubble-arrow-offset)}#topContainer{display:flex;flex-direction:row}#progress{display:inline-block;flex:auto}#progress div{--help-bubble-progress-size:8px;background-color:var(--help-bubble-foreground);border:1px solid var(--help-bubble-foreground);border-radius:50%;display:inline-block;height:var(--help-bubble-progress-size);margin-inline-end:var(--help-bubble-element-spacing);margin-top:5px;width:var(--help-bubble-progress-size)}#progress .total-progress{background-color:var(--help-bubble-background)}#mainBody,#topBody{flex:1;font-size:14px;font-style:normal;font-weight:var(--help-bubble-font-weight);letter-spacing:.3px;line-height:20px;margin:0}#title{flex:1;font-size:18px;font-style:normal;font-weight:500;line-height:24px;margin:0}.help-bubble{--cr-focus-outline-color:var(--help-bubble-foreground);background-color:var(--help-bubble-background);border-radius:var(--help-bubble-border-radius);box-sizing:border-box;color:var(--help-bubble-foreground);display:flex;flex-direction:column;justify-content:space-between;max-width:340px;min-width:260px;padding:var(--help-bubble-padding);position:relative}#main{display:flex;flex-direction:row;justify-content:flex-start;margin-top:var(--help-bubble-element-spacing)}#middleRowSpacer{margin-inline-start:32px}cr-button,cr-icon-button{--help-bubble-button-foreground:var(--help-bubble-foreground);--help-bubble-button-background:var(--help-bubble-background);--help-bubble-button-hover-alpha:10%}cr-button.default-button{--help-bubble-button-foreground:var(
        --color-feature-promo-bubble-default-button-foreground,
        var(--help-bubble-background));--help-bubble-button-background:var(
        --color-feature-promo-bubble-default-button-background,
        var(--help-bubble-foreground));--help-bubble-button-hover-alpha:6%}@media (prefers-color-scheme:dark){cr-button,cr-icon-button{--help-bubble-button-hover-alpha:6%}cr-button.default-button{--help-bubble-button-hover-alpha:10%}}#buttons cr-button:hover,cr-icon-button:hover{background-color:color-mix(in srgb,var(--help-bubble-button-foreground) var(--help-bubble-button-hover-alpha),var(--help-bubble-button-background))}cr-icon-button{--cr-icon-button-fill-color:var(--help-bubble-button-foreground);--cr-icon-button-icon-size:var(--help-bubble-close-button-icon-size);--cr-icon-button-size:var(--help-bubble-close-button-size);--cr-icon-button-stroke-color:var(--help-bubble-button-foreground);box-sizing:border-box;display:block;flex:none;float:right;height:var(--cr-icon-button-size);margin:0;margin-inline-start:var(--help-bubble-element-spacing);order:2;width:var(--cr-icon-button-size)}cr-icon-button:focus-visible:focus{box-shadow:inset 0 0 0 1px var(--cr-focus-outline-color)}#bodyIcon{--help-bubble-body-icon-image-size:18px;--help-bubble-body-icon-size:24px;--iron-icon-height:var(--help-bubble-body-icon-image-size);--iron-icon-width:var(--help-bubble-body-icon-image-size);background-color:var(--help-bubble-foreground);border-radius:50%;box-sizing:border-box;color:var(--help-bubble-background);height:var(--help-bubble-body-icon-size);margin-inline-end:var(--help-bubble-element-spacing);padding:calc((var(--help-bubble-body-icon-size) - var(--help-bubble-body-icon-image-size))/ 2);text-align:center;width:var(--help-bubble-body-icon-size)}#bodyIcon iron-icon{display:block}#buttons{display:flex;flex-direction:row;justify-content:flex-end;margin-top:16px}#buttons cr-button{--border-color:var(--help-bubble-foreground);--text-color:var(--help-bubble-button-foreground);background-color:var(--help-bubble-button-background)}#buttons cr-button:focus{box-shadow:none;outline:2px solid var(--cr-focus-outline-color);outline-offset:1px}#buttons cr-button:not(:first-child){margin-inline-start:var(--help-bubble-element-spacing)}</style>

<div class="help-bubble" role="alertdialog" aria-modal="true" aria-labelledby="title" aria-describedby="body" aria-live="assertive" on-keydown="onKeyDown_" on-click="blockPropagation_">
  <div id="topContainer">
    <div id="bodyIcon" hidden$="[[!shouldShowBodyIcon_(bodyIconName)]]" aria-label$="[[bodyIconAltText]]">
      <iron-icon icon="iph:[[bodyIconName]]"></iron-icon>
    </div>
    <div id="progress" hidden$="[[!progress]]" role="progressbar" aria-valuenow$="[[progress.current]]" aria-valuemin="1" aria-valuemax$="[[progress.total]]">
      <template is="dom-repeat" items="[[progressData_]]">
        <div class$="[[getProgressClass_(index)]]"></div>
      </template>
    </div>
    <h1 id="title" hidden$="[[!shouldShowTitleInTopContainer_(progress, titleText)]]">
      [[titleText]]
    </h1>
    <p id="topBody" hidden$="[[!shouldShowBodyInTopContainer_(progress, titleText)]]">
      [[bodyText]]
    </p>
    <cr-icon-button id="close" iron-icon="cr:close" aria-label$="[[closeButtonAltText]]" on-click="dismiss_" tabindex$="[[closeButtonTabIndex]]">
    </cr-icon-button>
  </div>
  <div id="main" hidden$="[[!shouldShowBodyInMain_(progress, titleText)]]">
    <div id="middleRowSpacer" hidden$="[[!shouldShowBodyIcon_(bodyIconName)]]">
    </div>
    <p id="mainBody">[[bodyText]]</p>
  </div>
  <div id="buttons" hidden$="[[!buttons.length]]">
    <template is="dom-repeat" id="buttonlist" items="[[buttons]]" sort="buttonSortFunc_">
      <cr-button id$="[[getButtonId_(itemsIndex)]]" tabindex$="[[getButtonTabIndex_(itemsIndex, item.isDefault)]]" class$="[[getButtonClass_(item.isDefault)]]" on-click="onButtonClick_" role="button" aria-label="[[item.text]]">[[item.text]]</cr-button>
    </template>
  </div>
  <div id="arrow" class$="[[getArrowClass_(position)]]">
    <div id="inner-arrow"></div>
  </div>
</div>
<!--_html_template_end_-->`
}
// Copyright 2020 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const PointSpec = {
    $: {}
};
const PointFSpec = {
    $: {}
};
const Point3FSpec = {
    $: {}
};
const SizeSpec = {
    $: {}
};
const SizeFSpec = {
    $: {}
};
const RectSpec = {
    $: {}
};
const RectFSpec = {
    $: {}
};
const InsetsSpec = {
    $: {}
};
const InsetsFSpec = {
    $: {}
};
const Vector2dSpec = {
    $: {}
};
const Vector2dFSpec = {
    $: {}
};
const Vector3dFSpec = {
    $: {}
};
const QuaternionSpec = {
    $: {}
};
const QuadFSpec = {
    $: {}
};
mojo.internal.Struct(PointSpec.$, "Point", [mojo.internal.StructField("x", 0, 0, mojo.internal.Int32, 0, false, 0), mojo.internal.StructField("y", 4, 0, mojo.internal.Int32, 0, false, 0)], [[0, 16]]);
mojo.internal.Struct(PointFSpec.$, "PointF", [mojo.internal.StructField("x", 0, 0, mojo.internal.Float, 0, false, 0), mojo.internal.StructField("y", 4, 0, mojo.internal.Float, 0, false, 0)], [[0, 16]]);
mojo.internal.Struct(Point3FSpec.$, "Point3F", [mojo.internal.StructField("x", 0, 0, mojo.internal.Float, 0, false, 0), mojo.internal.StructField("y", 4, 0, mojo.internal.Float, 0, false, 0), mojo.internal.StructField("z", 8, 0, mojo.internal.Float, 0, false, 0)], [[0, 24]]);
mojo.internal.Struct(SizeSpec.$, "Size", [mojo.internal.StructField("width", 0, 0, mojo.internal.Int32, 0, false, 0), mojo.internal.StructField("height", 4, 0, mojo.internal.Int32, 0, false, 0)], [[0, 16]]);
mojo.internal.Struct(SizeFSpec.$, "SizeF", [mojo.internal.StructField("width", 0, 0, mojo.internal.Float, 0, false, 0), mojo.internal.StructField("height", 4, 0, mojo.internal.Float, 0, false, 0)], [[0, 16]]);
mojo.internal.Struct(RectSpec.$, "Rect", [mojo.internal.StructField("x", 0, 0, mojo.internal.Int32, 0, false, 0), mojo.internal.StructField("y", 4, 0, mojo.internal.Int32, 0, false, 0), mojo.internal.StructField("width", 8, 0, mojo.internal.Int32, 0, false, 0), mojo.internal.StructField("height", 12, 0, mojo.internal.Int32, 0, false, 0)], [[0, 24]]);
mojo.internal.Struct(RectFSpec.$, "RectF", [mojo.internal.StructField("x", 0, 0, mojo.internal.Float, 0, false, 0), mojo.internal.StructField("y", 4, 0, mojo.internal.Float, 0, false, 0), mojo.internal.StructField("width", 8, 0, mojo.internal.Float, 0, false, 0), mojo.internal.StructField("height", 12, 0, mojo.internal.Float, 0, false, 0)], [[0, 24]]);
mojo.internal.Struct(InsetsSpec.$, "Insets", [mojo.internal.StructField("top", 0, 0, mojo.internal.Int32, 0, false, 0), mojo.internal.StructField("left", 4, 0, mojo.internal.Int32, 0, false, 0), mojo.internal.StructField("bottom", 8, 0, mojo.internal.Int32, 0, false, 0), mojo.internal.StructField("right", 12, 0, mojo.internal.Int32, 0, false, 0)], [[0, 24]]);
mojo.internal.Struct(InsetsFSpec.$, "InsetsF", [mojo.internal.StructField("top", 0, 0, mojo.internal.Float, 0, false, 0), mojo.internal.StructField("left", 4, 0, mojo.internal.Float, 0, false, 0), mojo.internal.StructField("bottom", 8, 0, mojo.internal.Float, 0, false, 0), mojo.internal.StructField("right", 12, 0, mojo.internal.Float, 0, false, 0)], [[0, 24]]);
mojo.internal.Struct(Vector2dSpec.$, "Vector2d", [mojo.internal.StructField("x", 0, 0, mojo.internal.Int32, 0, false, 0), mojo.internal.StructField("y", 4, 0, mojo.internal.Int32, 0, false, 0)], [[0, 16]]);
mojo.internal.Struct(Vector2dFSpec.$, "Vector2dF", [mojo.internal.StructField("x", 0, 0, mojo.internal.Float, 0, false, 0), mojo.internal.StructField("y", 4, 0, mojo.internal.Float, 0, false, 0)], [[0, 16]]);
mojo.internal.Struct(Vector3dFSpec.$, "Vector3dF", [mojo.internal.StructField("x", 0, 0, mojo.internal.Float, 0, false, 0), mojo.internal.StructField("y", 4, 0, mojo.internal.Float, 0, false, 0), mojo.internal.StructField("z", 8, 0, mojo.internal.Float, 0, false, 0)], [[0, 24]]);
mojo.internal.Struct(QuaternionSpec.$, "Quaternion", [mojo.internal.StructField("x", 0, 0, mojo.internal.Double, 0, false, 0), mojo.internal.StructField("y", 8, 0, mojo.internal.Double, 0, false, 0), mojo.internal.StructField("z", 16, 0, mojo.internal.Double, 0, false, 0), mojo.internal.StructField("w", 24, 0, mojo.internal.Double, 0, false, 0)], [[0, 40]]);
mojo.internal.Struct(QuadFSpec.$, "QuadF", [mojo.internal.StructField("p1", 0, 0, PointFSpec.$, null, false, 0), mojo.internal.StructField("p2", 8, 0, PointFSpec.$, null, false, 0), mojo.internal.StructField("p3", 16, 0, PointFSpec.$, null, false, 0), mojo.internal.StructField("p4", 24, 0, PointFSpec.$, null, false, 0)], [[0, 40]]);
// Copyright 2020 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const HelpBubbleArrowPositionSpec = {
    $: mojo.internal.Enum()
};
var HelpBubbleArrowPosition;
(function(HelpBubbleArrowPosition) {
    HelpBubbleArrowPosition[HelpBubbleArrowPosition["MIN_VALUE"] = 0] = "MIN_VALUE";
    HelpBubbleArrowPosition[HelpBubbleArrowPosition["MAX_VALUE"] = 11] = "MAX_VALUE";
    HelpBubbleArrowPosition[HelpBubbleArrowPosition["TOP_LEFT"] = 0] = "TOP_LEFT";
    HelpBubbleArrowPosition[HelpBubbleArrowPosition["TOP_CENTER"] = 1] = "TOP_CENTER";
    HelpBubbleArrowPosition[HelpBubbleArrowPosition["TOP_RIGHT"] = 2] = "TOP_RIGHT";
    HelpBubbleArrowPosition[HelpBubbleArrowPosition["BOTTOM_LEFT"] = 3] = "BOTTOM_LEFT";
    HelpBubbleArrowPosition[HelpBubbleArrowPosition["BOTTOM_CENTER"] = 4] = "BOTTOM_CENTER";
    HelpBubbleArrowPosition[HelpBubbleArrowPosition["BOTTOM_RIGHT"] = 5] = "BOTTOM_RIGHT";
    HelpBubbleArrowPosition[HelpBubbleArrowPosition["LEFT_TOP"] = 6] = "LEFT_TOP";
    HelpBubbleArrowPosition[HelpBubbleArrowPosition["LEFT_CENTER"] = 7] = "LEFT_CENTER";
    HelpBubbleArrowPosition[HelpBubbleArrowPosition["LEFT_BOTTOM"] = 8] = "LEFT_BOTTOM";
    HelpBubbleArrowPosition[HelpBubbleArrowPosition["RIGHT_TOP"] = 9] = "RIGHT_TOP";
    HelpBubbleArrowPosition[HelpBubbleArrowPosition["RIGHT_CENTER"] = 10] = "RIGHT_CENTER";
    HelpBubbleArrowPosition[HelpBubbleArrowPosition["RIGHT_BOTTOM"] = 11] = "RIGHT_BOTTOM"
}
)(HelpBubbleArrowPosition || (HelpBubbleArrowPosition = {}));
const HelpBubbleClosedReasonSpec = {
    $: mojo.internal.Enum()
};
var HelpBubbleClosedReason;
(function(HelpBubbleClosedReason) {
    HelpBubbleClosedReason[HelpBubbleClosedReason["MIN_VALUE"] = 0] = "MIN_VALUE";
    HelpBubbleClosedReason[HelpBubbleClosedReason["MAX_VALUE"] = 2] = "MAX_VALUE";
    HelpBubbleClosedReason[HelpBubbleClosedReason["kPageChanged"] = 0] = "kPageChanged";
    HelpBubbleClosedReason[HelpBubbleClosedReason["kDismissedByUser"] = 1] = "kDismissedByUser";
    HelpBubbleClosedReason[HelpBubbleClosedReason["kTimedOut"] = 2] = "kTimedOut"
}
)(HelpBubbleClosedReason || (HelpBubbleClosedReason = {}));
class HelpBubbleHandlerFactoryPendingReceiver {
    constructor(handle) {
        this.handle = mojo.internal.interfaceSupport.getEndpointForReceiver(handle)
    }
    bindInBrowser(scope="context") {
        mojo.internal.interfaceSupport.bind(this.handle, "help_bubble.mojom.HelpBubbleHandlerFactory", scope)
    }
}
class HelpBubbleHandlerFactoryRemote {
    constructor(handle) {
        this.proxy = new mojo.internal.interfaceSupport.InterfaceRemoteBase(HelpBubbleHandlerFactoryPendingReceiver,handle);
        this.$ = new mojo.internal.interfaceSupport.InterfaceRemoteBaseWrapper(this.proxy);
        this.onConnectionError = this.proxy.getConnectionErrorEventRouter()
    }
    createHelpBubbleHandler(client, handler) {
        this.proxy.sendMessage(1761209363, HelpBubbleHandlerFactory_CreateHelpBubbleHandler_ParamsSpec.$, null, [client, handler])
    }
}
class HelpBubbleHandlerFactory {
    static get $interfaceName() {
        return "help_bubble.mojom.HelpBubbleHandlerFactory"
    }
    static getRemote() {
        let remote = new HelpBubbleHandlerFactoryRemote;
        remote.$.bindNewPipeAndPassReceiver().bindInBrowser();
        return remote
    }
}
class HelpBubbleHandlerPendingReceiver {
    constructor(handle) {
        this.handle = mojo.internal.interfaceSupport.getEndpointForReceiver(handle)
    }
    bindInBrowser(scope="context") {
        mojo.internal.interfaceSupport.bind(this.handle, "help_bubble.mojom.HelpBubbleHandler", scope)
    }
}
class HelpBubbleHandlerRemote {
    constructor(handle) {
        this.proxy = new mojo.internal.interfaceSupport.InterfaceRemoteBase(HelpBubbleHandlerPendingReceiver,handle);
        this.$ = new mojo.internal.interfaceSupport.InterfaceRemoteBaseWrapper(this.proxy);
        this.onConnectionError = this.proxy.getConnectionErrorEventRouter()
    }
    helpBubbleAnchorVisibilityChanged(nativeIdentifier, visible, rect) {
        this.proxy.sendMessage(1046356149, HelpBubbleHandler_HelpBubbleAnchorVisibilityChanged_ParamsSpec.$, null, [nativeIdentifier, visible, rect])
    }
    helpBubbleAnchorActivated(nativeIdentifier) {
        this.proxy.sendMessage(158250846, HelpBubbleHandler_HelpBubbleAnchorActivated_ParamsSpec.$, null, [nativeIdentifier])
    }
    helpBubbleAnchorCustomEvent(nativeIdentifier, customEventName) {
        this.proxy.sendMessage(2774835, HelpBubbleHandler_HelpBubbleAnchorCustomEvent_ParamsSpec.$, null, [nativeIdentifier, customEventName])
    }
    helpBubbleButtonPressed(nativeIdentifier, buttonIndex) {
        this.proxy.sendMessage(936610295, HelpBubbleHandler_HelpBubbleButtonPressed_ParamsSpec.$, null, [nativeIdentifier, buttonIndex])
    }
    helpBubbleClosed(nativeIdentifier, reason) {
        this.proxy.sendMessage(252616786, HelpBubbleHandler_HelpBubbleClosed_ParamsSpec.$, null, [nativeIdentifier, reason])
    }
}
class HelpBubbleClientPendingReceiver {
    constructor(handle) {
        this.handle = mojo.internal.interfaceSupport.getEndpointForReceiver(handle)
    }
    bindInBrowser(scope="context") {
        mojo.internal.interfaceSupport.bind(this.handle, "help_bubble.mojom.HelpBubbleClient", scope)
    }
}
class HelpBubbleClientRemote {
    constructor(handle) {
        this.proxy = new mojo.internal.interfaceSupport.InterfaceRemoteBase(HelpBubbleClientPendingReceiver,handle);
        this.$ = new mojo.internal.interfaceSupport.InterfaceRemoteBaseWrapper(this.proxy);
        this.onConnectionError = this.proxy.getConnectionErrorEventRouter()
    }
    showHelpBubble(params) {
        this.proxy.sendMessage(1712996118, HelpBubbleClient_ShowHelpBubble_ParamsSpec.$, null, [params])
    }
    toggleFocusForAccessibility(nativeIdentifier) {
        this.proxy.sendMessage(1888558535, HelpBubbleClient_ToggleFocusForAccessibility_ParamsSpec.$, null, [nativeIdentifier])
    }
    hideHelpBubble(nativeIdentifier) {
        this.proxy.sendMessage(1448863486, HelpBubbleClient_HideHelpBubble_ParamsSpec.$, null, [nativeIdentifier])
    }
    externalHelpBubbleUpdated(nativeIdentifier, shown) {
        this.proxy.sendMessage(570919990, HelpBubbleClient_ExternalHelpBubbleUpdated_ParamsSpec.$, null, [nativeIdentifier, shown])
    }
}
class HelpBubbleClientCallbackRouter {
    constructor() {
        this.helper_internal_ = new mojo.internal.interfaceSupport.InterfaceReceiverHelperInternal(HelpBubbleClientRemote);
        this.$ = new mojo.internal.interfaceSupport.InterfaceReceiverHelper(this.helper_internal_);
        this.router_ = new mojo.internal.interfaceSupport.CallbackRouter;
        this.showHelpBubble = new mojo.internal.interfaceSupport.InterfaceCallbackReceiver(this.router_);
        this.helper_internal_.registerHandler(1712996118, HelpBubbleClient_ShowHelpBubble_ParamsSpec.$, null, this.showHelpBubble.createReceiverHandler(false));
        this.toggleFocusForAccessibility = new mojo.internal.interfaceSupport.InterfaceCallbackReceiver(this.router_);
        this.helper_internal_.registerHandler(1888558535, HelpBubbleClient_ToggleFocusForAccessibility_ParamsSpec.$, null, this.toggleFocusForAccessibility.createReceiverHandler(false));
        this.hideHelpBubble = new mojo.internal.interfaceSupport.InterfaceCallbackReceiver(this.router_);
        this.helper_internal_.registerHandler(1448863486, HelpBubbleClient_HideHelpBubble_ParamsSpec.$, null, this.hideHelpBubble.createReceiverHandler(false));
        this.externalHelpBubbleUpdated = new mojo.internal.interfaceSupport.InterfaceCallbackReceiver(this.router_);
        this.helper_internal_.registerHandler(570919990, HelpBubbleClient_ExternalHelpBubbleUpdated_ParamsSpec.$, null, this.externalHelpBubbleUpdated.createReceiverHandler(false));
        this.onConnectionError = this.helper_internal_.getConnectionErrorEventRouter()
    }
    removeListener(id) {
        return this.router_.removeListener(id)
    }
}
const HelpBubbleButtonParamsSpec = {
    $: {}
};
const ProgressSpec = {
    $: {}
};
const HelpBubbleParamsSpec = {
    $: {}
};
const HelpBubbleHandlerFactory_CreateHelpBubbleHandler_ParamsSpec = {
    $: {}
};
const HelpBubbleHandler_HelpBubbleAnchorVisibilityChanged_ParamsSpec = {
    $: {}
};
const HelpBubbleHandler_HelpBubbleAnchorActivated_ParamsSpec = {
    $: {}
};
const HelpBubbleHandler_HelpBubbleAnchorCustomEvent_ParamsSpec = {
    $: {}
};
const HelpBubbleHandler_HelpBubbleButtonPressed_ParamsSpec = {
    $: {}
};
const HelpBubbleHandler_HelpBubbleClosed_ParamsSpec = {
    $: {}
};
const HelpBubbleClient_ShowHelpBubble_ParamsSpec = {
    $: {}
};
const HelpBubbleClient_ToggleFocusForAccessibility_ParamsSpec = {
    $: {}
};
const HelpBubbleClient_HideHelpBubble_ParamsSpec = {
    $: {}
};
const HelpBubbleClient_ExternalHelpBubbleUpdated_ParamsSpec = {
    $: {}
};
mojo.internal.Struct(HelpBubbleButtonParamsSpec.$, "HelpBubbleButtonParams", [mojo.internal.StructField("text", 0, 0, mojo.internal.String, null, false, 0), mojo.internal.StructField("isDefault", 8, 0, mojo.internal.Bool, false, false, 0)], [[0, 24]]);
mojo.internal.Struct(ProgressSpec.$, "Progress", [mojo.internal.StructField("current", 0, 0, mojo.internal.Uint8, 0, false, 0), mojo.internal.StructField("total", 1, 0, mojo.internal.Uint8, 0, false, 0)], [[0, 16]]);
mojo.internal.Struct(HelpBubbleParamsSpec.$, "HelpBubbleParams", [mojo.internal.StructField("nativeIdentifier", 0, 0, mojo.internal.String, null, false, 0), mojo.internal.StructField("position", 8, 0, HelpBubbleArrowPositionSpec.$, HelpBubbleArrowPosition.TOP_CENTER, false, 0), mojo.internal.StructField("titleText", 16, 0, mojo.internal.String, null, true, 0), mojo.internal.StructField("bodyText", 24, 0, mojo.internal.String, null, false, 0), mojo.internal.StructField("closeButtonAltText", 32, 0, mojo.internal.String, null, false, 0), mojo.internal.StructField("bodyIconName", 40, 0, mojo.internal.String, null, true, 0), mojo.internal.StructField("bodyIconAltText", 48, 0, mojo.internal.String, null, false, 0), mojo.internal.StructField("progress", 56, 0, ProgressSpec.$, null, true, 0), mojo.internal.StructField("buttons", 64, 0, mojo.internal.Array(HelpBubbleButtonParamsSpec.$, false), null, false, 0), mojo.internal.StructField("timeout", 72, 0, TimeDeltaSpec.$, null, true, 0)], [[0, 88]]);
mojo.internal.Struct(HelpBubbleHandlerFactory_CreateHelpBubbleHandler_ParamsSpec.$, "HelpBubbleHandlerFactory_CreateHelpBubbleHandler_Params", [mojo.internal.StructField("client", 0, 0, mojo.internal.InterfaceProxy(HelpBubbleClientRemote), null, false, 0), mojo.internal.StructField("handler", 8, 0, mojo.internal.InterfaceRequest(HelpBubbleHandlerPendingReceiver), null, false, 0)], [[0, 24]]);
mojo.internal.Struct(HelpBubbleHandler_HelpBubbleAnchorVisibilityChanged_ParamsSpec.$, "HelpBubbleHandler_HelpBubbleAnchorVisibilityChanged_Params", [mojo.internal.StructField("nativeIdentifier", 0, 0, mojo.internal.String, null, false, 0), mojo.internal.StructField("visible", 8, 0, mojo.internal.Bool, false, false, 0), mojo.internal.StructField("rect", 16, 0, RectFSpec.$, null, false, 0)], [[0, 32]]);
mojo.internal.Struct(HelpBubbleHandler_HelpBubbleAnchorActivated_ParamsSpec.$, "HelpBubbleHandler_HelpBubbleAnchorActivated_Params", [mojo.internal.StructField("nativeIdentifier", 0, 0, mojo.internal.String, null, false, 0)], [[0, 16]]);
mojo.internal.Struct(HelpBubbleHandler_HelpBubbleAnchorCustomEvent_ParamsSpec.$, "HelpBubbleHandler_HelpBubbleAnchorCustomEvent_Params", [mojo.internal.StructField("nativeIdentifier", 0, 0, mojo.internal.String, null, false, 0), mojo.internal.StructField("customEventName", 8, 0, mojo.internal.String, null, false, 0)], [[0, 24]]);
mojo.internal.Struct(HelpBubbleHandler_HelpBubbleButtonPressed_ParamsSpec.$, "HelpBubbleHandler_HelpBubbleButtonPressed_Params", [mojo.internal.StructField("nativeIdentifier", 0, 0, mojo.internal.String, null, false, 0), mojo.internal.StructField("buttonIndex", 8, 0, mojo.internal.Uint8, 0, false, 0)], [[0, 24]]);
mojo.internal.Struct(HelpBubbleHandler_HelpBubbleClosed_ParamsSpec.$, "HelpBubbleHandler_HelpBubbleClosed_Params", [mojo.internal.StructField("nativeIdentifier", 0, 0, mojo.internal.String, null, false, 0), mojo.internal.StructField("reason", 8, 0, HelpBubbleClosedReasonSpec.$, 0, false, 0)], [[0, 24]]);
mojo.internal.Struct(HelpBubbleClient_ShowHelpBubble_ParamsSpec.$, "HelpBubbleClient_ShowHelpBubble_Params", [mojo.internal.StructField("params", 0, 0, HelpBubbleParamsSpec.$, null, false, 0)], [[0, 16]]);
mojo.internal.Struct(HelpBubbleClient_ToggleFocusForAccessibility_ParamsSpec.$, "HelpBubbleClient_ToggleFocusForAccessibility_Params", [mojo.internal.StructField("nativeIdentifier", 0, 0, mojo.internal.String, null, false, 0)], [[0, 16]]);
mojo.internal.Struct(HelpBubbleClient_HideHelpBubble_ParamsSpec.$, "HelpBubbleClient_HideHelpBubble_Params", [mojo.internal.StructField("nativeIdentifier", 0, 0, mojo.internal.String, null, false, 0)], [[0, 16]]);
mojo.internal.Struct(HelpBubbleClient_ExternalHelpBubbleUpdated_ParamsSpec.$, "HelpBubbleClient_ExternalHelpBubbleUpdated_Params", [mojo.internal.StructField("nativeIdentifier", 0, 0, mojo.internal.String, null, false, 0), mojo.internal.StructField("shown", 8, 0, mojo.internal.Bool, false, false, 0)], [[0, 24]]);
// Copyright 2021 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const ACTION_BUTTON_ID_PREFIX = "action-button-";
const HELP_BUBBLE_DISMISSED_EVENT = "help-bubble-dismissed";
const HELP_BUBBLE_TIMED_OUT_EVENT = "help-bubble-timed-out";
const HELP_BUBBLE_SCROLL_ANCHOR_OPTIONS = {
    behavior: "smooth",
    block: "center"
};
function debounceEnd(fn, time=50) {
    let timerId;
    return ()=>{
        clearTimeout(timerId);
        timerId = setTimeout(fn, time)
    }
}
class HelpBubbleElement extends PolymerElement {
    constructor() {
        super(...arguments);
        this.closeButtonTabIndex = 0;
        this.buttons = [];
        this.progress = null;
        this.timeoutMs = null;
        this.timeoutTimerId = null;
        this.debouncedUpdate = null;
        this.padding = {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        };
        this.fixed = false;
        this.anchorElement_ = null;
        this.progressData_ = [];
        this.resizeObserver_ = null
    }
    static get is() {
        return "help-bubble"
    }
    static get template() {
        return getTemplate$1()
    }
    static get properties() {
        return {
            nativeId: {
                type: String,
                value: "",
                reflectToAttribute: true
            },
            position: {
                type: HelpBubbleArrowPosition,
                value: HelpBubbleArrowPosition.TOP_CENTER,
                reflectToAttribute: true
            }
        }
    }
    show(anchorElement) {
        this.anchorElement_ = anchorElement;
        if (this.progress) {
            this.progressData_ = new Array(this.progress.total)
        } else {
            this.progressData_ = []
        }
        this.closeButtonTabIndex = this.buttons.length ? this.buttons.length + 2 : 1;
        assert(this.anchorElement_, "Tried to show a help bubble but anchorElement does not exist");
        this.style.display = "block";
        this.style.position = this.fixed ? "fixed" : "absolute";
        this.removeAttribute("aria-hidden");
        this.updatePosition_();
        this.debouncedUpdate = debounceEnd((()=>{
            if (this.anchorElement_) {
                this.updatePosition_()
            }
        }
        ), 50);
        this.$.buttonlist.addEventListener("rendered-item-count-changed", this.debouncedUpdate);
        window.addEventListener("resize", this.debouncedUpdate);
        if (this.timeoutMs !== null) {
            const timedOutCallback = ()=>{
                this.dispatchEvent(new CustomEvent(HELP_BUBBLE_TIMED_OUT_EVENT,{
                    detail: {
                        nativeId: this.nativeId
                    }
                }))
            }
            ;
            this.timeoutTimerId = setTimeout(timedOutCallback, this.timeoutMs)
        }
        if (this.offsetParent && !this.fixed) {
            this.resizeObserver_ = new ResizeObserver((()=>{
                this.updatePosition_();
                this.anchorElement_?.scrollIntoView(HELP_BUBBLE_SCROLL_ANCHOR_OPTIONS)
            }
            ));
            this.resizeObserver_.observe(this.offsetParent)
        }
    }
    hide() {
        if (this.resizeObserver_) {
            this.resizeObserver_.disconnect();
            this.resizeObserver_ = null
        }
        this.style.display = "none";
        this.setAttribute("aria-hidden", "true");
        this.anchorElement_ = null;
        if (this.timeoutTimerId !== null) {
            clearInterval(this.timeoutTimerId);
            this.timeoutTimerId = null
        }
        if (this.debouncedUpdate) {
            window.removeEventListener("resize", this.debouncedUpdate);
            this.$.buttonlist.removeEventListener("rendered-item-count-changed", this.debouncedUpdate);
            this.debouncedUpdate = null
        }
    }
    getAnchorElement() {
        return this.anchorElement_
    }
    getButtonForTesting(buttonIndex) {
        return this.$.buttons.querySelector(`[id="${ACTION_BUTTON_ID_PREFIX + buttonIndex}"]`)
    }
    focus() {
        this.$.buttonlist.render();
        const button = this.$.buttons.querySelector("cr-button.default-button") || this.$.buttons.querySelector("cr-button") || this.$.close;
        assert(button);
        button.focus()
    }
    static isDefaultButtonLeading() {
        return isWindows
    }
    dismiss_() {
        assert(this.nativeId, "Dismiss: expected help bubble to have a native id.");
        this.dispatchEvent(new CustomEvent(HELP_BUBBLE_DISMISSED_EVENT,{
            detail: {
                nativeId: this.nativeId,
                fromActionButton: false
            }
        }))
    }
    onKeyDown_(e) {
        if (e.key === "Escape") {
            e.stopPropagation();
            this.dismiss_()
        }
    }
    blockPropagation_(e) {
        e.stopPropagation()
    }
    getProgressClass_(index) {
        return index < this.progress.current ? "current-progress" : "total-progress"
    }
    shouldShowTitleInTopContainer_(progress, titleText) {
        return !!titleText && !progress
    }
    shouldShowBodyInTopContainer_(progress, titleText) {
        return !progress && !titleText
    }
    shouldShowBodyInMain_(progress, titleText) {
        return !!progress || !!titleText
    }
    shouldShowBodyIcon_(bodyIconName) {
        return bodyIconName !== null && bodyIconName !== ""
    }
    onButtonClick_(e) {
        assert(this.nativeId, "Action button clicked: expected help bubble to have a native ID.");
        const index = parseInt(e.target.id.substring(ACTION_BUTTON_ID_PREFIX.length));
        this.dispatchEvent(new CustomEvent(HELP_BUBBLE_DISMISSED_EVENT,{
            detail: {
                nativeId: this.nativeId,
                fromActionButton: true,
                buttonIndex: index
            }
        }))
    }
    getButtonId_(index) {
        return ACTION_BUTTON_ID_PREFIX + index
    }
    getButtonClass_(isDefault) {
        return isDefault ? "default-button focus-outline-visible" : "focus-outline-visible"
    }
    getButtonTabIndex_(index, isDefault) {
        return isDefault ? 1 : index + 2
    }
    buttonSortFunc_(button1, button2) {
        if (button1.isDefault) {
            return isWindows ? -1 : 1
        }
        if (button2.isDefault) {
            return isWindows ? 1 : -1
        }
        return 0
    }
    getArrowClass_(position) {
        let classList = "";
        switch (position) {
        case HelpBubbleArrowPosition.TOP_LEFT:
        case HelpBubbleArrowPosition.TOP_CENTER:
        case HelpBubbleArrowPosition.TOP_RIGHT:
            classList = "top-edge ";
            break;
        case HelpBubbleArrowPosition.BOTTOM_LEFT:
        case HelpBubbleArrowPosition.BOTTOM_CENTER:
        case HelpBubbleArrowPosition.BOTTOM_RIGHT:
            classList = "bottom-edge ";
            break;
        case HelpBubbleArrowPosition.LEFT_TOP:
        case HelpBubbleArrowPosition.LEFT_CENTER:
        case HelpBubbleArrowPosition.LEFT_BOTTOM:
            classList = "left-edge ";
            break;
        case HelpBubbleArrowPosition.RIGHT_TOP:
        case HelpBubbleArrowPosition.RIGHT_CENTER:
        case HelpBubbleArrowPosition.RIGHT_BOTTOM:
            classList = "right-edge ";
            break;
        default:
            assertNotReached("Unknown help bubble position: " + position)
        }
        switch (position) {
        case HelpBubbleArrowPosition.TOP_LEFT:
        case HelpBubbleArrowPosition.BOTTOM_LEFT:
            classList += "left-position";
            break;
        case HelpBubbleArrowPosition.TOP_CENTER:
        case HelpBubbleArrowPosition.BOTTOM_CENTER:
            classList += "horizontal-center-position";
            break;
        case HelpBubbleArrowPosition.TOP_RIGHT:
        case HelpBubbleArrowPosition.BOTTOM_RIGHT:
            classList += "right-position";
            break;
        case HelpBubbleArrowPosition.LEFT_TOP:
        case HelpBubbleArrowPosition.RIGHT_TOP:
            classList += "top-position";
            break;
        case HelpBubbleArrowPosition.LEFT_CENTER:
        case HelpBubbleArrowPosition.RIGHT_CENTER:
            classList += "vertical-center-position";
            break;
        case HelpBubbleArrowPosition.LEFT_BOTTOM:
        case HelpBubbleArrowPosition.RIGHT_BOTTOM:
            classList += "bottom-position";
            break;
        default:
            assertNotReached("Unknown help bubble position: " + position)
        }
        return classList
    }
    updatePosition_() {
        assert(this.anchorElement_, "Update position: expected valid anchor element.");
        const ANCHOR_OFFSET = 16;
        const ARROW_WIDTH = 16;
        const ARROW_OFFSET_FROM_EDGE = 22 + ARROW_WIDTH / 2;
        const anchorRect = this.anchorElement_.getBoundingClientRect();
        const anchorRectCenter = {
            x: anchorRect.left + anchorRect.width / 2,
            y: anchorRect.top + anchorRect.height / 2
        };
        const helpBubbleRect = this.getBoundingClientRect();
        let offsetX = this.anchorElement_.offsetLeft;
        let offsetY = this.anchorElement_.offsetTop;
        switch (this.position) {
        case HelpBubbleArrowPosition.TOP_LEFT:
        case HelpBubbleArrowPosition.TOP_CENTER:
        case HelpBubbleArrowPosition.TOP_RIGHT:
            offsetY += anchorRect.height + ANCHOR_OFFSET + this.padding.bottom;
            break;
        case HelpBubbleArrowPosition.BOTTOM_LEFT:
        case HelpBubbleArrowPosition.BOTTOM_CENTER:
        case HelpBubbleArrowPosition.BOTTOM_RIGHT:
            offsetY -= helpBubbleRect.height + ANCHOR_OFFSET + this.padding.top;
            break;
        case HelpBubbleArrowPosition.LEFT_TOP:
        case HelpBubbleArrowPosition.LEFT_CENTER:
        case HelpBubbleArrowPosition.LEFT_BOTTOM:
            offsetX += anchorRect.width + ANCHOR_OFFSET + this.padding.right;
            break;
        case HelpBubbleArrowPosition.RIGHT_TOP:
        case HelpBubbleArrowPosition.RIGHT_CENTER:
        case HelpBubbleArrowPosition.RIGHT_BOTTOM:
            offsetX -= helpBubbleRect.width + ANCHOR_OFFSET + this.padding.left;
            break;
        default:
            assertNotReached()
        }
        switch (this.position) {
        case HelpBubbleArrowPosition.TOP_LEFT:
        case HelpBubbleArrowPosition.BOTTOM_LEFT:
            if (anchorRect.left + ARROW_OFFSET_FROM_EDGE > anchorRectCenter.x) {
                offsetX += anchorRect.width / 2 - ARROW_OFFSET_FROM_EDGE
            }
            break;
        case HelpBubbleArrowPosition.TOP_CENTER:
        case HelpBubbleArrowPosition.BOTTOM_CENTER:
            offsetX += anchorRect.width / 2 - helpBubbleRect.width / 2;
            break;
        case HelpBubbleArrowPosition.TOP_RIGHT:
        case HelpBubbleArrowPosition.BOTTOM_RIGHT:
            if (anchorRect.right - ARROW_OFFSET_FROM_EDGE < anchorRectCenter.x) {
                offsetX += anchorRect.width / 2 - helpBubbleRect.width + ARROW_OFFSET_FROM_EDGE
            } else {
                offsetX += anchorRect.width - helpBubbleRect.width
            }
            break;
        case HelpBubbleArrowPosition.LEFT_TOP:
        case HelpBubbleArrowPosition.RIGHT_TOP:
            if (anchorRect.top + ARROW_OFFSET_FROM_EDGE > anchorRectCenter.y) {
                offsetY += anchorRect.height / 2 - ARROW_OFFSET_FROM_EDGE
            }
            break;
        case HelpBubbleArrowPosition.LEFT_CENTER:
        case HelpBubbleArrowPosition.RIGHT_CENTER:
            offsetY += anchorRect.height / 2 - helpBubbleRect.height / 2;
            break;
        case HelpBubbleArrowPosition.LEFT_BOTTOM:
        case HelpBubbleArrowPosition.RIGHT_BOTTOM:
            if (anchorRect.bottom - ARROW_OFFSET_FROM_EDGE < anchorRectCenter.y) {
                offsetY += anchorRect.height / 2 - helpBubbleRect.height + ARROW_OFFSET_FROM_EDGE
            } else {
                offsetY += anchorRect.height - helpBubbleRect.height
            }
            break;
        default:
            assertNotReached()
        }
        this.style.top = offsetY.toString() + "px";
        this.style.left = offsetX.toString() + "px"
    }
}
customElements.define(HelpBubbleElement.is, HelpBubbleElement);
// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const ANCHOR_HIGHLIGHT_CLASS = "help-anchor-highlight";
function isRtlLang(element) {
    return window.getComputedStyle(element).direction === "rtl"
}
function reflectArrowPosition(position) {
    switch (position) {
    case HelpBubbleArrowPosition.TOP_LEFT:
        return HelpBubbleArrowPosition.TOP_RIGHT;
    case HelpBubbleArrowPosition.TOP_RIGHT:
        return HelpBubbleArrowPosition.TOP_LEFT;
    case HelpBubbleArrowPosition.BOTTOM_LEFT:
        return HelpBubbleArrowPosition.BOTTOM_RIGHT;
    case HelpBubbleArrowPosition.BOTTOM_RIGHT:
        return HelpBubbleArrowPosition.BOTTOM_LEFT;
    case HelpBubbleArrowPosition.LEFT_TOP:
        return HelpBubbleArrowPosition.RIGHT_TOP;
    case HelpBubbleArrowPosition.LEFT_CENTER:
        return HelpBubbleArrowPosition.RIGHT_CENTER;
    case HelpBubbleArrowPosition.LEFT_BOTTOM:
        return HelpBubbleArrowPosition.RIGHT_BOTTOM;
    case HelpBubbleArrowPosition.RIGHT_TOP:
        return HelpBubbleArrowPosition.LEFT_TOP;
    case HelpBubbleArrowPosition.RIGHT_CENTER:
        return HelpBubbleArrowPosition.LEFT_CENTER;
    case HelpBubbleArrowPosition.RIGHT_BOTTOM:
        return HelpBubbleArrowPosition.LEFT_BOTTOM;
    default:
        return position
    }
}
class HelpBubbleController {
    constructor(nativeId, root) {
        this.anchor_ = null;
        this.bubble_ = null;
        this.options_ = {
            padding: {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            },
            fixed: false
        };
        this.isBubbleShowing_ = false;
        this.isAnchorVisible_ = false;
        this.lastAnchorBounds_ = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        this.isExternal_ = false;
        assert(nativeId, "HelpBubble: nativeId was not defined when registering help bubble");
        assert(root, "HelpBubble: shadowRoot was not defined when registering help bubble");
        this.nativeId_ = nativeId;
        this.root_ = root
    }
    isBubbleShowing() {
        return this.isBubbleShowing_
    }
    canShowBubble() {
        return this.hasAnchor()
    }
    hasBubble() {
        return !!this.bubble_
    }
    getBubble() {
        return this.bubble_
    }
    hasAnchor() {
        return !!this.anchor_
    }
    getAnchor() {
        return this.anchor_
    }
    getNativeId() {
        return this.nativeId_
    }
    getPadding() {
        return this.options_.padding
    }
    getAnchorVisibility() {
        return this.isAnchorVisible_
    }
    getLastAnchorBounds() {
        return this.lastAnchorBounds_
    }
    updateAnchorVisibility(isVisible, bounds) {
        const changed = isVisible !== this.isAnchorVisible_ || bounds.x !== this.lastAnchorBounds_.x || bounds.y !== this.lastAnchorBounds_.y || bounds.width !== this.lastAnchorBounds_.width || bounds.height !== this.lastAnchorBounds_.height;
        this.isAnchorVisible_ = isVisible;
        this.lastAnchorBounds_ = bounds;
        return changed
    }
    isAnchorFixed() {
        return this.options_.fixed
    }
    isExternal() {
        return this.isExternal_
    }
    updateExternalShowingStatus(isShowing) {
        this.isExternal_ = true;
        this.isBubbleShowing_ = isShowing;
        this.setAnchorHighlight_(isShowing)
    }
    track(trackable, options) {
        assert(!this.anchor_);
        let anchor = null;
        if (typeof trackable === "string") {
            anchor = this.root_.querySelector(trackable)
        } else if (Array.isArray(trackable)) {
            anchor = this.deepQuery(trackable)
        } else if (trackable instanceof HTMLElement) {
            anchor = trackable
        } else {
            assertNotReached("HelpBubble: anchor argument was unrecognized when registering " + "help bubble")
        }
        if (!anchor) {
            return false
        }
        anchor.dataset["nativeId"] = this.nativeId_;
        this.anchor_ = anchor;
        this.options_ = options;
        return true
    }
    deepQuery(selectors) {
        let cur = this.root_;
        for (const selector of selectors) {
            if (cur.shadowRoot) {
                cur = cur.shadowRoot
            }
            const el = cur.querySelector(selector);
            if (!el) {
                return null
            } else {
                cur = el
            }
        }
        return cur
    }
    show() {
        this.isExternal_ = false;
        if (!(this.bubble_ && this.anchor_)) {
            return
        }
        this.bubble_.show(this.anchor_);
        this.isBubbleShowing_ = true;
        this.setAnchorHighlight_(true)
    }
    hide() {
        if (!this.bubble_) {
            return
        }
        this.bubble_.hide();
        this.bubble_.remove();
        this.bubble_ = null;
        this.isBubbleShowing_ = false;
        this.setAnchorHighlight_(false)
    }
    createBubble(params) {
        assert(this.anchor_, "HelpBubble: anchor was not defined when showing help bubble");
        assert(this.anchor_.parentNode, "HelpBubble: anchor element not in DOM");
        this.bubble_ = document.createElement("help-bubble");
        this.bubble_.nativeId = this.nativeId_;
        this.bubble_.position = isRtlLang(this.anchor_) ? reflectArrowPosition(params.position) : params.position;
        this.bubble_.closeButtonAltText = params.closeButtonAltText;
        this.bubble_.bodyText = params.bodyText;
        this.bubble_.bodyIconName = params.bodyIconName || null;
        this.bubble_.bodyIconAltText = params.bodyIconAltText;
        this.bubble_.titleText = params.titleText || "";
        this.bubble_.progress = params.progress || null;
        this.bubble_.buttons = params.buttons;
        this.bubble_.padding = this.options_.padding;
        if (params.timeout) {
            this.bubble_.timeoutMs = Number(params.timeout.microseconds / 1000n);
            assert(this.bubble_.timeoutMs > 0)
        }
        assert(!this.bubble_.progress || this.bubble_.progress.total >= this.bubble_.progress.current);
        assert(this.root_);
        if (getComputedStyle(this.anchor_).getPropertyValue("position") === "fixed") {
            this.bubble_.fixed = true
        }
        this.anchor_.parentNode.insertBefore(this.bubble_, this.anchor_);
        return this.bubble_
    }
    setAnchorHighlight_(highlight) {
        assert(this.anchor_, "Set anchor highlight: expected valid anchor element.");
        this.anchor_.classList.toggle(ANCHOR_HIGHLIGHT_CLASS, highlight);
        if (highlight) {
            (this.bubble_ || this.anchor_).focus();
            this.anchor_.scrollIntoView(HELP_BUBBLE_SCROLL_ANCHOR_OPTIONS)
        }
    }
    static getImmediateAncestor(element) {
        if (element.parentElement) {
            return element.parentElement
        }
        if (element.parentNode instanceof ShadowRoot) {
            return element.parentNode.host
        }
        return null
    }
}
// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
class HelpBubbleProxyImpl {
    constructor() {
        this.callbackRouter_ = new HelpBubbleClientCallbackRouter;
        this.handler_ = new HelpBubbleHandlerRemote;
        const factory = HelpBubbleHandlerFactory.getRemote();
        factory.createHelpBubbleHandler(this.callbackRouter_.$.bindNewPipeAndPassRemote(), this.handler_.$.bindNewPipeAndPassReceiver())
    }
    static getInstance() {
        return instance || (instance = new HelpBubbleProxyImpl)
    }
    static setInstance(obj) {
        instance = obj
    }
    getHandler() {
        return this.handler_
    }
    getCallbackRouter() {
        return this.callbackRouter_
    }
}
let instance = null;
// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const HelpBubbleMixin = dedupingMixin((superClass=>{
    class HelpBubbleMixin extends superClass {
        constructor(...args) {
            super(...args);
            this.helpBubbleControllerById_ = new Map;
            this.helpBubbleListenerIds_ = [];
            this.helpBubbleFixedAnchorObserver_ = null;
            this.helpBubbleResizeObserver_ = null;
            this.helpBubbleDismissedEventTracker_ = new EventTracker;
            this.debouncedAnchorMayHaveChangedCallback_ = null;
            this.helpBubbleHandler_ = HelpBubbleProxyImpl.getInstance().getHandler();
            this.helpBubbleCallbackRouter_ = HelpBubbleProxyImpl.getInstance().getCallbackRouter()
        }
        connectedCallback() {
            super.connectedCallback();
            const router = this.helpBubbleCallbackRouter_;
            this.helpBubbleListenerIds_.push(router.showHelpBubble.addListener(this.onShowHelpBubble_.bind(this)), router.toggleFocusForAccessibility.addListener(this.onToggleHelpBubbleFocusForAccessibility_.bind(this)), router.hideHelpBubble.addListener(this.onHideHelpBubble_.bind(this)), router.externalHelpBubbleUpdated.addListener(this.onExternalHelpBubbleUpdated_.bind(this)));
            const isVisible = element=>{
                const rect = element.getBoundingClientRect();
                return rect.height > 0 && rect.width > 0
            }
            ;
            this.debouncedAnchorMayHaveChangedCallback_ = debounceEnd(this.onAnchorBoundsMayHaveChanged_.bind(this), 50);
            this.helpBubbleResizeObserver_ = new ResizeObserver((entries=>entries.forEach((({target: target})=>{
                if (target === document.body) {
                    if (this.debouncedAnchorMayHaveChangedCallback_) {
                        this.debouncedAnchorMayHaveChangedCallback_()
                    }
                } else {
                    this.onAnchorVisibilityChanged_(target, isVisible(target))
                }
            }
            ))));
            this.helpBubbleFixedAnchorObserver_ = new IntersectionObserver((entries=>entries.forEach((({target: target, isIntersecting: isIntersecting})=>this.onAnchorVisibilityChanged_(target, isIntersecting)))),{
                root: null
            });
            document.addEventListener("scroll", this.debouncedAnchorMayHaveChangedCallback_, {
                passive: true
            });
            this.helpBubbleResizeObserver_.observe(document.body);
            this.controllers.forEach((ctrl=>this.observeControllerAnchor_(ctrl)))
        }
        get controllers() {
            return Array.from(this.helpBubbleControllerById_.values())
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            for (const listenerId of this.helpBubbleListenerIds_) {
                this.helpBubbleCallbackRouter_.removeListener(listenerId)
            }
            this.helpBubbleListenerIds_ = [];
            assert(this.helpBubbleResizeObserver_);
            this.helpBubbleResizeObserver_.disconnect();
            this.helpBubbleResizeObserver_ = null;
            assert(this.helpBubbleFixedAnchorObserver_);
            this.helpBubbleFixedAnchorObserver_.disconnect();
            this.helpBubbleFixedAnchorObserver_ = null;
            this.helpBubbleDismissedEventTracker_.removeAll();
            this.helpBubbleControllerById_.clear();
            if (this.debouncedAnchorMayHaveChangedCallback_) {
                document.removeEventListener("scroll", this.debouncedAnchorMayHaveChangedCallback_);
                this.debouncedAnchorMayHaveChangedCallback_ = null
            }
        }
        registerHelpBubble(nativeId, trackable, options={}) {
            if (this.helpBubbleControllerById_.has(nativeId)) {
                const ctrl = this.helpBubbleControllerById_.get(nativeId);
                if (ctrl && ctrl.isBubbleShowing()) {
                    return null
                }
                this.unregisterHelpBubble(nativeId)
            }
            const controller = new HelpBubbleController(nativeId,this.shadowRoot);
            controller.track(trackable, parseOptions(options));
            this.helpBubbleControllerById_.set(nativeId, controller);
            if (this.helpBubbleResizeObserver_) {
                this.observeControllerAnchor_(controller)
            }
            return controller
        }
        unregisterHelpBubble(nativeId) {
            const ctrl = this.helpBubbleControllerById_.get(nativeId);
            if (ctrl && ctrl.hasAnchor()) {
                this.onAnchorVisibilityChanged_(ctrl.getAnchor(), false);
                this.unobserveControllerAnchor_(ctrl)
            }
            this.helpBubbleControllerById_.delete(nativeId)
        }
        observeControllerAnchor_(controller) {
            const anchor = controller.getAnchor();
            assert(anchor, "Help bubble does not have anchor");
            if (controller.isAnchorFixed()) {
                assert(this.helpBubbleFixedAnchorObserver_);
                this.helpBubbleFixedAnchorObserver_.observe(anchor)
            } else {
                assert(this.helpBubbleResizeObserver_);
                this.helpBubbleResizeObserver_.observe(anchor)
            }
        }
        unobserveControllerAnchor_(controller) {
            const anchor = controller.getAnchor();
            assert(anchor, "Help bubble does not have anchor");
            if (controller.isAnchorFixed()) {
                assert(this.helpBubbleFixedAnchorObserver_);
                this.helpBubbleFixedAnchorObserver_.unobserve(anchor)
            } else {
                assert(this.helpBubbleResizeObserver_);
                this.helpBubbleResizeObserver_.unobserve(anchor)
            }
        }
        isHelpBubbleShowing() {
            return this.controllers.some((ctrl=>ctrl.isBubbleShowing()))
        }
        isHelpBubbleShowingForTesting(id) {
            const ctrls = this.controllers.filter(this.filterMatchingIdForTesting_(id));
            return !!ctrls[0]
        }
        getHelpBubbleForTesting(id) {
            const ctrls = this.controllers.filter(this.filterMatchingIdForTesting_(id));
            return ctrls[0] ? ctrls[0].getBubble() : null
        }
        filterMatchingIdForTesting_(anchorId) {
            return ctrl=>ctrl.isBubbleShowing() && ctrl.getAnchor() !== null && ctrl.getAnchor().id === anchorId
        }
        getSortedAnchorStatusesForTesting() {
            return this.controllers.sort(((a,b)=>a.getNativeId().localeCompare(b.getNativeId()))).map((ctrl=>[ctrl.getNativeId(), ctrl.hasAnchor()]))
        }
        canShowHelpBubble(controller) {
            if (!this.helpBubbleControllerById_.has(controller.getNativeId())) {
                return false
            }
            if (!controller.canShowBubble()) {
                return false
            }
            const anchor = controller.getAnchor();
            const anchorIsUsed = this.controllers.some((otherCtrl=>otherCtrl.isBubbleShowing() && otherCtrl.getAnchor() === anchor));
            return !anchorIsUsed
        }
        showHelpBubble(controller, params) {
            assert(this.canShowHelpBubble(controller), "Can't show help bubble");
            const bubble = controller.createBubble(params);
            this.helpBubbleDismissedEventTracker_.add(bubble, HELP_BUBBLE_DISMISSED_EVENT, this.onHelpBubbleDismissed_.bind(this));
            this.helpBubbleDismissedEventTracker_.add(bubble, HELP_BUBBLE_TIMED_OUT_EVENT, this.onHelpBubbleTimedOut_.bind(this));
            controller.show()
        }
        hideHelpBubble(nativeId) {
            const ctrl = this.helpBubbleControllerById_.get(nativeId);
            if (!ctrl || !ctrl.hasBubble()) {
                return false
            }
            this.helpBubbleDismissedEventTracker_.remove(ctrl.getBubble(), HELP_BUBBLE_DISMISSED_EVENT);
            this.helpBubbleDismissedEventTracker_.remove(ctrl.getBubble(), HELP_BUBBLE_TIMED_OUT_EVENT);
            ctrl.hide();
            return true
        }
        notifyHelpBubbleAnchorActivated(nativeId) {
            const ctrl = this.helpBubbleControllerById_.get(nativeId);
            if (!ctrl || !ctrl.isBubbleShowing()) {
                return false
            }
            this.helpBubbleHandler_.helpBubbleAnchorActivated(nativeId);
            return true
        }
        notifyHelpBubbleAnchorCustomEvent(nativeId, customEvent) {
            const ctrl = this.helpBubbleControllerById_.get(nativeId);
            if (!ctrl || !ctrl.isBubbleShowing()) {
                return false
            }
            this.helpBubbleHandler_.helpBubbleAnchorCustomEvent(nativeId, customEvent);
            return true
        }
        onAnchorVisibilityChanged_(target, isVisible) {
            const nativeId = target.dataset["nativeId"];
            assert(nativeId);
            const ctrl = this.helpBubbleControllerById_.get(nativeId);
            const hidden = this.hideHelpBubble(nativeId);
            if (hidden) {
                this.helpBubbleHandler_.helpBubbleClosed(nativeId, HelpBubbleClosedReason.kPageChanged)
            }
            const bounds = isVisible ? this.getElementBounds_(target) : {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            };
            if (!ctrl || ctrl.updateAnchorVisibility(isVisible, bounds)) {
                this.helpBubbleHandler_.helpBubbleAnchorVisibilityChanged(nativeId, isVisible, bounds)
            }
        }
        onAnchorBoundsMayHaveChanged_() {
            for (const ctrl of this.controllers) {
                if (ctrl.hasAnchor() && ctrl.getAnchorVisibility()) {
                    const bounds = this.getElementBounds_(ctrl.getAnchor());
                    if (ctrl.updateAnchorVisibility(true, bounds)) {
                        this.helpBubbleHandler_.helpBubbleAnchorVisibilityChanged(ctrl.getNativeId(), true, bounds)
                    }
                }
            }
        }
        getElementBounds_(element) {
            const rect = {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            };
            const bounds = element.getBoundingClientRect();
            rect.x = bounds.x;
            rect.y = bounds.y;
            rect.width = bounds.width;
            rect.height = bounds.height;
            const nativeId = element.dataset["nativeId"];
            if (!nativeId) {
                return rect
            }
            const ctrl = this.helpBubbleControllerById_.get(nativeId);
            if (ctrl) {
                const padding = ctrl.getPadding();
                rect.x -= padding.left;
                rect.y -= padding.top;
                rect.width += padding.left + padding.right;
                rect.height += padding.top + padding.bottom
            }
            return rect
        }
        onShowHelpBubble_(params) {
            if (!this.helpBubbleControllerById_.has(params.nativeIdentifier)) {
                return
            }
            const ctrl = this.helpBubbleControllerById_.get(params.nativeIdentifier);
            this.showHelpBubble(ctrl, params)
        }
        onToggleHelpBubbleFocusForAccessibility_(nativeId) {
            if (!this.helpBubbleControllerById_.has(nativeId)) {
                return
            }
            const ctrl = this.helpBubbleControllerById_.get(nativeId);
            if (ctrl) {
                const anchor = ctrl.getAnchor();
                if (anchor) {
                    anchor.focus()
                }
            }
        }
        onHideHelpBubble_(nativeId) {
            this.hideHelpBubble(nativeId)
        }
        onExternalHelpBubbleUpdated_(nativeId, shown) {
            if (!this.helpBubbleControllerById_.has(nativeId)) {
                return
            }
            const ctrl = this.helpBubbleControllerById_.get(nativeId);
            ctrl.updateExternalShowingStatus(shown)
        }
        onHelpBubbleDismissed_(e) {
            const nativeId = e.detail.nativeId;
            assert(nativeId);
            const hidden = this.hideHelpBubble(nativeId);
            assert(hidden);
            if (nativeId) {
                if (e.detail.fromActionButton) {
                    this.helpBubbleHandler_.helpBubbleButtonPressed(nativeId, e.detail.buttonIndex)
                } else {
                    this.helpBubbleHandler_.helpBubbleClosed(nativeId, HelpBubbleClosedReason.kDismissedByUser)
                }
            }
        }
        onHelpBubbleTimedOut_(e) {
            const nativeId = e.detail.nativeId;
            const ctrl = this.helpBubbleControllerById_.get(nativeId);
            assert(ctrl);
            const hidden = this.hideHelpBubble(nativeId);
            assert(hidden);
            if (nativeId) {
                this.helpBubbleHandler_.helpBubbleClosed(nativeId, HelpBubbleClosedReason.kTimedOut)
            }
        }
    }
    return HelpBubbleMixin
}
));
function parseOptions(options) {
    const padding = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    };
    padding.top = clampPadding(options.anchorPaddingTop);
    padding.left = clampPadding(options.anchorPaddingLeft);
    padding.bottom = clampPadding(options.anchorPaddingBottom);
    padding.right = clampPadding(options.anchorPaddingRight);
    return {
        padding: padding,
        fixed: !!options.fixed
    }
}
function clampPadding(n=0) {
    return Math.max(0, Math.min(20, n))
}
// Copyright 2020 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var CustomizeDialogPage;
(function(CustomizeDialogPage) {
    CustomizeDialogPage["BACKGROUNDS"] = "backgrounds";
    CustomizeDialogPage["SHORTCUTS"] = "shortcuts";
    CustomizeDialogPage["MODULES"] = "modules";
    CustomizeDialogPage["THEMES"] = "themes"
}
)(CustomizeDialogPage || (CustomizeDialogPage = {}));
// Copyright 2021 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
function recordDuration(metricName, durationMs) {
    chrome.metricsPrivate.recordValue({
        metricName: metricName,
        type: chrome.metricsPrivate.MetricTypeType.HISTOGRAM_LOG,
        min: 1,
        max: 6e4,
        buckets: 100
    }, Math.floor(durationMs))
}
function recordLoadDuration(metricName, msSinceEpoch) {
    recordDuration(metricName, msSinceEpoch - loadTimeData.getValue("navigationStartTime"))
}
function recordPerdecage(metricName, value) {
    chrome.metricsPrivate.recordValue({
        metricName: metricName,
        type: chrome.metricsPrivate.MetricTypeType.HISTOGRAM_LINEAR,
        min: 1,
        max: 11,
        buckets: 12
    }, value)
}
function recordOccurence(metricName) {
    chrome.metricsPrivate.recordValue({
        metricName: metricName,
        type: chrome.metricsPrivate.MetricTypeType.HISTOGRAM_LINEAR,
        min: 1,
        max: 1,
        buckets: 1
    }, 1)
}
/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
var ORPHANS = new Set;
const IronResizableBehavior = {
    properties: {
        _parentResizable: {
            type: Object,
            observer: "_parentResizableChanged"
        },
        _notifyingDescendant: {
            type: Boolean,
            value: false
        }
    },
    listeners: {
        "iron-request-resize-notifications": "_onIronRequestResizeNotifications"
    },
    created: function() {
        this._interestedResizables = [];
        this._boundNotifyResize = this.notifyResize.bind(this);
        this._boundOnDescendantIronResize = this._onDescendantIronResize.bind(this)
    },
    attached: function() {
        this._requestResizeNotifications()
    },
    detached: function() {
        if (this._parentResizable) {
            this._parentResizable.stopResizeNotificationsFor(this)
        } else {
            ORPHANS.delete(this);
            window.removeEventListener("resize", this._boundNotifyResize)
        }
        this._parentResizable = null
    },
    notifyResize: function() {
        if (!this.isAttached) {
            return
        }
        this._interestedResizables.forEach((function(resizable) {
            if (this.resizerShouldNotify(resizable)) {
                this._notifyDescendant(resizable)
            }
        }
        ), this);
        this._fireResize()
    },
    assignParentResizable: function(parentResizable) {
        if (this._parentResizable) {
            this._parentResizable.stopResizeNotificationsFor(this)
        }
        this._parentResizable = parentResizable;
        if (parentResizable && parentResizable._interestedResizables.indexOf(this) === -1) {
            parentResizable._interestedResizables.push(this);
            parentResizable._subscribeIronResize(this)
        }
    },
    stopResizeNotificationsFor: function(target) {
        var index = this._interestedResizables.indexOf(target);
        if (index > -1) {
            this._interestedResizables.splice(index, 1);
            this._unsubscribeIronResize(target)
        }
    },
    _subscribeIronResize: function(target) {
        target.addEventListener("iron-resize", this._boundOnDescendantIronResize)
    },
    _unsubscribeIronResize: function(target) {
        target.removeEventListener("iron-resize", this._boundOnDescendantIronResize)
    },
    resizerShouldNotify: function(element) {
        return true
    },
    _onDescendantIronResize: function(event) {
        if (this._notifyingDescendant) {
            event.stopPropagation();
            return
        }
        if (!useShadow) {
            this._fireResize()
        }
    },
    _fireResize: function() {
        this.fire("iron-resize", null, {
            node: this,
            bubbles: false
        })
    },
    _onIronRequestResizeNotifications: function(event) {
        var target = dom(event).rootTarget;
        if (target === this) {
            return
        }
        target.assignParentResizable(this);
        this._notifyDescendant(target);
        event.stopPropagation()
    },
    _parentResizableChanged: function(parentResizable) {
        if (parentResizable) {
            window.removeEventListener("resize", this._boundNotifyResize)
        }
    },
    _notifyDescendant: function(descendant) {
        if (!this.isAttached) {
            return
        }
        this._notifyingDescendant = true;
        descendant.notifyResize();
        this._notifyingDescendant = false
    },
    _requestResizeNotifications: function() {
        if (!this.isAttached) {
            return
        }
        if (document.readyState === "loading") {
            var _requestResizeNotifications = this._requestResizeNotifications.bind(this);
            document.addEventListener("readystatechange", (function readystatechanged() {
                document.removeEventListener("readystatechange", readystatechanged);
                _requestResizeNotifications()
            }
            ))
        } else {
            this._findParent();
            if (!this._parentResizable) {
                ORPHANS.forEach((function(orphan) {
                    if (orphan !== this) {
                        orphan._findParent()
                    }
                }
                ), this);
                window.addEventListener("resize", this._boundNotifyResize);
                this.notifyResize()
            } else {
                this._parentResizable._interestedResizables.forEach((function(resizable) {
                    if (resizable !== this) {
                        resizable._findParent()
                    }
                }
                ), this)
            }
        }
    },
    _findParent: function() {
        this.assignParentResizable(null);
        this.fire("iron-request-resize-notifications", null, {
            node: this,
            bubbles: true,
            cancelable: true
        });
        if (!this._parentResizable) {
            ORPHANS.add(this)
        } else {
            ORPHANS.delete(this)
        }
    }
};
/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
Polymer({
    _template: html`
    <style>
      :host {
        display: block;
      }

      :host > ::slotted(:not(slot):not(.iron-selected)) {
        display: none !important;
      }
    </style>

    <slot></slot>
`,
    is: "iron-pages",
    behaviors: [IronResizableBehavior, IronSelectableBehavior],
    properties: {
        activateEvent: {
            type: String,
            value: null
        }
    },
    observers: ["_selectedPageChanged(selected)"],
    _selectedPageChanged: function(selected, old) {
        this.async(this.notifyResize)
    }
});
function getTemplate() {
    return html`<!--_html_template_start_--><style include="cr-icons">:host{--receiving-audio-color:var(--google-red-500);--speak-shown-duration:2s}.display-stack{display:grid}.display-stack>*{grid-column-start:1;grid-row-start:1}#dialog{align-items:center;background-color:var(--color-new-tab-page-overlay-background);border:none;display:flex;height:100%;justify-content:center;left:0;margin:0;max-height:initial;max-width:initial;padding:0;top:0;width:100%}#closeButton{--cr-icon-button-fill-color:var(--color-new-tab-page-overlay-secondary-foreground);margin:0;position:absolute;top:16px}:host-context([dir=ltr]) #closeButton{right:16px}:host-context([dir=rtl]) #closeButton{left:16px}#content{align-items:center;display:flex;flex-direction:row;width:660px}#texts{color:var(--color-new-tab-page-overlay-secondary-foreground);flex-grow:1;font-size:32px;text-align:start}[text]{transition-delay:.2s;transition-duration:.5s;transition-property:opacity,padding-inline-start;transition-timing-function:ease-out;visibility:hidden;width:100%}[text=speak],[text=waiting]{opacity:0;overflow-x:hidden;padding-inline-start:50px}[text][visible]{opacity:1;padding-inline-start:0;visibility:visible}[text=speak][visible] #speak{opacity:0;transition:opacity 0s var(--speak-shown-duration)}[text=speak] #listening{opacity:0}[text=speak][visible] #listening{opacity:1;transition:opacity 750ms ease-out var(--speak-shown-duration)}#finalResult{color:var(--color-new-tab-page-overlay-foreground)}#errorLinks,#errors{display:inline}#errorLinks a{color:var(--cr-link-color);font-size:18px;font-weight:500;margin-inline-start:.25em}#micContainer{--mic-button-size:165px;--mic-container-size:300px;align-items:center;flex-shrink:0;height:var(--mic-container-size);justify-items:center;width:var(--mic-container-size)}#micVolume{--mic-volume-size:calc(var(--mic-button-size) +
        var(--mic-volume-level) * (var(--mic-container-size) -
            var(--mic-button-size)));align-items:center;background-color:var(--color-new-tab-page-border);border-radius:50%;display:flex;height:var(--mic-volume-size);justify-content:center;transition-duration:var(--mic-volume-duration);transition-property:height,width;transition-timing-function:ease-in-out;width:var(--mic-volume-size)}#micVolumeCutout{background-color:var(--color-new-tab-page-overlay-background);border-radius:50%;height:var(--mic-button-size);width:var(--mic-button-size)}#micIconContainer{align-items:center;border:1px solid var(--color-new-tab-page-mic-border-color);border-radius:50%;display:flex;height:var(--mic-button-size);justify-content:center;transition:background-color .2s ease-in-out;width:var(--mic-button-size)}.receiving #micIconContainer{background-color:var(--receiving-audio-color);border-color:var(--receiving-audio-color)}#micIcon{-webkit-mask-image:url(icons/mic.svg);-webkit-mask-repeat:no-repeat;-webkit-mask-size:100%;background-color:var(--color-new-tab-page-mic-icon-color);height:80px;transition:background-color .2s ease-in-out;width:80px}.listening #micIcon{background-color:var(--receiving-audio-color)}.receiving #micIcon{background-color:#fff}</style>
<dialog id="dialog" on-close="onOverlayClose_" on-click="onOverlayClick_" on-keydown="onOverlayKeydown_">
  <div id="content" tabindex="-1">
    <iron-selector id="texts" selected="[[getText_(state_)]]" attr-for-selected="text" fallback-selection="none" aria-live="polite" selected-attribute="visible" class="display-stack">
      <div text="none"></div>
      <div text="waiting">Waiting…</div>
      <div text="speak" class="display-stack">
        <div id="speak">Speak now</div>
        <div id="listening">Listening…</div>
      </div>
      <div text="result" aria-hidden="true">
        <span id="finalResult">[[finalResult_]]</span>
        <span>[[interimResult_]]</span>
      </div>
      <div text="error">
        <iron-pages id="errors" selected="[[getErrorText_(error_)]]" attr-for-selected="error" fallback-selection="other">
          <span error="no-speech">Please check your microphone and audio levels.</span>
          <span error="audio-capture">Please check your microphone.</span>
          <span error="network">No Internet connection.</span>
          <span error="not-allowed">Voice search has been turned off.</span>
          <span error="language-not-supported">Voice search in your language is not available.</span>
          <span error="no-match">Didn&#39;t get that.</span>
          <span error="other">Unknown error.</span>
        </iron-pages>
        <iron-pages id="errorLinks" selected="[[getErrorLink_(error_)]]" attr-for-selected="link" fallback-selection="none">
          <span link="none"></span>
          <a link="learn-more" target="_blank" href="[[helpUrl_]]" on-click="onLearnMoreClick_" on-keydown="onLinkKeydown_" aria-label="Learn more about using a microphone">Learn more
          </a>
          <a link="details" target="_blank" href="[[helpUrl_]]" on-keydown="onLinkKeydown_" aria-label="Learn more about using a microphone">Details
          </a>
          <a link="try-again" id="retryLink" href="#" on-click="onTryAgainClick_" on-keydown="onLinkKeydown_">Try again
          </a>
        </iron-pages>
      </div>
    </iron-selector>
    <div id="micContainer" class$="[[getMicClass_(state_)]] display-stack">
      <div id="micVolume" style="--mic-volume-level:[[micVolumeLevel_]];--mic-volume-duration:[[micVolumeDuration_]]ms">
        <div id="micVolumeCutout">
        </div>
      </div>
      <div id="micIconContainer">
        <div id="micIcon"></div>
      </div>
    </div>
  </div>
  <cr-icon-button id="closeButton" class="icon-clear" title="Close">
  </cr-icon-button>
</dialog>
<!--_html_template_end_-->`
}
// Copyright 2020 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const RECOGNITION_CONFIDENCE_THRESHOLD = .5;
const QUERY_LENGTH_LIMIT = 120;
const IDLE_TIMEOUT_MS = 8e3;
const ERROR_TIMEOUT_SHORT_MS = 9e3;
const ERROR_TIMEOUT_LONG_MS = 24e3;
const VOLUME_ANIMATION_DURATION_MIN_MS = 170;
const VOLUME_ANIMATION_DURATION_RANGE_MS = 10;
var State;
(function(State) {
    State[State["UNINITIALIZED"] = -1] = "UNINITIALIZED";
    State[State["STARTED"] = 0] = "STARTED";
    State[State["AUDIO_RECEIVED"] = 1] = "AUDIO_RECEIVED";
    State[State["SPEECH_RECEIVED"] = 2] = "SPEECH_RECEIVED";
    State[State["RESULT_RECEIVED"] = 3] = "RESULT_RECEIVED";
    State[State["ERROR_RECEIVED"] = 4] = "ERROR_RECEIVED";
    State[State["RESULT_FINAL"] = 5] = "RESULT_FINAL"
}
)(State || (State = {}));
var Action;
(function(Action) {
    Action[Action["ACTIVATE_SEARCH_BOX"] = 0] = "ACTIVATE_SEARCH_BOX";
    Action[Action["ACTIVATE_KEYBOARD"] = 1] = "ACTIVATE_KEYBOARD";
    Action[Action["CLOSE_OVERLAY"] = 2] = "CLOSE_OVERLAY";
    Action[Action["QUERY_SUBMITTED"] = 3] = "QUERY_SUBMITTED";
    Action[Action["SUPPORT_LINK_CLICKED"] = 4] = "SUPPORT_LINK_CLICKED";
    Action[Action["TRY_AGAIN_LINK"] = 5] = "TRY_AGAIN_LINK";
    Action[Action["TRY_AGAIN_MIC_BUTTON"] = 6] = "TRY_AGAIN_MIC_BUTTON"
}
)(Action || (Action = {}));
var Error$1;
(function(Error) {
    Error[Error["ABORTED"] = 0] = "ABORTED";
    Error[Error["AUDIO_CAPTURE"] = 1] = "AUDIO_CAPTURE";
    Error[Error["BAD_GRAMMAR"] = 2] = "BAD_GRAMMAR";
    Error[Error["LANGUAGE_NOT_SUPPORTED"] = 3] = "LANGUAGE_NOT_SUPPORTED";
    Error[Error["NETWORK"] = 4] = "NETWORK";
    Error[Error["NO_MATCH"] = 5] = "NO_MATCH";
    Error[Error["NO_SPEECH"] = 6] = "NO_SPEECH";
    Error[Error["NOT_ALLOWED"] = 7] = "NOT_ALLOWED";
    Error[Error["OTHER"] = 8] = "OTHER";
    Error[Error["SERVICE_NOT_ALLOWED"] = 9] = "SERVICE_NOT_ALLOWED"
}
)(Error$1 || (Error$1 = {}));
function recordVoiceAction(action) {
    chrome.metricsPrivate.recordEnumerationValue("NewTabPage.VoiceActions", action, Object.keys(Action).length)
}
function toError(webkitError) {
    switch (webkitError) {
    case "aborted":
        return Error$1.ABORTED;
    case "audio-capture":
        return Error$1.AUDIO_CAPTURE;
    case "language-not-supported":
        return Error$1.LANGUAGE_NOT_SUPPORTED;
    case "network":
        return Error$1.NETWORK;
    case "no-speech":
        return Error$1.NO_SPEECH;
    case "not-allowed":
        return Error$1.NOT_ALLOWED;
    case "service-not-allowed":
        return Error$1.SERVICE_NOT_ALLOWED;
    case "bad-grammar":
        return Error$1.BAD_GRAMMAR;
    default:
        return Error$1.OTHER
    }
}
function getErrorTimeout(error) {
    switch (error) {
    case Error$1.AUDIO_CAPTURE:
    case Error$1.NO_SPEECH:
    case Error$1.NOT_ALLOWED:
    case Error$1.NO_MATCH:
        return ERROR_TIMEOUT_LONG_MS;
    default:
        return ERROR_TIMEOUT_SHORT_MS
    }
}
class VoiceSearchOverlayElement extends PolymerElement {
    static get is() {
        return "ntp-voice-search-overlay"
    }
    static get template() {
        return getTemplate()
    }
    static get properties() {
        return {
            interimResult_: String,
            finalResult_: String,
            state_: {
                type: Number,
                value: State.UNINITIALIZED
            },
            error_: Number,
            helpUrl_: {
                type: String,
                readOnly: true,
                value: `https://support.google.com/chrome/?` + `p=ui_voice_search&hl=${window.navigator.language}`
            },
            micVolumeLevel_: {
                type: Number,
                value: 0
            },
            micVolumeDuration_: {
                type: Number,
                value: VOLUME_ANIMATION_DURATION_MIN_MS
            }
        }
    }
    constructor() {
        super();
        this.timerId_ = null;
        this.pageHandler_ = NewTabPageProxy.getInstance().handler;
        this.voiceRecognition_ = new window.webkitSpeechRecognition;
        this.voiceRecognition_.continuous = false;
        this.voiceRecognition_.interimResults = true;
        this.voiceRecognition_.lang = window.navigator.language;
        this.voiceRecognition_.onaudiostart = this.onAudioStart_.bind(this);
        this.voiceRecognition_.onspeechstart = this.onSpeechStart_.bind(this);
        this.voiceRecognition_.onresult = this.onResult_.bind(this);
        this.voiceRecognition_.onend = this.onEnd_.bind(this);
        this.voiceRecognition_.onerror = e=>{
            this.onError_(toError(e.error))
        }
        ;
        this.voiceRecognition_.onnomatch = ()=>{
            this.onError_(Error$1.NO_MATCH)
        }
    }
    connectedCallback() {
        super.connectedCallback();
        this.$.dialog.showModal();
        this.start()
    }
    start() {
        this.voiceRecognition_.start();
        this.state_ = State.STARTED;
        this.resetIdleTimer_()
    }
    onOverlayClose_() {
        this.voiceRecognition_.abort();
        this.dispatchEvent(new Event("close"))
    }
    onOverlayClick_() {
        this.$.dialog.close();
        recordVoiceAction(Action.CLOSE_OVERLAY)
    }
    onOverlayKeydown_(e) {
        if (["Enter", " "].includes(e.key) && this.finalResult_) {
            this.onFinalResult_()
        } else if (e.key === "Escape") {
            this.onOverlayClick_()
        }
    }
    onLinkKeydown_(e) {
        if (!["Enter", " "].includes(e.key)) {
            return
        }
        e.stopPropagation();
        e.preventDefault();
        e.target.click()
    }
    onLearnMoreClick_() {
        recordVoiceAction(Action.SUPPORT_LINK_CLICKED)
    }
    onTryAgainClick_(e) {
        e.stopPropagation();
        this.start();
        recordVoiceAction(Action.TRY_AGAIN_LINK)
    }
    resetIdleTimer_() {
        WindowProxy.getInstance().clearTimeout(this.timerId_);
        this.timerId_ = WindowProxy.getInstance().setTimeout(this.onIdleTimeout_.bind(this), IDLE_TIMEOUT_MS)
    }
    onIdleTimeout_() {
        if (this.state_ === State.RESULT_FINAL) {
            return
        }
        if (this.finalResult_) {
            this.onFinalResult_();
            return
        }
        this.voiceRecognition_.abort();
        this.onError_(Error$1.NO_MATCH)
    }
    resetErrorTimer_(duration) {
        WindowProxy.getInstance().clearTimeout(this.timerId_);
        this.timerId_ = WindowProxy.getInstance().setTimeout((()=>{
            this.$.dialog.close()
        }
        ), duration)
    }
    onAudioStart_() {
        this.resetIdleTimer_();
        this.state_ = State.AUDIO_RECEIVED
    }
    onSpeechStart_() {
        this.resetIdleTimer_();
        this.state_ = State.SPEECH_RECEIVED;
        this.animateVolume_()
    }
    onResult_(e) {
        this.resetIdleTimer_();
        switch (this.state_) {
        case State.STARTED:
            this.onAudioStart_();
            this.onSpeechStart_();
            break;
        case State.AUDIO_RECEIVED:
            this.onSpeechStart_();
            break;
        case State.SPEECH_RECEIVED:
        case State.RESULT_RECEIVED:
            break;
        default:
            return
        }
        const results = e.results;
        if (results.length === 0) {
            return
        }
        this.state_ = State.RESULT_RECEIVED;
        this.interimResult_ = "";
        this.finalResult_ = "";
        const finalResult = results[e.resultIndex];
        if (finalResult.isFinal) {
            this.finalResult_ = finalResult[0].transcript;
            this.onFinalResult_();
            return
        }
        for (let j = 0; j < results.length; j++) {
            const result = results[j][0];
            if (result.confidence > RECOGNITION_CONFIDENCE_THRESHOLD) {
                this.finalResult_ += result.transcript
            } else {
                this.interimResult_ += result.transcript
            }
        }
        if (this.interimResult_.length > QUERY_LENGTH_LIMIT) {
            this.onFinalResult_()
        }
    }
    onFinalResult_() {
        if (!this.finalResult_) {
            this.onError_(Error$1.NO_MATCH);
            return
        }
        this.state_ = State.RESULT_FINAL;
        const searchParams = new URLSearchParams;
        searchParams.append("q", this.finalResult_);
        searchParams.append("gs_ivs", "1");
        const queryUrl = new URL("/search",loadTimeData.getString("googleBaseUrl"));
        queryUrl.search = searchParams.toString();
        recordVoiceAction(Action.QUERY_SUBMITTED);
        WindowProxy.getInstance().navigate(queryUrl.href)
    }
    onEnd_() {
        switch (this.state_) {
        case State.STARTED:
            this.onError_(Error$1.AUDIO_CAPTURE);
            return;
        case State.AUDIO_RECEIVED:
            this.onError_(Error$1.NO_SPEECH);
            return;
        case State.SPEECH_RECEIVED:
        case State.RESULT_RECEIVED:
            this.onError_(Error$1.NO_MATCH);
            return;
        case State.ERROR_RECEIVED:
        case State.RESULT_FINAL:
            return;
        default:
            this.onError_(Error$1.OTHER);
            return
        }
    }
    onError_(error) {
        chrome.metricsPrivate.recordEnumerationValue("NewTabPage.VoiceErrors", error, Object.keys(Error$1).length);
        if (error === Error$1.ABORTED) {
            return
        }
        this.error_ = error;
        this.state_ = State.ERROR_RECEIVED;
        this.resetErrorTimer_(getErrorTimeout(error))
    }
    animateVolume_() {
        this.micVolumeLevel_ = 0;
        this.micVolumeDuration_ = VOLUME_ANIMATION_DURATION_MIN_MS;
        if (this.state_ !== State.SPEECH_RECEIVED && this.state_ !== State.RESULT_RECEIVED) {
            return
        }
        this.micVolumeLevel_ = WindowProxy.getInstance().random();
        this.micVolumeDuration_ = Math.round(VOLUME_ANIMATION_DURATION_MIN_MS + WindowProxy.getInstance().random() * VOLUME_ANIMATION_DURATION_RANGE_MS);
        WindowProxy.getInstance().setTimeout(this.animateVolume_.bind(this), this.micVolumeDuration_)
    }
    getText_() {
        switch (this.state_) {
        case State.STARTED:
            return "waiting";
        case State.AUDIO_RECEIVED:
        case State.SPEECH_RECEIVED:
            return "speak";
        case State.RESULT_RECEIVED:
        case State.RESULT_FINAL:
            return "result";
        case State.ERROR_RECEIVED:
            return "error";
        default:
            return "none"
        }
    }
    getErrorText_() {
        switch (this.error_) {
        case Error$1.NO_SPEECH:
            return "no-speech";
        case Error$1.AUDIO_CAPTURE:
            return "audio-capture";
        case Error$1.NETWORK:
            return "network";
        case Error$1.NOT_ALLOWED:
        case Error$1.SERVICE_NOT_ALLOWED:
            return "not-allowed";
        case Error$1.LANGUAGE_NOT_SUPPORTED:
            return "language-not-supported";
        case Error$1.NO_MATCH:
            return "no-match";
        case Error$1.ABORTED:
        case Error$1.OTHER:
        default:
            return "other"
        }
    }
    getErrorLink_() {
        switch (this.error_) {
        case Error$1.NO_SPEECH:
        case Error$1.AUDIO_CAPTURE:
            return "learn-more";
        case Error$1.NOT_ALLOWED:
        case Error$1.SERVICE_NOT_ALLOWED:
            return "details";
        case Error$1.NO_MATCH:
            return "try-again";
        default:
            return "none"
        }
    }
    getMicClass_() {
        switch (this.state_) {
        case State.AUDIO_RECEIVED:
            return "listening";
        case State.SPEECH_RECEIVED:
        case State.RESULT_RECEIVED:
            return "receiving";
        default:
            return ""
        }
    }
}
customElements.define(VoiceSearchOverlayElement.is, VoiceSearchOverlayElement);
// Copyright 2023 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
function checkTransparency(buffer) {
    const view = new DataView(buffer);
    return isTransparentPNG(view) || isTransparentBMP(view) || isTransparentWebP(view)
}
function getUint8FromView(view, offset) {
    try {
        return view.getUint8(offset)
    } catch {
        return null
    }
}
function getUint16FromView(view, offset) {
    try {
        return view.getUint16(offset)
    } catch {
        return null
    }
}
function getUint32FromView(view, offset) {
    try {
        return view.getUint32(offset)
    } catch {
        return null
    }
}
function isPNG(view) {
    return getUint32FromView(view, 0) === 2303741511 && getUint32FromView(view, 4) === 218765834
}
function isTransparentPNG(view) {
    if (!isPNG(view)) {
        return false
    }
    const type = getUint8FromView(view, 25);
    return type === 4 || type === 6
}
function isWebP(view) {
    return getUint32FromView(view, 0) === 1380533830 && getUint32FromView(view, 8) === 1464156752
}
function isTransparentWebP(view) {
    if (!isWebP(view)) {
        return false
    }
    const format = getUint8FromView(view, 15);
    return format === 88 || format === 76
}
function isBMP(view) {
    return getUint16FromView(view, 0) === 16973
}
function isTransparentBMP(view) {
    if (!isBMP(view)) {
        return false
    }
    return getUint16FromView(view, 28) === 50
}
// Copyright 2023 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const SUPPORTED_FILE_TYPES = ["image/bmp", "image/heic", "image/heif", "image/jpeg", "image/png", "image/tiff", "image/webp", "image/x-icon"];
const MIME_TYPE_TO_EXTENSION_MAP = new Map([["image/png", ".png"], ["image/webp", ".webp"], ["image/bmp", ".bmp"], ["image/heif", ".heif"], ["image/jpeg", ".jpg"], ["image/tiff", ".tif"], ["image/heic", ".heic"], ["image/x-icon", ".ico"]]);
const MAX_LONGEST_EDGE_PIXELS = 1e3;
const TRANSPARENCY_FILL_BG_COLOR = "#ffffff";
const JPEG_QUALITY = 40;
const DEFAULT_MIME_TYPE = "image/jpeg";
async function processFile(file, maxLongestEdgePixels=MAX_LONGEST_EDGE_PIXELS) {
    const image = await readImageFile(file);
    if (!image) {
        return {
            processedFile: file
        }
    }
    const originalImageWidth = image.width;
    const originalImageHeight = image.height;
    const hasTransparency = checkTransparency(await file.arrayBuffer());
    const blobInfo = await processImage(image, DEFAULT_MIME_TYPE, hasTransparency, maxLongestEdgePixels);
    if (!blobInfo || !blobInfo.blob) {
        return {
            processedFile: file,
            imageWidth: originalImageWidth,
            imageHeight: originalImageHeight
        }
    }
    const processedImage = blobInfo.blob;
    let imageWidth = blobInfo.imageWidth;
    let imageHeight = blobInfo.imageHeight;
    const lastDot = file.name.lastIndexOf(".");
    const fileName = `${lastDot > 0 ? file.name.slice(0, lastDot) : file.name}${MIME_TYPE_TO_EXTENSION_MAP.get(processedImage.type)}`;
    let processedFile = new File([processedImage],fileName,{
        lastModified: Date.now(),
        type: processedImage.type
    });
    if (processedFile.size > file.size) {
        processedFile = file;
        imageWidth = originalImageWidth;
        imageHeight = originalImageHeight
    }
    return {
        processedFile: processedFile,
        imageWidth: imageWidth,
        imageHeight: imageHeight
    }
}
async function readImageFile(file) {
    const dataUrl = await readAsDataURL(file);
    if (!dataUrl || dataUrl instanceof ArrayBuffer) {
        return null
    }
    return createImageFromDataUrl(dataUrl)
}
function processImage(image, mimeType, hasTransparency, maxLongestEdgePixels) {
    const [width,height] = getDimensions(image, maxLongestEdgePixels);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", {
        alpha: false,
        desynchronized: true
    });
    if (!context) {
        return null
    }
    if (hasTransparency) {
        fillBackground(context, canvas.width, canvas.height, TRANSPARENCY_FILL_BG_COLOR)
    }
    context.drawImage(image, 0, 0, width, height);
    return toBlob(canvas, mimeType, JPEG_QUALITY, width, height)
}
function getDimensions(image, maxLongestEdgePixels) {
    let width = image.width;
    let height = image.height;
    if (maxLongestEdgePixels && (width > maxLongestEdgePixels || height > maxLongestEdgePixels)) {
        const downscaleRatio = Math.min(maxLongestEdgePixels / width, maxLongestEdgePixels / height);
        width *= downscaleRatio;
        height *= downscaleRatio
    }
    return [Math.floor(width), Math.floor(height)]
}
function fillBackground(context, canvasWidth, canvasHeight, backgroundColor) {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvasWidth, canvasHeight)
}
function toBlob(canvas, type, encodingCompressionRatio, imageWidth, imageHeight) {
    return new Promise((resolve=>{
        canvas.toBlob((result=>{
            if (result) {
                resolve({
                    blob: result,
                    imageWidth: imageWidth,
                    imageHeight: imageHeight
                })
            } else {
                resolve({
                    blob: null,
                    imageWidth: imageWidth,
                    imageHeight: imageHeight
                })
            }
        }
        ), type, encodingCompressionRatio)
    }
    ))
}
function readAsDataURL(file) {
    const fileReader = new FileReader;
    const promise = new Promise((resolve=>{
        fileReader.onloadend = ()=>{
            resolve(fileReader.result)
        }
        ;
        fileReader.onerror = ()=>{
            resolve(null)
        }
    }
    ));
    fileReader.readAsDataURL(file);
    return promise
}
function createImageFromDataUrl(dataUrl) {
    const image = new Image;
    const promise = new Promise((resolve=>{
        image.onload = ()=>{
            resolve(image)
        }
        ;
        image.onerror = ()=>{
            resolve(null)
        }
    }
    ));
    image.src = dataUrl;
    return promise
}
export {$$ as $, Action as A, BrowserCommandProxy as B, Command as C, isRTL as D, EventTracker as E, FocusOutlineManager as F, isIOS as G, HelpBubbleMixin as H, IframeElement as I, getDeepActiveElement as J, isWindows as K, isMac as L, listenOnce as M, NewTabPageProxy as N, PaperRippleBehavior as P, SUPPORTED_FILE_TYPES as S, VoiceSearchOverlayElement as V, WindowProxy as W, assertNotReached as a, assert as b, skColorToRgba as c, decodeString16 as d, strictQuery as e, recordVoiceAction as f, getFaviconForPageURL as g, hasKeyModifiers as h, recordLoadDuration as i, hexColorToSkColor as j, CustomizeDialogPage as k, CrAutoImgElement as l, mojoString16 as m, recordOccurence as n, recordPerdecage as o, processFile as p, checkTransparency as q, recordDuration as r, sanitizeInnerHtml as s, isBMP as t, isPNG as u, isWebP as v, createScrollBorders as w, Error$1 as x, I18nMixin as y, assertInstanceof as z};
