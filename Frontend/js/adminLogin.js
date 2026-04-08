const API_BASE = window.location.protocol === "file:" ? "http://localhost:5000" : "";

const form=document.getElementById("loginForm");

form.addEventListener("submit",async function(e){

e.preventDefault();

const email=document.getElementById("email").value;
const password=document.getElementById("password").value;

try{

const response=await fetch(`${API_BASE}/api/admin/login`,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
email,
password
})

});

const data=await response.json();

if(data.admin){

localStorage.setItem("adminEmail", data.admin.email);

window.location.href="adminDashboard.html";

}else{

document.getElementById("message").innerText=data.message;

}

}catch(error){
console.error(error);
document.getElementById("message").innerText="Server error";
}

});
