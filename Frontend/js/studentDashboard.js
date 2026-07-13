const studentId = window.SPMSUtils.requireSession("studentId", "studentLogin.html");

async function loadJobs() {
  const { data: jobs } = await window.SPMSUtils.request({
    demo: (service) => service.getEligibleJobs(studentId),
    path: `/api/students/eligible-jobs/${studentId}`
  });

  const jobsDiv = document.getElementById("jobs");
  jobsDiv.innerHTML = "";

  if (jobs.length === 0) {
    jobsDiv.innerHTML = `<div class="empty-state">No eligible jobs are available right now.</div>`;
    return;
  }

  jobs.forEach((job) => {
    jobsDiv.innerHTML += `
<div class="job-card">
<h3>${job.title}</h3>
<p>${job.description}</p>
<div class="job-meta">
<span class="meta-pill">Package: ${job.package_lpa} LPA</span>
<span class="meta-pill">Min CGPA: ${job.min_cgpa}</span>
</div>
${
  job.application_id
    ? `<span class="${window.SPMSUtils.getStatusClass(job.application_status || "Applied")}">Status: ${window.SPMSUtils.getStatusLabel(job.application_status || "Applied")}</span>`
    : `<button onclick="applyJob(${job.job_id})">Apply</button>`
}
</div>
`;
  });
}

async function applyJob(jobId) {
  const payload = {
    student_id: studentId,
    job_id: jobId
  };
  const { data } = await window.SPMSUtils.request({
    demo: (service) => service.applyJob(payload),
    path: "/api/students/apply-job",
    method: "POST",
    body: payload
  });

  alert(data.message);
  loadJobs();
  loadAppliedJobs();
}

async function loadAppliedJobs() {
  const { data: jobs } = await window.SPMSUtils.request({
    demo: (service) => service.getAppliedJobs(studentId),
    path: `/api/students/applied-jobs/${studentId}`
  });

  const appliedDiv = document.getElementById("appliedJobs");
  appliedDiv.innerHTML = "";

  if (jobs.length === 0) {
    appliedDiv.innerHTML = `<div class="empty-state">You have not applied to any jobs yet.</div>`;
    return;
  }

  jobs.forEach((job) => {
    appliedDiv.innerHTML += `
<div class="job-card">
<h3>${job.title}</h3>
<div class="job-meta">
<span class="meta-pill">Package: ${job.package_lpa} LPA</span>
<span class="${window.SPMSUtils.getStatusClass(job.status)}">Status: ${window.SPMSUtils.getStatusLabel(job.status)}</span>
</div>
</div>
`;
  });
}

loadJobs();
loadAppliedJobs();
