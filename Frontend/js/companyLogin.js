const form = document.getElementById("loginForm");

form.addEventListener("submit", async function(e){

e.preventDefault();

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

try{

const response = await fetch("http://localhost:5000/api/companies/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify({
contact_email:email,
password:password
})
});

const data = await response.json();

if(data.company){

localStorage.setItem("companyId",data.company.id);

window.location.href="companyDashboard.html";

}else{

document.getElementById("message").innerText=data.message;

}

}catch(error){
console.error(error);
document.getElementById("message").innerText="Server error";
}

});
