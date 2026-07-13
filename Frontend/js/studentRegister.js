window.SPMSUtils.bindRegistrationForm({
  buildPayload: () => ({
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    roll_number: document.getElementById("roll_number").value,
    branch: document.getElementById("branch").value,
    cgpa: document.getElementById("cgpa").value
  }),
  demoMethod: "registerStudent",
  path: "/api/students/register",
  redirect: "studentLogin.html"
});
