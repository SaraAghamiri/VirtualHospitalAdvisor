/* ===========================================================
   VirtualHospitalAdvisor — Recommendation Engine
   Mirrors the Recommendation_Mapping rule base (RULE-001..006):
   maps organizational pains + readiness scores to a
   recommended Virtual Hospital domain.
   =========================================================== */

let scoredPains = [];

window.addEventListener("DOMContentLoaded", () => {
  const stored = localStorage.getItem("vha_scoredPains");
  if (!stored) {
    document.getElementById("noPains").classList.remove("hidden");
  } else {
    scoredPains = JSON.parse(stored);
  }
});

function tick(id) {
  document.getElementById(id + "_val").textContent = document.getElementById(id).value;
}

function hasPain(value) {
  return scoredPains.some(p => p.value === value);
}
function painScore(value) {
  const p = scoredPains.find(p => p.value === value);
  return p ? p.pps : 0;
}

function runRecommendation() {
  const readiness = {
    clinical: Number(document.getElementById("r_clinical").value),
    technology: Number(document.getElementById("r_technology").value),
    data: Number(document.getElementById("r_data").value),
    workforce: Number(document.getElementById("r_workforce").value),
    financial: Number(document.getElementById("r_financial").value),
    training: Number(document.getElementById("r_training").value),
    roiModel: document.getElementById("r_roi").checked
  };

  const scores = { "Care Delivery": 0, "Digital Twin": 0, "Workforce Simulation": 0, "Immersive Training": 0 };
  const reasoning = [];

  // RULE-001: capacity/access pains + strong tech readiness -> Care Delivery
  const accessPains = ["Bed capacity shortage", "Geographic access barriers", "Specialist access gap", "Long ED wait times"];
  if (accessPains.some(hasPain) && readiness.technology >= 4) {
    scores["Care Delivery"] += 30;
    reasoning.push("RULE-001: Capacity/access pain(s) present with strong technology readiness (>=4) — supports Care Delivery models (hospital-at-home, virtual wards).");
  }

  // RULE-002: cost/readmission pains + financial readiness + ROI model -> Care Delivery
  const costPains = ["High cost per inpatient stay", "Avoidable readmission costs"];
  if (costPains.some(hasPain) && readiness.financial >= 4 && readiness.roiModel) {
    scores["Care Delivery"] += 25;
    reasoning.push("RULE-002: Cost/readmission pain present with strong financial readiness and an existing ROI model — supports Care Delivery investment.");
  }

  // RULE-003: inefficient utilization + data maturity -> Digital Twin
  if (hasPain("Inefficient care utilization") && readiness.data >= 3) {
    scores["Digital Twin"] += 25;
    reasoning.push("RULE-003: Inefficient care utilization with moderate-to-strong data maturity — supports Digital Twin simulation for scheduling/utilization.");
  }

  // RULE-004: bed capacity + data maturity -> Digital Twin
  if (hasPain("Bed capacity shortage") && readiness.data >= 3) {
    scores["Digital Twin"] += 15;
    reasoning.push("RULE-004: Bed capacity shortage with moderate-to-strong data maturity — supports Digital Twin modeling of bed/ward operations.");
  }

  // RULE-005: burnout/staffing pains + workforce readiness -> Workforce Simulation
  const workforcePains = ["Physician burnout", "Staffing shortages", "Specialist retention"];
  if (workforcePains.some(hasPain) && readiness.workforce >= 2) {
    scores["Workforce Simulation"] += 25;
    reasoning.push("RULE-005: Workforce pain(s) present with at least pilot-stage workforce readiness — supports Workforce Simulation (burnout/staffing modeling).");
  }

  // RULE-006: training infrastructure readiness -> Immersive Training (baseline contribution)
  if (readiness.training >= 3) {
    scores["Immersive Training"] += 15;
    reasoning.push("RULE-006: Simulation/training infrastructure readiness is at least moderate — supports Immersive Training investment for skills/safety training.");
  }
  if (hasPain("Preventable deterioration")) {
    scores["Immersive Training"] += 10;
    reasoning.push("Preventable deterioration pain present — simulation-based clinical training can directly address this.");
  }

  // Rank domains
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topDomain, topScore] = ranked[0];
  const [, secondScore] = ranked[1];

  let shouldInvest = topScore > 0;
  let confidence = "Low";
  if (topScore >= 40) confidence = "High";
  else if (topScore >= 20) confidence = "Medium";

  const margin = topScore - secondScore;
  const closeCall = margin < 10 && topScore > 0;

  const recommendation = {
    shouldInvest,
    topDomain: shouldInvest ? topDomain : null,
    scores,
    confidence,
    closeCall,
    runnerUp: closeCall ? ranked[1][0] : null,
    reasoning,
    readiness
  };

  localStorage.setItem("vha_recommendation", JSON.stringify(recommendation));
  renderRecommendation(recommendation);
}

function renderRecommendation(rec) {
  const el = document.getElementById("recommendationOutput");

  if (!rec.shouldInvest) {
    el.innerHTML = `
      <div class="card recommendation-card no-invest">
        <h2>Recommendation: Virtual Hospital investment not clearly indicated</h2>
        <p>Based on your selected pains and readiness scores, no domain scored strongly enough to
           justify a confident recommendation. Consider addressing readiness gaps first, or revisit
           your pain prioritization.</p>
      </div>
    `;
    document.getElementById("reportButtonWrap")?.remove();
    return;
  }

  el.innerHTML = `
    <div class="card recommendation-card">
      <h2>Recommended Domain: ${rec.topDomain}</h2>
      <p><strong>Confidence:</strong> ${rec.confidence}${rec.closeCall ? ` (close call vs. ${rec.runnerUp})` : ""}</p>

      <h3>Domain Scores</h3>
      <ul class="score-list">
        ${Object.entries(rec.scores).sort((a,b) => b[1]-a[1]).map(([d, s]) => `<li>${d}: ${s}</li>`).join("")}
      </ul>

      <h3>Reasoning</h3>
      <ul>${rec.reasoning.length ? rec.reasoning.map(r => `<li>${r}</li>`).join("") : "<li>No specific rules fired — recommendation based on baseline scores only.</li>"}</ul>
    </div>
    <button type="button" class="btn-primary" onclick="location.href='report.html'">
      View Full Report &rarr;
    </button>
  `;
}