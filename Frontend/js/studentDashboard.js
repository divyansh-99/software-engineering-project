const API_BASE = window.location.protocol === "file:" ? "http://localhost:5000" : "";

const studentId = localStorage.getItem("studentId");

if(!studentId){
window.location.href = "studentLogin.html";
}

async function loadJobs(){

const response = await fetch(`${API_BASE}/api/students/eligible-jobs/${studentId}`);

const jobs = await response.json();

const jobsDiv = document.getElementById("jobs");

jobsDiv.innerHTML = "";

if(jobs.length === 0){

jobsDiv.innerHTML = `<div class="empty-state">No eligible jobs are available right now.</div>`;
return;

}

jobs.forEach(job => {

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
?
"<span class='status-pill'>Already Applied</span>"
:
`<button onclick="applyJob(${job.job_id})">Apply</button>`
}

</div>
`;

});

}

async function applyJob(jobId){

const response = await fetch(`${API_BASE}/api/students/apply-job`,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body: JSON.stringify({
student_id: studentId,
job_id: jobId
})

});

const data = await response.json();

alert(data.message);

loadJobs();
loadAppliedJobs();

}

loadJobs();
loadAppliedJobs();


function logout(){

localStorage.removeItem("studentId");

window.location.href = "studentLogin.html";

}

async function loadAppliedJobs(){

const response = await fetch(`${API_BASE}/api/students/applied-jobs/${studentId}`);

const jobs = await response.json();

const appliedDiv = document.getElementById("appliedJobs");

appliedDiv.innerHTML = "";

if(jobs.length === 0){

appliedDiv.innerHTML = `<div class="empty-state">You have not applied to any jobs yet.</div>`;
return;

}

function getStatusClass(status){

if(status === "Accepted" || status === "Selected"){
return "status-pill status-accepted";
}

if(status === "Rejected"){
return "status-pill status-rejected";
}

return "status-pill status-pending";

}

jobs.forEach(job => {

appliedDiv.innerHTML += `
<div class="job-card">

<h3>${job.title}</h3>

<div class="job-meta">
<span class="meta-pill">Package: ${job.package_lpa} LPA</span>
<span class="${getStatusClass(job.status)}">Status: ${job.status}</span>
</div>

</div>
`;

});

}
