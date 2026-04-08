async function loadStats(){

const response = await fetch("http://localhost:5000/api/admin/stats");

const data = await response.json();

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

loadStats();

async function loadJobs(){

const response = await fetch("http://localhost:5000/api/admin/jobs");

const jobs = await response.json();

const jobsDiv = document.getElementById("jobs");

jobsDiv.innerHTML="";

if(jobs.length === 0){

jobsDiv.innerHTML = `<div class="empty-state">No jobs have been posted yet.</div>`;
return;

}

jobs.forEach(job=>{

jobsDiv.innerHTML+=`
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

loadJobs();
