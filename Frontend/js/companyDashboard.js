const companyId = localStorage.getItem("companyId");

if(!companyId){
window.location.href="companyLogin.html";
}

const form = document.getElementById("jobForm");

form.addEventListener("submit", async function(e){

e.preventDefault();

const title = document.getElementById("title").value;
const description = document.getElementById("description").value;
const package_lpa = document.getElementById("package").value;
const min_cgpa = document.getElementById("cgpa").value;
const branch_allowed = document.getElementById("branch").value;

await fetch("http://localhost:5000/api/companies/post-job",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body: JSON.stringify({
company_id:companyId,
title,
description,
package_lpa,
min_cgpa,
branch_allowed
})

});

form.reset();

loadJobs();
loadApplications();

});

function getStatusClass(status){

if(status === "Accepted" || status === "Selected"){
return "status-pill status-accepted";
}

if(status === "Rejected"){
return "status-pill status-rejected";
}

return "status-pill status-pending";

}

function getStatusLabel(status){

if(status === "Selected"){
return "Accepted";
}

if(status === "Applied"){
return "Pending";
}

return status;

}

async function loadJobs(){

const response = await fetch(`http://localhost:5000/api/companies/jobs/${companyId}`);

const jobs = await response.json();

const jobsDiv=document.getElementById("jobs");

jobsDiv.innerHTML="";

if(jobs.length === 0){

jobsDiv.innerHTML = `<div class="empty-state">No jobs posted yet. Add your first role above.</div>`;
return;

}

jobs.forEach(job=>{

jobsDiv.innerHTML+=`
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

async function loadApplications(){

const response = await fetch(`http://localhost:5000/api/companies/applications/${companyId}`);

const applications = await response.json();

const applicationsDiv = document.getElementById("applications");

applicationsDiv.innerHTML = "";

if(applications.length === 0){

applicationsDiv.innerHTML = `<div class="empty-state">No student applications have been received yet.</div>`;
return;

}

applications.forEach(application => {

applicationsDiv.innerHTML += `
<div class="job-card">

<h3>${application.student_name}</h3>

<p>Applied for ${application.job_title}</p>

<div class="job-meta">
<span class="meta-pill">Email: ${application.student_email}</span>
<span class="meta-pill">Roll No: ${application.roll_number}</span>
<span class="meta-pill">Branch: ${application.branch}</span>
<span class="meta-pill">CGPA: ${application.cgpa}</span>
<span class="${getStatusClass(application.status)}">Status: ${getStatusLabel(application.status)}</span>
</div>

<div class="action-row">
<button type="button" onclick="updateApplicationStatus(${application.application_id}, 'Accepted')">Accept</button>
<button type="button" class="secondary-button" onclick="updateApplicationStatus(${application.application_id}, 'Rejected')">Reject</button>
</div>

</div>
`;

});

}

async function updateApplicationStatus(applicationId, status){

const response = await fetch("http://localhost:5000/api/companies/applications/status", {
method: "PUT",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
company_id: companyId,
application_id: applicationId,
status
})
});

const data = await response.json();

alert(data.message);

loadApplications();

}

function logout(){

localStorage.removeItem("companyId");

window.location.href="companyLogin.html";

}

loadJobs();
loadApplications();
