window.SPMSUtils.bindLoginForm({
  buildPayload: () => ({
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  }),
  demoMethod: "loginStudent",
  path: "/api/students/login",
  accountKey: "student",
  sessionKey: "studentId",
  sessionValueKey: "id",
  redirect: "studentDashboard.html"
});
