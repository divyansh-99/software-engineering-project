const companyId = window.SPMSUtils.requireSession("companyId", "companyLogin.html");

const form = document.getElementById("jobForm");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const payload = {
    company_id: companyId,
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    package_lpa: document.getElementById("package").value,
    min_cgpa: document.getElementById("cgpa").value,
    branch_allowed: document.getElementById("branch").value
  };

  await window.SPMSUtils.request({
    demo: (service) => service.postJob(payload),
    path: "/api/companies/post-job",
    method: "POST",
    body: payload
  });

  form.reset();
  loadJobs();
  loadApplications();
});

async function loadJobs() {
  const { data: jobs } = await window.SPMSUtils.request({
    demo: (service) => service.getCompanyJobs(companyId),
    path: `/api/companies/jobs/${companyId}`
  });

  const jobsDiv = document.getElementById("jobs");
  jobsDiv.innerHTML = "";

  if (jobs.length === 0) {
    jobsDiv.innerHTML = `<div class="empty-state">No jobs posted yet. Add your first role above.</div>`;
    return;
  }

  jobs.forEach((job) => {
    jobsDiv.innerHTML += `
<div class="job-card">
<h3>${job.title}</h3>
<p>${job.description}</p>
<div class="job-meta">
<span class="meta-pill">Package: ${job.package_lpa} LPA</span>
</div>
</div>
`;
  });
}

async function loadApplications() {
  const { data: applications } = await window.SPMSUtils.request({
    demo: (service) => service.getCompanyApplications(companyId),
    path: `/api/companies/applications/${companyId}`
  });

  const applicationsDiv = document.getElementById("applications");
  applicationsDiv.innerHTML = "";

  if (applications.length === 0) {
    applicationsDiv.innerHTML = `<div class="empty-state">No student applications have been received yet.</div>`;
    return;
  }

  applications.forEach((application) => {
    applicationsDiv.innerHTML += `
<div class="job-card">
<h3>${application.student_name}</h3>
<p>Applied for ${application.job_title}</p>
<div class="job-meta">
<span class="meta-pill">Email: ${application.student_email}</span>
<span class="meta-pill">Roll No: ${application.roll_number}</span>
<span class="meta-pill">Branch: ${application.branch}</span>
<span class="meta-pill">CGPA: ${application.cgpa}</span>
<span class="${window.SPMSUtils.getStatusClass(application.status)}">Status: ${window.SPMSUtils.getStatusLabel(application.status)}</span>
</div>
<div class="action-row">
<button type="button" onclick="updateApplicationStatus(${application.application_id}, 'Accepted')">Accept</button>
<button type="button" class="secondary-button" onclick="updateApplicationStatus(${application.application_id}, 'Rejected')">Reject</button>
</div>
</div>
`;
  });
}

async function updateApplicationStatus(applicationId, status) {
  const payload = {
    company_id: companyId,
    application_id: applicationId,
    status
  };
  const { data } = await window.SPMSUtils.request({
    demo: (service) => service.updateCompanyApplicationStatus(payload),
    path: "/api/companies/applications/status",
    method: "PUT",
    body: payload
  });

  alert(data.message);
  loadApplications();
}

loadJobs();
loadApplications();
