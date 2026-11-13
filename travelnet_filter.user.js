// ==UserScript==
// @name         TravelNet Flight & Codeshare Filter
// @namespace    https://github.com/BHibbidy/travelnet-codeshare-filter-updates
// @version      1.4
// @description  Filter partner codeshares, negative availability, and departure/arrival times on TravelNet.
// @author       Brian Hibberd
// @match        *://oldtravel.delta.com/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/BHibbidy/travelnet-codeshare-filter-updates/main/travelnet_filter.user.js
// @downloadURL  https://raw.githubusercontent.com/BHibbidy/travelnet-codeshare-filter-updates/main/travelnet_filter.user.js
// ==/UserScript==

(function() {
  'use strict';

  // Inject TravelNet Filter CSS styles
  const css = '/* TravelNet Filter Indicator & Controls */\n\n/* ── Floating Mobile Toggle Button & Badge ───────────────────────────────── */\n\n#tn-codeshare-container {\n  position: fixed !important;\n  bottom: 24px !important;\n  right: 20px !important;\n  z-index: 2147483647 !important; /* stay above page elements and modals */\n  display: flex !important;\n  flex-direction: column !important;\n  align-items: center !important;\n  gap: 6px !important;\n  user-select: none !important;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;\n  pointer-events: none !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  border: none !important;\n  background: transparent !important;\n  width: 50px !important;\n  height: auto !important;\n  max-width: 50px !important;\n}\n\n/* Badge displayed above the toggle button on mobile */\n#tn-codeshare-badge {\n  display: none;\n  background-color: #2e7d32 !important;\n  color: #ffffff !important;\n  font-size: 11px !important;\n  font-weight: 700 !important;\n  line-height: 1 !important;\n  padding: 4px 9px !important;\n  border-radius: 12px !important;\n  white-space: nowrap !important;\n  letter-spacing: 0.3px !important;\n  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35) !important;\n  pointer-events: none !important;\n  animation: tnBadgeFadeIn 0.2s ease-out !important;\n}\n\n@keyframes tnBadgeFadeIn {\n  from {\n    opacity: 0;\n    transform: translateY(4px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n\n/* Circular floating toggle button with filter funnel icon */\n#tn-codeshare-toggle {\n  width: 50px !important;\n  height: 50px !important;\n  min-width: 50px !important;\n  max-width: 50px !important;\n  min-height: 50px !important;\n  max-height: 50px !important;\n  box-sizing: border-box !important;\n  padding: 0 !important;\n  margin: 0 !important;\n  border: none !important;\n  border-radius: 50% !important;\n  cursor: pointer !important;\n  pointer-events: auto !important;\n  background-color: #6b7280 !important; /* Gray when no filter is applied */\n  color: #ffffff !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35) !important;\n  transition: background-color 0.2s ease, transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) !important;\n  touch-action: manipulation !important;\n  -webkit-tap-highlight-color: transparent !important;\n  overflow: hidden !important;\n  flex-shrink: 0 !important;\n}\n\n/* Green when any filter is active */\n#tn-codeshare-toggle.active {\n  background-color: #2e7d32 !important;\n}\n\n#tn-codeshare-toggle:hover {\n  transform: scale(1.08);\n}\n\n#tn-codeshare-toggle:active {\n  transform: scale(0.94);\n}\n\n#tn-codeshare-toggle svg {\n  width: 24px !important;\n  height: 24px !important;\n  min-width: 24px !important;\n  max-width: 24px !important;\n  min-height: 24px !important;\n  max-height: 24px !important;\n  box-sizing: border-box !important;\n  display: block !important;\n  pointer-events: none !important;\n  margin: auto !important;\n  padding: 0 !important;\n  stroke: #ffffff !important;\n  fill: none !important;\n  flex-shrink: 0 !important;\n}\n\n/* ── Inline Desktop Filter Bar ────────────────────────────────────────────── */\n\n#tn-filter-bar {\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n  background: transparent;\n  border: none;\n  padding: 4px 0 6px 0;\n  margin: 4px 0 6px 0;\n  box-sizing: border-box;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;\n  font-size: 12px;\n  color: #333333;\n}\n\n.tn-filter-row {\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 12px;\n}\n\n#tn-filter-bar .tn-filter-title {\n  font-weight: 700;\n  color: #0b2341;\n  text-transform: uppercase;\n  font-size: 11px;\n  letter-spacing: 0.5px;\n  margin-bottom: 2px;\n}\n\n#tn-filter-bar .tn-filter-option {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  cursor: pointer;\n  user-select: none;\n  font-size: 12px;\n  color: #222222;\n}\n\n#tn-filter-bar .tn-filter-label-fixed {\n  min-width: 95px;\n}\n\n#tn-filter-bar .tn-filter-option input[type="checkbox"] {\n  cursor: pointer;\n  margin: 0;\n  width: 14px;\n  height: 14px;\n  accent-color: #003366;\n}\n\n#tn-filter-bar .tn-filter-badge {\n  display: inline-block;\n  background-color: #2e7d32;\n  color: #ffffff;\n  font-size: 10px;\n  font-weight: 700;\n  padding: 1px 7px;\n  border-radius: 10px;\n  line-height: 1.3;\n  letter-spacing: 0.2px;\n}\n\n/* ── Dual-Range Sliders for Departure & Arrival Times ─────────────────────── */\n\n.tn-time-display {\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;\n  font-size: 11px;\n  font-weight: 600;\n  color: #1a1a1a;\n  min-width: 135px;\n  white-space: nowrap;\n}\n\n.tn-slider-wrapper {\n  position: relative;\n  width: 240px;\n  height: 20px;\n  display: inline-flex;\n  align-items: center;\n}\n\n.tn-slider-track-bg {\n  position: absolute;\n  left: 0;\n  right: 0;\n  height: 4px;\n  background-color: #cbd5e1;\n  border-radius: 2px;\n  pointer-events: none;\n}\n\n.tn-slider-track-highlight {\n  position: absolute;\n  height: 4px;\n  background-color: #003366;\n  border-radius: 2px;\n  pointer-events: none;\n}\n\n.tn-slider-wrapper input[type="range"] {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  margin: 0;\n  padding: 0;\n  pointer-events: none;\n  -webkit-appearance: none;\n  appearance: none;\n  background: transparent;\n  border: none;\n  outline: none;\n  z-index: 2;\n}\n\n/* Firefox thumb styling */\n.tn-slider-wrapper input[type="range"]::-moz-range-thumb {\n  pointer-events: auto;\n  width: 15px;\n  height: 15px;\n  border-radius: 50%;\n  background-color: #003366;\n  border: 2px solid #ffffff;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);\n  cursor: grab;\n  transition: transform 0.1s ease;\n}\n\n.tn-slider-wrapper input[type="range"]::-moz-range-thumb:hover {\n  transform: scale(1.2);\n}\n\n.tn-slider-wrapper input[type="range"]::-moz-range-thumb:active {\n  cursor: grabbing;\n  background-color: #0b2341;\n}\n\n.tn-slider-wrapper input[type="range"]::-moz-range-track {\n  background: transparent;\n  border: none;\n}\n\n/* WebKit thumb styling (Chrome / Safari / Edge) */\n.tn-slider-wrapper input[type="range"]::-webkit-slider-thumb {\n  pointer-events: auto;\n  -webkit-appearance: none;\n  width: 15px;\n  height: 15px;\n  border-radius: 50%;\n  background-color: #003366;\n  border: 2px solid #ffffff;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);\n  cursor: grab;\n  transition: transform 0.1s ease;\n}\n\n.tn-slider-wrapper input[type="range"]::-webkit-slider-thumb:hover {\n  transform: scale(1.2);\n}\n\n.tn-slider-wrapper input[type="range"]::-webkit-slider-thumb:active {\n  cursor: grabbing;\n  background-color: #0b2341;\n}\n\n/* ── Mobile Popup Modal ──────────────────────────────────────────────────── */\n\n#tn-filter-bar.tn-mobile-modal {\n  position: fixed !important;\n  bottom: 84px !important;\n  right: 16px !important;\n  width: 320px !important;\n  max-width: calc(100vw - 32px) !important;\n  max-height: calc(100vh - 120px) !important;\n  box-sizing: border-box !important;\n  overflow-y: auto !important;\n  background: #ffffff !important;\n  background-color: #ffffff !important;\n  border: 1px solid #d1d5db !important;\n  border-radius: 12px !important;\n  padding: 14px 16px !important;\n  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35) !important;\n  z-index: 2147483646 !important; /* below floating toggle button (2147483647) */\n  pointer-events: auto !important;\n  gap: 10px !important;\n  animation: tnModalFadeIn 0.18s ease-out !important;\n}\n\n@keyframes tnModalFadeIn {\n  from {\n    opacity: 0;\n    transform: translateY(6px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n\n#tn-filter-bar.tn-mobile-modal .tn-slider-wrapper {\n  width: 100% !important;\n  max-width: 200px !important;\n}\n\n#tn-filter-bar input[type="checkbox"] {\n  display: inline-block !important;\n  visibility: visible !important;\n  opacity: 1 !important;\n  position: static !important;\n  cursor: pointer !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  width: 15px !important;\n  height: 15px !important;\n  min-width: 15px !important;\n  min-height: 15px !important;\n  accent-color: #003366 !important;\n  clip: auto !important;\n  -webkit-appearance: checkbox !important;\n  appearance: checkbox !important;\n}\n';
  const style = document.createElement('style');
  style.id = 'travelnet-filter-styles';
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);
})();

