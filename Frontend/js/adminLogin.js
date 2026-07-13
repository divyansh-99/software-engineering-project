window.SPMSUtils.bindLoginForm({
  buildPayload: () => ({
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  }),
  demoMethod: "loginAdmin",
  path: "/api/admin/login",
  accountKey: "admin",
  sessionKey: "adminEmail",
  sessionValueKey: "email",
  redirect: "adminDashboard.html"
});
