const API_BASE = window.location.protocol === "file:" ? "http://localhost:5000" : "";
const USE_DEMO_DATA = window.SPMSDataService && window.SPMSDataService.useDemo;
const { getErrorMessage, logError, requestJson } = window.SPMSApi;
const adminEmail = localStorage.getItem("adminEmail");

if (!adminEmail) {
  window.location.href = "adminLogin.html";
}

async function loadStats() {
  let data;

  if (USE_DEMO_DATA) {
    data = await window.SPMSDataService.getAdminStats();
  } else {
    data = await requestJson(`${API_BASE}/api/admin/stats`);
  }

  document.getElementById("stats").innerHTML = `
<div class="stat-card">
<span class="stat-label">Total Students</span>
<span class="stat-value">${data.total_students}</span>
</div>
<div class="stat-card">
<span class="stat-label">Total Jobs</span>
<span class="stat-value">${data.total_jobs}</span>
</div>
<div class="stat-card">
<span class="stat-label">Applications</span>
<span class="stat-value">${data.total_applications}</span>
</div>
<div class="stat-card">
<span class="stat-label">Placed Students</span>
<span class="stat-value">${data.placed_students}</span>
</div>
`;
}

async function loadJobs() {
  let jobs;

  if (USE_DEMO_DATA) {
    jobs = await window.SPMSDataService.getAdminJobs();
  } else {
    jobs = await requestJson(`${API_BASE}/api/admin/jobs`);
  }

  const jobsDiv = document.getElementById("jobs");
  jobsDiv.innerHTML = "";

  if (jobs.length === 0) {
    jobsDiv.innerHTML = `<div class="empty-state">No jobs have been posted yet.</div>`;
    return;
  }

  jobs.forEach((job) => {
    jobsDiv.innerHTML += `
<div class="job-card">
<h3>${job.title}</h3>
<p>${job.description}</p>
<div class="job-meta">
<span class="meta-pill">Company: ${job.company_name}</span>
<span class="meta-pill">Package: ${job.package_lpa} LPA</span>
</div>
</div>
`;
  });
}

function showLoadError(containerId, error) {
  logError(error);

  const container = document.getElementById(containerId);
  const message = document.createElement("div");
  message.className = "empty-state";
  message.textContent = getErrorMessage(error, "Unable to load data");
  container.replaceChildren(message);
}

loadStats().catch((error) => showLoadError("stats", error));
loadJobs().catch((error) => showLoadError("jobs", error));

function logout() {
  localStorage.removeItem("adminEmail");
  window.location.href = "adminLogin.html";
}