/**
 * TravelNet Filter & Enhancer
 *
 * 1. Codeshare Filter:
 *    Hides non-selectable partner codeshare itineraries from search results on oldtravel.delta.com.
 *    Preserves selectable Delta mainline and Delta Connection partner flights.
 *    - Desktop: Managed via checkbox in the inline FILTERS section (floating icon hidden).
 *    - Mobile: Managed via the floating toggle icon in the bottom-right corner.
 *
 * 2. Filters Panel (Desktop & Mobile):
 *    - Desktop: Positioned directly below "Outbound Flight Search Results" heading and above the origin/destination bar.
 *    - Mobile: Opens as a floating popup card directly above the bottom-right filter toggle button.
 *    - Line 1: Title "FILTERS:" on its own line.
 *    - Line 2: "Hide partner codeshares" — hides partner codeshare itineraries.
 *    - Line 3: "Hide negative availability (< 0)" — filters out itineraries where all flight legs have negative Total Avail.
 *    - Line 4: "Departure window" — dual-handle range slider (1-hour steps) with live time display.
 *    - Line 5: "Arrival window" — dual-handle range slider (1-hour steps) with live time display.
 *
 * Behavior:
 *   - Default state after search: filters OFF (natural results displayed).
 *   - Sliders automatically disable when both handles are returned to outer ends (12:00 AM & 11:59 PM).
 *   - Dynamic alternating row shading: keeps visible itineraries alternating cleanly.
 *   - Departure filter applies strictly to the first flight leg; arrival filter applies strictly to the last flight leg.
 *   - Mobile filter button: turns green when any filter is active, gray when none is active. Tapping toggles the popup.
 */

