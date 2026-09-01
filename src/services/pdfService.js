/**
 * Tourister.com Dedicated PDF Generator Service
 * Generates clean, high-resolution, multi-page printable PDF documents with:
 * 1. Official "Tourister.com" logo on the top-left of each page
 * 2. Formatted tables for Route, Day-by-Day Schedule, Sights, Budget, and Safety Contacts
 * 3. Responsive print styling and direct trigger without page distortion
 */

/**
 * Print or Export a complete Trip Plan as PDF
 * @param {Object} planData
 */
export function exportTripPlanToPDF(planData) {
  const {
    source = "Origin",
    destination = "Destination",
    durationDays = 3,
    travelers = 2,
    budget = "Moderate",
    transport = "Train",
    routeSummary = null,
    chosenAttractions = [],
    selectedGuide = null,
    hotelRecommendation = null,
    isFlightTrip = false,
    username = "Tourister Traveler",
  } = planData;

  const printWindow = document.createElement("iframe");
  printWindow.style.position = "fixed";
  printWindow.style.right = "0";
  printWindow.style.bottom = "0";
  printWindow.style.width = "0";
  printWindow.style.height = "0";
  printWindow.style.border = "0";
  document.body.appendChild(printWindow);

  const doc = printWindow.contentWindow.document;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tourister.com — Trip Itinerary: ${source} to ${destination}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 14mm 14mm 14mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background: #ffffff;
      color: #0f172a;
      font-size: 13px;
      line-height: 1.5;
      padding: 10px;
    }
    
    /* TOP LEFT HEADER WITH TOURISTER.COM LOGO */
    .pdf-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 2px solid #6366f1;
      margin-bottom: 16px;
    }
    .pdf-brand-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pdf-brand-icon {
      font-size: 24px;
    }
    .pdf-brand-title {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #1e1b4b;
    }
    .pdf-brand-title span {
      color: #6366f1;
    }
    .pdf-doc-badge {
      background: #e0e7ff;
      color: #3730a3;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    /* TITLE BANNER */
    .pdf-title-banner {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 18px;
      margin-bottom: 16px;
    }
    .pdf-trip-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .pdf-trip-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 12px;
      color: #475569;
    }
    .pdf-meta-pill {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 600;
    }

    /* SUMMARY STATS GRID */
    .pdf-grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    .pdf-stat-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 12px;
    }
    .pdf-stat-card span {
      display: block;
      font-size: 10px;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
    }
    .pdf-stat-card strong {
      font-size: 13px;
      color: #1e1b4b;
    }

    /* SECTION STYLING */
    .pdf-section {
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    .pdf-section-title {
      font-size: 14px;
      font-weight: 800;
      color: #1e1b4b;
      padding-bottom: 4px;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* ITINERARY DAYS */
    .pdf-day-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 10px;
      page-break-inside: avoid;
    }
    .pdf-day-header {
      font-size: 12px;
      font-weight: 800;
      color: #4338ca;
      background: #eef2ff;
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      margin-bottom: 8px;
    }
    .pdf-event-row {
      margin-bottom: 6px;
      padding-left: 8px;
      border-left: 2px solid #6366f1;
    }
    .pdf-event-time {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
    }
    .pdf-event-desc {
      font-size: 12px;
      color: #1e293b;
    }

    /* ATTRACTIONS TABLE */
    .pdf-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
    }
    .pdf-table th, .pdf-table td {
      border: 1px solid #e2e8f0;
      padding: 6px 10px;
      text-align: left;
      font-size: 11px;
    }
    .pdf-table th {
      background: #f1f5f9;
      font-weight: 700;
      color: #334155;
    }

    /* FOOTER */
    .pdf-footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <!-- HEADER WITH TOP-LEFT LOGO -->
  <div class="pdf-header">
    <div class="pdf-brand-wrap">
      <span class="pdf-brand-icon">🌐</span>
      <div class="pdf-brand-title">Tourister<span>.com</span></div>
    </div>
    <div class="pdf-doc-badge">Verified Travel Itinerary</div>
  </div>

  <!-- TITLE BANNER -->
  <div class="pdf-title-banner">
    <div class="pdf-trip-title">Complete Journey Plan: ${source} ➔ ${destination}</div>
    <div class="pdf-trip-meta">
      <div class="pdf-meta-pill">📅 Duration: ${durationDays} Days</div>
      <div class="pdf-meta-pill">👥 Travelers: ${travelers} Persons</div>
      <div class="pdf-meta-pill">🚆 Transit: ${transport}</div>
      <div class="pdf-meta-pill">💰 Budget: ${budget} Tier</div>
      <div class="pdf-meta-pill">👤 Traveler: ${username}</div>
    </div>
  </div>

  <!-- STATS GRID -->
  <div class="pdf-grid-4">
    <div class="pdf-stat-card">
      <span>Route Distance</span>
      <strong>${routeSummary ? `${routeSummary.distanceKm} km` : "Direct Corridor"}</strong>
    </div>
    <div class="pdf-stat-card">
      <span>Estimated Travel Time</span>
      <strong>${routeSummary ? routeSummary.durationFormatted : "Standard Schedule"}</strong>
    </div>
    <div class="pdf-stat-card">
      <span>Assigned Guide</span>
      <strong>${selectedGuide ? selectedGuide.name : "Auto-Matched Local Guide"}</strong>
    </div>
    <div class="pdf-stat-card">
      <span>Recommended Stay</span>
      <strong>${hotelRecommendation ? hotelRecommendation.name : `${budget} Hotel (${destination})`}</strong>
    </div>
  </div>

  <!-- DAY BY DAY ITINERARY -->
  <div class="pdf-section">
    <div class="pdf-section-title">🗓️ Day-by-Day Journey Schedule</div>
    ${Array.from({ length: Number(durationDays) })
      .map((_, dayIdx) => {
        const dayNumber = dayIdx + 1;
        const spotsForDay = chosenAttractions.slice(dayIdx * 2, dayIdx * 2 + 2);
        return `
      <div class="pdf-day-card">
        <div class="pdf-day-header">DAY 0${dayNumber} — ${destination} Exploration</div>
        ${
          dayNumber === 1
            ? `
        <div class="pdf-event-row">
          <div class="pdf-event-time">06:00 AM - 10:30 AM · Departure & Arrival</div>
          <div class="pdf-event-desc">Depart from ${source} via ${transport}. Arrive in ${destination}. Prepaid station/airport transit sync active to hotel.</div>
        </div>`
            : ""
        }
        <div class="pdf-event-row">
          <div class="pdf-event-time">10:30 AM - 01:30 PM · Primary Sightseeing</div>
          <div class="pdf-event-desc">
            ${
              spotsForDay[0]
                ? `Visit <strong>${spotsForDay[0].name}</strong> (${spotsForDay[0].category}). ${spotsForDay[0].description}`
                : `Morning heritage exploration and iconic landmark tour in ${destination}.`
            }
          </div>
        </div>
        <div class="pdf-event-row">
          <div class="pdf-event-time">02:30 PM - 06:30 PM · Afternoon & Sunset Spotting</div>
          <div class="pdf-event-desc">
            ${
              spotsForDay[1]
                ? `Explore <strong>${spotsForDay[1].name}</strong>. Enjoy sunset view and local artisan markets.`
                : `Cultural immersion, local cuisine tasting, and evening leisure stroll.`
            }
          </div>
        </div>
        ${
          dayNumber === Number(durationDays)
            ? `
        <div class="pdf-event-row">
          <div class="pdf-event-time">07:30 PM onwards · Return Journey</div>
          <div class="pdf-event-desc">Check out, pack local specialties & souvenirs, and proceed for departure back to ${source}.</div>
        </div>`
            : ""
        }
      </div>`;
      })
      .join("")}
  </div>

  <!-- ATTRACTIONS TABLE -->
  ${
    chosenAttractions.length > 0
      ? `
  <div class="pdf-section">
    <div class="pdf-section-title">📍 Selected Tourist Attractions & Landmarks (${chosenAttractions.length} Verified)</div>
    <table class="pdf-table">
      <thead>
        <tr>
          <th>Attraction Name</th>
          <th>Category</th>
          <th>Rating</th>
          <th>Timings & Fees</th>
        </tr>
      </thead>
      <tbody>
        ${chosenAttractions
          .map(
            (p) => `
        <tr>
          <td><strong>${p.name}</strong></td>
          <td>${p.category || "Landmark"}</td>
          <td>★ ${p.rating || "4.5"}</td>
          <td>${p.timing || "09:00 AM - 06:00 PM"} · ${p.entryFee || "Free Entry"}</td>
        </tr>`
          )
          .join("")}
      </tbody>
    </table>
  </div>`
      : ""
  }

  <!-- SAFETY & CONTACTS -->
  <div class="pdf-section">
    <div class="pdf-section-title">🛡️ Safety & Essential Travel Contacts</div>
    <table class="pdf-table">
      <tbody>
        <tr>
          <td><strong>Emergency Police Helpline:</strong> 112</td>
          <td><strong>National Tourist Helpline:</strong> 1363</td>
          <td><strong>Medical Emergency:</strong> 108</td>
        </tr>
        <tr>
          <td colspan="3"><strong>Anti-Scam Advisory:</strong> Use only official meter autos or prepaid booths. Avoid unsolicited offline agents near station gates.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- FOOTER -->
  <div class="pdf-footer">
    <div>Generated by <strong>Tourister.com</strong> Travel Intelligence System</div>
    <div>Date: ${new Date().toLocaleDateString()} | Document ID: TST-${Date.now().toString().slice(-6)}</div>
  </div>
