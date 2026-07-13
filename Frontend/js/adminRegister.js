window.SPMSUtils.bindRegistrationForm({
  buildPayload: () => ({
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  }),
  demoMethod: "registerAdmin",
  path: "/api/admin/register",
  redirect: "adminLogin.html"
});