(function () {
  'use strict';

  // Filter states (default: OFF)
  let filterCodeshareEnabled = false;
  let filterNegativeAvailEnabled = false;

  // Departure filter
  let filterDepEnabled = false;
  let filterDepMin = 0;       // 0 = 12:00 AM
  let filterDepMax = 1440;    // 1440 = 11:59 PM

  // Arrival filter
  let filterArrEnabled = false;
  let filterArrMin = 0;
  let filterArrMax = 1440;

  // View state
  let isMobileView = false;
  let mobileModalOpen = false;

  // Stored itinerary groups
  // Items: { rows: Array<HTMLTableRowElement>, isPartnerCodeshare: boolean, isAllNegativeAvail: boolean, depMinutes: number|null, arrMinutes: number|null }
  let desktopGroups = [];
  let mobileGroups = [];

  // Floating codeshare indicator DOM elements (Mobile only)
  let containerEl = null;
  let badgeEl = null;
  let toggleEl = null;

  // Filter bar DOM elements (shared between desktop inline & mobile modal)
  let filterBarEl = null;

  let codeshareCheckbox = null;
  let codeshareBadge = null;

  let negAvailCheckbox = null;
  let negAvailBadge = null;

  let depCheckbox = null;
  let depDisplay = null;
  let depTrackHighlight = null;
  let depMinSlider = null;
  let depMaxSlider = null;
  let depBadge = null;

  let arrCheckbox = null;
  let arrDisplay = null;
  let arrTrackHighlight = null;
  let arrMinSlider = null;
  let arrMaxSlider = null;
  let arrBadge = null;

  // ── Time parsing and formatting helpers ───────────────────────────────────

  /**
   * Parse an "HH:MM(AM|PM)" time string into minutes from midnight (0 - 1439).
   */
  function parseTimeToMinutes(timeStr) {
    if (!timeStr) return null;
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  /**
   * Format minutes from midnight (0 - 1440) into a user-friendly string (e.g. "8:00 AM", "11:59 PM").
   */
  function formatMinutesToTime(minutes) {
    if (minutes >= 1440) return '11:59 PM';
    let h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    const mStr = m < 10 ? '0' + m : String(m);
    return `${h}:${mStr} ${period}`;
  }

  // ── Desktop detection helpers ─────────────────────────────────────────────

  function isDesktopCodeshare(tr) {
    if (tr.classList.contains('codeShareRow')) return true;

    const cells = tr.querySelectorAll('td');
    for (let i = 0; i < Math.min(cells.length, 3); i++) {
      const text = cells[i].textContent || '';
      if (text.includes('*')) return true;
    }
    return false;
  }

  function isDesktopSelectable(rows) {
    const firstRow = rows[0];
    if (!firstRow) return false;
    const radio = firstRow.querySelector('input[type="radio"]');
    if (!radio) return false;
    return !radio.disabled && !radio.hasAttribute('disabled');
  }

  function getDesktopRowTotalAvail(tr) {
    const cells = tr.querySelectorAll('td');
    if (cells.length < 2) return null;
    const availCell = cells[cells.length - 2];
    const text = (availCell.textContent || '').trim();
    const match = text.match(/^-?\d+/);
    if (match) {
      return parseInt(match[0], 10);
    }
    return null;
  }

  function isDesktopGroupAllNegativeAvail(rows) {
    if (!rows || rows.length === 0) return false;
    for (const row of rows) {
      const avail = getDesktopRowTotalAvail(row);
      if (avail === null || avail >= 0) {
        return false;
      }
    }
    return true;
  }

  function isDesktopItineraryStart(row, isFirstRow) {
    if (isFirstRow) return true;
    const cells = row.querySelectorAll('td');
    if (cells.length === 0) return false;
    const selectCell = cells[0];
    const hasRadio = Boolean(selectCell.querySelector('input[type="radio"]'));
    const text = (selectCell.textContent || '').trim();
    return hasRadio || text.length > 0;
  }

  function scanDesktopTable(table) {
    const flightRows = Array.from(table.querySelectorAll('tr[id^="out"], tr[id^="in"]'));
    if (flightRows.length === 0) return [];

    const rawGroups = [];
    let currentGroup = [];

    for (let i = 0; i < flightRows.length; i++) {
      const row = flightRows[i];
      const isStart = isDesktopItineraryStart(row, i === 0);

      if (isStart) {
        if (currentGroup.length > 0) rawGroups.push(currentGroup);
        currentGroup = [row];
      } else {
        if (currentGroup.length > 0) currentGroup.push(row);
        else currentGroup = [row];
      }
    }

    if (currentGroup.length > 0) rawGroups.push(currentGroup);

    return rawGroups.map((rows) => {
      const hasCodeshare = rows.some(isDesktopCodeshare);
      const isSelectable = isDesktopSelectable(rows);

      // Departure time is evaluated STRICTLY on the first leg (rows[0])
      // Arrival time is evaluated STRICTLY on the final leg (rows[rows.length - 1])
      const firstCells = rows[0].querySelectorAll('td');
      const lastCells = rows[rows.length - 1].querySelectorAll('td');

      const depMinutes = firstCells.length > 5 ? parseTimeToMinutes(firstCells[5].textContent) : null;
      const arrMinutes = lastCells.length > 7 ? parseTimeToMinutes(lastCells[7].textContent) : null;

      return {
        rows,
        isPartnerCodeshare: hasCodeshare && !isSelectable,
        isAllNegativeAvail: isDesktopGroupAllNegativeAvail(rows),
        depMinutes,
        arrMinutes
      };
    });
  }

  // ── Mobile detection helpers ──────────────────────────────────────────────

  function isMobileCodeshare(tr) {
    const rel = tr.getAttribute('rel') || '';
    if (/\|C$/i.test(rel)) return true;
    if (tr.classList.contains('codeShareRow')) return true;

    const alinks = tr.querySelectorAll('.alink');
    for (const alink of alinks) {
      const parent = alink.parentElement;
      if (alink.textContent.includes('*') || (parent && parent.textContent.includes('*'))) {
        return true;
      }
    }

    if (tr.querySelector('.nosel') && tr.textContent.includes('*')) return true;
    return tr.textContent.includes('*');
  }

  function isMobileSelectable(tr) {
    const rel = tr.getAttribute('rel') || '';
    if (/\|C$/i.test(rel)) return false;
    if (tr.querySelector('.ui-icon-forbidden')) return false;
    if (tr.querySelector('.nosel')) return false;
    return Boolean(tr.querySelector('.ui-icon-o')) || /\|[0-9]+$/i.test(rel);
  }

  function getMobileRowTimes(row) {
    const cells = row.querySelectorAll('td');
    if (cells.length < 2) return { depMinutes: null, arrMinutes: null };
    const text = cells[1].textContent || '';
    const matches = text.match(/\d{1,2}:\d{2}\s*(?:AM|PM)/gi);
    if (!matches || matches.length === 0) {
      return { depMinutes: null, arrMinutes: null };
    }
    const depMinutes = parseTimeToMinutes(matches[0]);
    const arrMinutes = parseTimeToMinutes(matches[matches.length - 1]);
    return { depMinutes, arrMinutes };
  }

  function isMobileRowAllNegativeAvail(row) {
    const cells = row.querySelectorAll('td');
    if (cells.length < 5) return false;
    const labelCell = cells[3];
    const valCell = cells[4];
    const labelLines = labelCell.innerHTML.split(/<br\s*\/?>/i);
    const valLines = valCell.innerHTML.split(/<br\s*\/?>/i);

    const avails = [];
    for (let i = 0; i < Math.min(labelLines.length, valLines.length); i++) {
      const l = labelLines[i].replace(/<[^>]+>/g, '').trim();
      if (l.includes('Total Avail')) {
        const v = valLines[i].replace(/<[^>]+>/g, '').trim();
        const match = v.match(/^-?\d+/);
        if (match) {
          avails.push(parseInt(match[0], 10));
        } else {
          return false;
        }
      }
    }

    if (avails.length === 0) return false;
    return avails.every((n) => n < 0);
  }

  function scanMobileTable(table) {
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const groups = [];

    for (const row of rows) {
      if (row.querySelector('th') || row.querySelector('td.empty')) continue;

      const rel = row.getAttribute('rel') || '';
      const isMobileFlight =
        /^(outbound|return)\|/i.test(rel) ||
        Boolean(row.querySelector('.alink')) ||
        Boolean(row.querySelector('.ui-icon-o, .ui-icon-forbidden'));

      if (isMobileFlight) {
        const isCodeshare = isMobileCodeshare(row);
        const isSelectable = isMobileSelectable(row);
        const times = getMobileRowTimes(row);
        const isAllNegativeAvail = isMobileRowAllNegativeAvail(row);

        groups.push({
          rows: [row],
          isPartnerCodeshare: isCodeshare && !isSelectable,
          isAllNegativeAvail,
          depMinutes: times.depMinutes,
          arrMinutes: times.arrMinutes
        });
      }
    }

    return groups;
  }

  // ── Desktop & Mobile Filter Bar UI ────────────────────────────────────────

  function findDesktopFilterBarTarget() {
    const resultsBar = document.querySelector('table.resultsBar, .resultsBar');
    if (resultsBar && resultsBar.parentNode) return resultsBar;

    const scrollDiv = document.getElementById('searchTableScrollFixed');
    if (scrollDiv && scrollDiv.parentNode) return scrollDiv;

    const flightsTable = document.getElementById('flightsOut') || document.getElementById('flightsIn');
    if (flightsTable && flightsTable.parentNode) return flightsTable;

    const flightRow = document.querySelector('tr[id^="out"], tr[id^="in"]');
    if (flightRow) {
      const table = flightRow.closest('table');
      if (table && table.parentNode) return table;
    }

    return null;
  }

  function updateSliderVisuals(type) {
    if (type === 'dep') {
      const minPct = (filterDepMin / 1440) * 100;
      const maxPct = (filterDepMax / 1440) * 100;
      if (depTrackHighlight) {
        depTrackHighlight.style.left = `${minPct}%`;
        depTrackHighlight.style.width = `${maxPct - minPct}%`;
      }
      if (depDisplay) {
        depDisplay.textContent = `${formatMinutesToTime(filterDepMin)} – ${formatMinutesToTime(filterDepMax)}`;
      }
    } else if (type === 'arr') {
      const minPct = (filterArrMin / 1440) * 100;
      const maxPct = (filterArrMax / 1440) * 100;
      if (arrTrackHighlight) {
        arrTrackHighlight.style.left = `${minPct}%`;
        arrTrackHighlight.style.width = `${maxPct - minPct}%`;
      }
      if (arrDisplay) {
        arrDisplay.textContent = `${formatMinutesToTime(filterArrMin)} – ${formatMinutesToTime(filterArrMax)}`;
      }
    }
  }

  function ensureFilterBar() {
    let bar = document.getElementById('tn-filter-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'tn-filter-bar';

      // ── Line 1: Title "FILTERS:" on its own line ──────────────────────────
      const titleRow = document.createElement('div');
      titleRow.className = 'tn-filter-row';

      const title = document.createElement('span');
      title.className = 'tn-filter-title';
      title.textContent = 'Filters:';
      titleRow.appendChild(title);
      bar.appendChild(titleRow);

      // ── Line 2: Codeshare Filter ──────────────────────────────────────────
      const line2 = document.createElement('div');
      line2.className = 'tn-filter-row';

      const csLabel = document.createElement('label');
      csLabel.className = 'tn-filter-option';
      csLabel.title = 'Hides non-selectable partner codeshare itineraries (retains Delta Connection)';

      const csCb = document.createElement('input');
      csCb.type = 'checkbox';
      csCb.id = 'tn-filter-codeshare';
      csCb.checked = filterCodeshareEnabled;
      csCb.addEventListener('change', (e) => {
        filterCodeshareEnabled = e.target.checked;
        updateDOM();
      });

      const csSpan = document.createElement('span');
      csSpan.textContent = 'Hide partner codeshares';

      const csBdg = document.createElement('span');
      csBdg.id = 'tn-filter-codeshare-badge';
      csBdg.className = 'tn-filter-badge';
      csBdg.style.display = 'none';

      csLabel.appendChild(csCb);
      csLabel.appendChild(csSpan);
      csLabel.appendChild(csBdg);
      line2.appendChild(csLabel);
      bar.appendChild(line2);

      // ── Line 3: Negative Availability ─────────────────────────────────────
      const line3 = document.createElement('div');
      line3.className = 'tn-filter-row';

      const negLabel = document.createElement('label');
      negLabel.className = 'tn-filter-option';
      negLabel.title = 'Hides search results where all flight legs have negative Total Avail';

      const negCb = document.createElement('input');
      negCb.type = 'checkbox';
      negCb.id = 'tn-filter-negative-avail';
      negCb.checked = filterNegativeAvailEnabled;
      negCb.addEventListener('change', (e) => {
        filterNegativeAvailEnabled = e.target.checked;
        updateDOM();
      });

      const negSpan = document.createElement('span');
      negSpan.textContent = 'Hide negative availability (< 0)';

      const negBdg = document.createElement('span');
      negBdg.id = 'tn-filter-negative-avail-badge';
      negBdg.className = 'tn-filter-badge';
      negBdg.style.display = 'none';

      negLabel.appendChild(negCb);
      negLabel.appendChild(negSpan);
      negLabel.appendChild(negBdg);
      line3.appendChild(negLabel);
      bar.appendChild(line3);

      // ── Line 4: Departure Time Filter (1-hour steps) ──────────────────────
      const line4 = document.createElement('div');
      line4.className = 'tn-filter-row';

      const depLbl = document.createElement('label');
      depLbl.className = 'tn-filter-option tn-filter-label-fixed';
      depLbl.title = 'Filter itineraries by departure time window';

      const depCb = document.createElement('input');
      depCb.type = 'checkbox';
      depCb.id = 'tn-filter-dep-time';
      depCb.checked = filterDepEnabled;
      depCb.addEventListener('change', (e) => {
        filterDepEnabled = e.target.checked;
        updateDOM();
      });

      const depSpan = document.createElement('span');
      depSpan.textContent = 'Departure:';

      depLbl.appendChild(depCb);
      depLbl.appendChild(depSpan);
      line4.appendChild(depLbl);

      const depDisp = document.createElement('span');
      depDisp.className = 'tn-time-display';
      depDisp.id = 'tn-dep-time-display';
      depDisp.textContent = `${formatMinutesToTime(filterDepMin)} – ${formatMinutesToTime(filterDepMax)}`;
      line4.appendChild(depDisp);

      const depSliderWrapper = document.createElement('div');
      depSliderWrapper.className = 'tn-slider-wrapper';

      const depTrackBg = document.createElement('div');
      depTrackBg.className = 'tn-slider-track-bg';
      depSliderWrapper.appendChild(depTrackBg);

      const depTrackHl = document.createElement('div');
      depTrackHl.className = 'tn-slider-track-highlight';
      depTrackHl.id = 'tn-dep-track-highlight';
      depTrackHl.style.left = '0%';
      depTrackHl.style.width = '100%';
      depSliderWrapper.appendChild(depTrackHl);

      const depMinInp = document.createElement('input');
      depMinInp.type = 'range';
      depMinInp.id = 'tn-dep-time-min';
      depMinInp.min = '0';
      depMinInp.max = '1440';
      depMinInp.step = '60';
      depMinInp.value = String(filterDepMin);

      const depMaxInp = document.createElement('input');
      depMaxInp.type = 'range';
      depMaxInp.id = 'tn-dep-time-max';
      depMaxInp.min = '0';
      depMaxInp.max = '1440';
      depMaxInp.step = '60';
      depMaxInp.value = String(filterDepMax);

      depMinInp.addEventListener('input', () => {
        depMinInp.style.zIndex = '3';
        depMaxInp.style.zIndex = '2';
        let val = parseInt(depMinInp.value, 10);
        if (val > filterDepMax - 60) {
          val = filterDepMax - 60;
          depMinInp.value = String(val);
        }
        filterDepMin = val;
        updateSliderVisuals('dep');
      });

      depMaxInp.addEventListener('input', () => {
        depMaxInp.style.zIndex = '3';
        depMinInp.style.zIndex = '2';
        let val = parseInt(depMaxInp.value, 10);
        if (val < filterDepMin + 60) {
          val = filterDepMin + 60;
          depMaxInp.value = String(val);
        }
        filterDepMax = val;
        updateSliderVisuals('dep');
      });

      function handleDepSliderChange() {
        const isDefault = filterDepMin === 0 && filterDepMax === 1440;
        filterDepEnabled = !isDefault;
        depCb.checked = !isDefault;
        updateDOM();
      }

      depMinInp.addEventListener('change', handleDepSliderChange);
      depMaxInp.addEventListener('change', handleDepSliderChange);

      depSliderWrapper.appendChild(depMinInp);
      depSliderWrapper.appendChild(depMaxInp);
      line4.appendChild(depSliderWrapper);

      const depBdg = document.createElement('span');
      depBdg.id = 'tn-filter-dep-time-badge';
      depBdg.className = 'tn-filter-badge';
      depBdg.style.display = 'none';
      line4.appendChild(depBdg);

      bar.appendChild(line4);

      // ── Line 5: Arrival Time Filter (1-hour steps) ────────────────────────
      const line5 = document.createElement('div');
      line5.className = 'tn-filter-row';

      const arrLbl = document.createElement('label');
      arrLbl.className = 'tn-filter-option tn-filter-label-fixed';
      arrLbl.title = 'Filter itineraries by arrival time window';

      const arrCb = document.createElement('input');
      arrCb.type = 'checkbox';
      arrCb.id = 'tn-filter-arr-time';
      arrCb.checked = filterArrEnabled;
      arrCb.addEventListener('change', (e) => {
        filterArrEnabled = e.target.checked;
        updateDOM();
      });

      const arrSpan = document.createElement('span');
      arrSpan.textContent = 'Arrival:';

      arrLbl.appendChild(arrCb);
      arrLbl.appendChild(arrSpan);
      line5.appendChild(arrLbl);

      const arrDisp = document.createElement('span');
      arrDisp.className = 'tn-time-display';
      arrDisp.id = 'tn-arr-time-display';
      arrDisp.textContent = `${formatMinutesToTime(filterArrMin)} – ${formatMinutesToTime(filterArrMax)}`;
      line5.appendChild(arrDisp);

      const arrSliderWrapper = document.createElement('div');
      arrSliderWrapper.className = 'tn-slider-wrapper';

      const arrTrackBg = document.createElement('div');
      arrTrackBg.className = 'tn-slider-track-bg';
      arrSliderWrapper.appendChild(arrTrackBg);

      const arrTrackHl = document.createElement('div');
      arrTrackHl.className = 'tn-slider-track-highlight';
      arrTrackHl.id = 'tn-arr-track-highlight';
      arrTrackHl.style.left = '0%';
      arrTrackHl.style.width = '100%';
      arrSliderWrapper.appendChild(arrTrackHl);

      const arrMinInp = document.createElement('input');
      arrMinInp.type = 'range';
      arrMinInp.id = 'tn-arr-time-min';
      arrMinInp.min = '0';
      arrMinInp.max = '1440';
      arrMinInp.step = '60';
      arrMinInp.value = String(filterArrMin);

      const arrMaxInp = document.createElement('input');
      arrMaxInp.type = 'range';
      arrMaxInp.id = 'tn-arr-time-max';
      arrMaxInp.min = '0';
      arrMaxInp.max = '1440';
      arrMaxInp.step = '60';
      arrMaxInp.value = String(filterArrMax);

      arrMinInp.addEventListener('input', () => {
        arrMinInp.style.zIndex = '3';
        arrMaxInp.style.zIndex = '2';
        let val = parseInt(arrMinInp.value, 10);
        if (val > filterArrMax - 60) {
          val = filterArrMax - 60;
          arrMinInp.value = String(val);
        }
        filterArrMin = val;
        updateSliderVisuals('arr');
      });

      arrMaxInp.addEventListener('input', () => {
        arrMaxInp.style.zIndex = '3';
        arrMinInp.style.zIndex = '2';
        let val = parseInt(arrMaxInp.value, 10);
        if (val < filterArrMin + 60) {
          val = filterArrMin + 60;
          arrMaxInp.value = String(val);
        }
        filterArrMax = val;
        updateSliderVisuals('arr');
      });

      function handleArrSliderChange() {
        const isDefault = filterArrMin === 0 && filterArrMax === 1440;
        filterArrEnabled = !isDefault;
        arrCb.checked = !isDefault;
        updateDOM();
      }

      arrMinInp.addEventListener('change', handleArrSliderChange);
      arrMaxInp.addEventListener('change', handleArrSliderChange);

      arrSliderWrapper.appendChild(arrMinInp);
      arrSliderWrapper.appendChild(arrMaxInp);
      line5.appendChild(arrSliderWrapper);

      const arrBdg = document.createElement('span');
      arrBdg.id = 'tn-filter-arr-time-badge';
      arrBdg.className = 'tn-filter-badge';
      arrBdg.style.display = 'none';
      line5.appendChild(arrBdg);

      bar.appendChild(line5);
    }

    filterBarEl = bar;

    codeshareCheckbox = bar.querySelector('#tn-filter-codeshare');
    codeshareBadge = bar.querySelector('#tn-filter-codeshare-badge');

    negAvailCheckbox = bar.querySelector('#tn-filter-negative-avail');
    negAvailBadge = bar.querySelector('#tn-filter-negative-avail-badge');

    depCheckbox = bar.querySelector('#tn-filter-dep-time');
    depDisplay = bar.querySelector('#tn-dep-time-display');
    depTrackHighlight = bar.querySelector('#tn-dep-track-highlight');
    depMinSlider = bar.querySelector('#tn-dep-time-min');
    depMaxSlider = bar.querySelector('#tn-dep-time-max');
    depBadge = bar.querySelector('#tn-filter-dep-time-badge');

    arrCheckbox = bar.querySelector('#tn-filter-arr-time');
    arrDisplay = bar.querySelector('#tn-arr-time-display');
    arrTrackHighlight = bar.querySelector('#tn-arr-track-highlight');
    arrMinSlider = bar.querySelector('#tn-arr-time-min');
    arrMaxSlider = bar.querySelector('#tn-arr-time-max');
    arrBadge = bar.querySelector('#tn-filter-arr-time-badge');

    if (isMobileView) {
      bar.classList.add('tn-mobile-modal');
      if (bar.parentNode !== document.body) {
        document.body.appendChild(bar);
      }
      bar.style.display = mobileModalOpen ? 'flex' : 'none';
    } else {
      bar.classList.remove('tn-mobile-modal');
      const targetContainer = findDesktopFilterBarTarget();
      if (targetContainer && targetContainer.parentNode) {
        if (bar.parentNode !== targetContainer.parentNode || bar.nextSibling !== targetContainer) {
          targetContainer.parentNode.insertBefore(bar, targetContainer);
        }
      }
      bar.style.display = desktopGroups.length > 0 ? 'flex' : 'none';
    }
  }

  function updateFilterBar() {
    if (!filterBarEl) return;

    if (codeshareCheckbox) codeshareCheckbox.checked = filterCodeshareEnabled;
    if (negAvailCheckbox) negAvailCheckbox.checked = filterNegativeAvailEnabled;
    if (depCheckbox) depCheckbox.checked = filterDepEnabled;
    if (arrCheckbox) arrCheckbox.checked = filterArrEnabled;

    updateSliderVisuals('dep');
    updateSliderVisuals('arr');

    const groups = isMobileView ? mobileGroups : desktopGroups;

    // Codeshare filter badge
    if (codeshareBadge) {
      const csCount = groups.filter((g) => g.isPartnerCodeshare).length;
      if (filterCodeshareEnabled) {
        codeshareBadge.textContent = `${csCount} hidden`;
        codeshareBadge.style.display = 'inline-block';
      } else {
        codeshareBadge.style.display = 'none';
      }
    }

    // Negative Avail badge
    if (negAvailBadge) {
      const negCount = groups.filter((g) => g.isAllNegativeAvail).length;
      if (filterNegativeAvailEnabled) {
        negAvailBadge.textContent = `${negCount} hidden`;
        negAvailBadge.style.display = 'inline-block';
      } else {
        negAvailBadge.style.display = 'none';
      }
    }

    // Departure window badge
    if (depBadge) {
      const depCount = groups.filter(
        (g) => g.depMinutes === null || g.depMinutes < filterDepMin || g.depMinutes > filterDepMax
      ).length;
      if (filterDepEnabled) {
        depBadge.textContent = `${depCount} hidden`;
        depBadge.style.display = 'inline-block';
      } else {
        depBadge.style.display = 'none';
      }
    }

    // Arrival window badge
    if (arrBadge) {
      const arrCount = groups.filter(
        (g) => g.arrMinutes === null || g.arrMinutes < filterArrMin || g.arrMinutes > filterArrMax
      ).length;
      if (filterArrEnabled) {
        arrBadge.textContent = `${arrCount} hidden`;
        arrBadge.style.display = 'inline-block';
      } else {
        arrBadge.style.display = 'none';
      }
    }
  }

  // ── Floating Filter Button UI (Mobile only) ───────────────────────────────

  function ensureIndicator() {
    const existing = document.getElementById('tn-codeshare-container');
    if (existing) {
      containerEl = existing;
      badgeEl = existing.querySelector('#tn-codeshare-badge');
      toggleEl = existing.querySelector('#tn-codeshare-toggle');
      return;
    }

    containerEl = document.createElement('div');
    containerEl.id = 'tn-codeshare-container';

    badgeEl = document.createElement('div');
    badgeEl.id = 'tn-codeshare-badge';
    containerEl.appendChild(badgeEl);

    toggleEl = document.createElement('div');
    toggleEl.id = 'tn-codeshare-toggle';

    // SVG filter funnel icon
    toggleEl.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>`;

    toggleEl.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      mobileModalOpen = !mobileModalOpen;
      ensureFilterBar();
      if (filterBarEl) {
        filterBarEl.style.display = mobileModalOpen ? 'flex' : 'none';
      }
    });

    containerEl.appendChild(toggleEl);
    document.body.appendChild(containerEl);

    // Tap outside modal closes the options
    document.addEventListener('click', (e) => {
      if (!isMobileView || !mobileModalOpen || !filterBarEl) return;
      if (filterBarEl.contains(e.target) || (containerEl && containerEl.contains(e.target))) {
        return;
      }
      mobileModalOpen = false;
      filterBarEl.style.display = 'none';
    });
  }

  function updateIndicator() {
    ensureIndicator();

    if (!isMobileView || mobileGroups.length === 0) {
      containerEl.style.display = 'none';
      if (filterBarEl && isMobileView) filterBarEl.style.display = 'none';
      return;
    }

    containerEl.style.display = 'flex';

    const isAnyActive =
      filterCodeshareEnabled ||
      filterNegativeAvailEnabled ||
      filterDepEnabled ||
      filterArrEnabled;

    if (isAnyActive) {
      toggleEl.classList.add('active'); // Green when any filter is active
      toggleEl.title = 'Filters are ACTIVE. Tap to view/edit filters.';
    } else {
      toggleEl.classList.remove('active'); // Gray when no filter is active
      toggleEl.title = 'Filters are OFF. Tap to open filters.';
    }

    // Count total hidden items on mobile
    let totalHidden = 0;
    for (const group of mobileGroups) {
      const isCodeshareHidden = filterCodeshareEnabled && group.isPartnerCodeshare;
      const isNegativeAvailHidden = filterNegativeAvailEnabled && group.isAllNegativeAvail;
      const isDepHidden =
        filterDepEnabled &&
        (group.depMinutes === null || group.depMinutes < filterDepMin || group.depMinutes > filterDepMax);
      const isArrHidden =
        filterArrEnabled &&
        (group.arrMinutes === null || group.arrMinutes < filterArrMin || group.arrMinutes > filterArrMax);
      if (isCodeshareHidden || isNegativeAvailHidden || isDepHidden || isArrHidden) {
        totalHidden++;
      }
    }

    if (isAnyActive && totalHidden > 0) {
      badgeEl.textContent = `${totalHidden} hidden`;
      badgeEl.style.display = 'block';
    } else {
      badgeEl.style.display = 'none';
    }
  }

  // ── Main scan & filter logic ──────────────────────────────────────────────

  function scanAndFilter() {
    desktopGroups = [];
    mobileGroups = [];

    // 1. Scan for Mobile results tables
    const mobileTables = document.querySelectorAll(
      '#outboundflightstable, #returnflightstable, table.mylist table'
    );
    let foundMobile = false;

    for (const table of mobileTables) {
      const itineraries = scanMobileTable(table);
      if (itineraries.length > 0) {
        foundMobile = true;
        for (const item of itineraries) {
          mobileGroups.push(item);
        }
      }
    }

    // Fallback for mobile rows outside known table IDs
    if (!foundMobile) {
      const mobileRows = document.querySelectorAll('tr[rel^="outbound|"], tr[rel^="return|"]');
      if (mobileRows.length > 0) {
        foundMobile = true;
        for (const row of mobileRows) {
          const isCodeshare = isMobileCodeshare(row);
          const isSelectable = isMobileSelectable(row);
          const times = getMobileRowTimes(row);
          const isAllNegativeAvail = isMobileRowAllNegativeAvail(row);
          mobileGroups.push({
            rows: [row],
            isPartnerCodeshare: isCodeshare && !isSelectable,
            isAllNegativeAvail,
            depMinutes: times.depMinutes,
            arrMinutes: times.arrMinutes
          });
        }
      }
    }

    isMobileView = foundMobile;

    // 2. If no mobile tables found, scan for Desktop results tables
    if (!foundMobile) {
      const tables = document.querySelectorAll('table');
      for (const table of tables) {
        const hasFlightRow = table.querySelector('tr[id^="out"], tr[id^="in"]');
        if (!hasFlightRow) continue;

        const itineraries = scanDesktopTable(table);
        for (const item of itineraries) {
          desktopGroups.push(item);
        }
      }
    }

    ensureFilterBar();
    updateDOM();
  }

  /**
   * Apply visibility and alternating shading to itineraries based on all active filters.
   */
  function updateDOM() {
    let visibleGroupIndex = 0;

    // Desktop itineraries
    for (const group of desktopGroups) {
      const isCodeshareHidden = filterCodeshareEnabled && group.isPartnerCodeshare;
      const isNegativeAvailHidden = filterNegativeAvailEnabled && group.isAllNegativeAvail;

      const isDepHidden =
        filterDepEnabled &&
        (group.depMinutes === null || group.depMinutes < filterDepMin || group.depMinutes > filterDepMax);

      const isArrHidden =
        filterArrEnabled &&
        (group.arrMinutes === null || group.arrMinutes < filterArrMin || group.arrMinutes > filterArrMax);

      const hide = isCodeshareHidden || isNegativeAvailHidden || isDepHidden || isArrHidden;

      if (hide) {
        for (const row of group.rows) {
          row.style.display = 'none';
        }
      } else {
        const targetClass = visibleGroupIndex % 2 === 0 ? 'rowColor1Search' : 'rowColor2';
        const removeClass = visibleGroupIndex % 2 === 0 ? 'rowColor2' : 'rowColor1Search';

        for (const row of group.rows) {
          row.style.display = '';
          row.classList.remove(removeClass);
          row.classList.add(targetClass);
        }
        visibleGroupIndex++;
      }
    }

    // Mobile itineraries
    for (const group of mobileGroups) {
      const isCodeshareHidden = filterCodeshareEnabled && group.isPartnerCodeshare;
      const isNegativeAvailHidden = filterNegativeAvailEnabled && group.isAllNegativeAvail;

      const isDepHidden =
        filterDepEnabled &&
        (group.depMinutes === null || group.depMinutes < filterDepMin || group.depMinutes > filterDepMax);

      const isArrHidden =
        filterArrEnabled &&
        (group.arrMinutes === null || group.arrMinutes < filterArrMin || group.arrMinutes > filterArrMax);

      const hide = isCodeshareHidden || isNegativeAvailHidden || isDepHidden || isArrHidden;

      for (const row of group.rows) {
        row.style.display = hide ? 'none' : '';
      }
    }

    // UI Updates based on view mode
    if (isMobileView) {
      updateIndicator();
    } else {
      if (containerEl) containerEl.style.display = 'none';
    }

    updateFilterBar();
  }

  // ── Dynamic updates & MutationObserver ──────────────────────────────────────

  let debounceTimer = null;
  function scheduleScan() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(scanAndFilter, 250);
  }

  function setupObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.id === 'tn-codeshare-container' || node.id === 'tn-filter-bar') {
              continue;
            }

            if (
              node.tagName === 'TR' ||
              node.tagName === 'TABLE' ||
              (node.querySelector &&
                node.querySelector(
                  'tr[id^="out"], tr[id^="in"], tr[rel^="outbound|"], tr[rel^="return|"], #outboundflightstable, #returnflightstable'
                ))
            ) {
              shouldScan = true;
              break;
            }
          }
        }
        if (shouldScan) break;
      }

      if (shouldScan) scheduleScan();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ── Initialization ──────────────────────────────────────────────────────────

  function init() {
    scanAndFilter();
    setupObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