</body>
</html>
  `;

  doc.open();
  doc.write(htmlContent);
  doc.close();

  setTimeout(() => {
    printWindow.contentWindow.focus();
    printWindow.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(printWindow);
    }, 2000);
  }, 350);
}

/**
 * Print plain-text / AI Dossier summary as a clean PDF booklet
 * @param {string} dossierText
 * @param {Object} meta
 */
export function exportDossierToPDF(dossierText, meta = {}) {
  const { origin = "Origin", destination = "Destination", days = 3, travelers = 2 } = meta;

  const printWindow = document.createElement("iframe");
  printWindow.style.position = "fixed";
  printWindow.style.right = "0";
  printWindow.style.bottom = "0";
  printWindow.style.width = "0";
  printWindow.style.height = "0";
  printWindow.style.border = "0";
  document.body.appendChild(printWindow);

  const doc = printWindow.contentWindow.document;

  const formattedContent = dossierText
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("===") || trimmed.startsWith("---")) {
        return `<hr style="border:0; border-top:1px solid #e2e8f0; margin:10px 0;" />`;
      }
      if (trimmed.startsWith("1.") || trimmed.startsWith("2.") || trimmed.startsWith("3.") || trimmed.startsWith("4.") || trimmed.startsWith("5.") || trimmed.startsWith("6.")) {
        return `<h3 style="font-size:14px; font-weight:800; color:#1e1b4b; margin:12px 0 6px;">${trimmed}</h3>`;
      }
      if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("[x]")) {
        return `<div style="margin-bottom:4px; padding-left:8px; font-size:12px; color:#334155;">${trimmed}</div>`;
      }
      return `<p style="margin-bottom:6px; font-size:12px; color:#475569;">${trimmed}</p>`;
    })
    .join("");

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tourister.com — Travel Dossier</title>
  <style>
    @page { size: A4 portrait; margin: 15mm 15mm 15mm 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding:10px; color:#0f172a; line-height:1.6; }
    .pdf-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 2px solid #6366f1; margin-bottom: 16px; }
    .pdf-brand { font-size: 22px; font-weight: 900; color: #1e1b4b; display:flex; align-items:center; gap:6px; }
    .pdf-brand span { color: #6366f1; }
    .pdf-badge { background:#e0e7ff; color:#3730a3; padding:3px 8px; border-radius:12px; font-size:10px; font-weight:700; }
    .pdf-footer { margin-top: 24px; padding-top: 10px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; }
  </style>
</head>
<body>
  <div class="pdf-header">
    <div class="pdf-brand">🌐 Tourister<span>.com</span></div>
    <div class="pdf-badge">Official Travel Summary Dossier</div>
  </div>
  <div>${formattedContent}</div>
  <div class="pdf-footer">
    <div>Generated by <strong>Tourister.com</strong></div>
    <div>${origin} ➔ ${destination} (${days} Days, ${travelers} Travelers) | ${new Date().toLocaleDateString()}</div>
  </div>
</body>
</html>`;

  doc.open();
  doc.write(htmlContent);
  doc.close();

  setTimeout(() => {
    printWindow.contentWindow.focus();
    printWindow.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(printWindow);
    }, 2000);
  }, 350);
}
