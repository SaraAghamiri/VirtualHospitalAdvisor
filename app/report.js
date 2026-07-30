/* ===========================================================
   VirtualHospitalAdvisor — Report Compiler
   Reads everything saved to localStorage across the flow and
   renders a single printable recommendation report.
   =========================================================== */

window.addEventListener("DOMContentLoaded", renderReport);

function renderReport() {
  const scoredPains = JSON.parse(localStorage.getItem("vha_scoredPains") || "[]");
  const topPains = JSON.parse(localStorage.getItem("vha_topPains") || "[]");
  const phaseD = JSON.parse(localStorage.getItem("vha_phaseD") || "[]");
  const rec = JSON.parse(localStorage.getItem("vha_recommendation") || "null");

  const body = document.getElementById("reportBody");

  if (!scoredPains.length || !rec) {
    body.innerHTML = `
      <p class="note">No completed assessment found.
      <a href="questionnaire.html">Start the assessment &rarr;</a></p>
    `;
    return;
  }

  const labelMap = { A: "A", B: "B", C: "C", D: "D" };

  body.innerHTML = `
    <section class="report-section">
      <h3>1. All Selected Pains (Ranked by Priority Score)</h3>
      <table class="report-table">
        <thead><tr><th>Pain</th><th>Category</th><th>Severity</th><th>Urgency</th><th>Frequency</th><th>PPS</th></tr></thead>
        <tbody>
          ${scoredPains.map(p => `
            <tr>
              <td>${p.value}</td><td>${p.category}</td>
              <td>${p.severity}</td><td>${p.urgency}</td><td>${p.frequency}</td>
              <td><strong>${p.pps.toFixed(1)}</strong></td>
            </tr>`).join("")}
        </tbody>
      </table>
    </section>

    <section class="report-section">
      <h3>2. Solution-Fit Assessment (Top ${topPains.length} Pains)</h3>
      ${phaseD.map(d => `
        <div class="card">
          <strong>${d.pain}</strong>
          <ul>
            <li>Prior attempts: ${labelMap[d.attempted]}</li>
            <li>Confidence VH solves this: ${labelMap[d.confidence]}</li>
            <li>Faster/cheaper alternative exists: ${labelMap[d.alternative]}</li>
            <li>Standalone ROI justification: ${labelMap[d.standalone]}</li>
          </ul>
        </div>
      `).join("")}
    </section>

    <section class="report-section">
      <h3>3. Organizational Readiness</h3>
      <ul>
        <li>Clinical: ${rec.readiness.clinical}/5</li>
        <li>Technology: ${rec.readiness.technology}/5</li>
        <li>Data &amp; Analytics: ${rec.readiness.data}/5</li>
        <li>Workforce: ${rec.readiness.workforce}/5</li>
        <li>Financial: ${rec.readiness.financial}/5</li>
        <li>Training Infrastructure: ${rec.readiness.training}/5</li>
        <li>Validated ROI model available: ${rec.readiness.roiModel ? "Yes" : "No"}</li>
      </ul>
    </section>

    <section class="report-section highlight">
      <h3>4. Recommendation</h3>
      ${rec.shouldInvest ? `
        <p class="recommendation-headline">Recommended Domain: <strong>${rec.topDomain}</strong></p>
        <p>Confidence: <strong>${rec.confidence}</strong>${rec.closeCall ? ` (close call vs. ${rec.runnerUp})` : ""}</p>
        <ul>${rec.reasoning.map(r => `<li>${r}</li>`).join("")}</ul>
      ` : `
        <p class="recommendation-headline">Virtual Hospital investment is not clearly indicated at this time.</p>
        <p>Consider strengthening readiness in weak areas, or revisit pain prioritization, before proceeding.</p>
      `}
    </section>

    <section class="report-section">
      <h3>Known Limitation</h3>
      <p>This report is a rule-based decision-support output, not a validated economic or clinical model.
         Cost estimates are not yet included in this MVP; use it to structure the conversation with stakeholders,
         not as a capital allocation decision on its own.</p>
    </section>
  `;
}

function startOver() {
  if (confirm("This will clear your current assessment. Continue?")) {
    localStorage.removeItem("vha_scoredPains");
    localStorage.removeItem("vha_topPains");
    localStorage.removeItem("vha_phaseD");
    localStorage.removeItem("vha_recommendation");
    location.href = "index.html";
  }
}