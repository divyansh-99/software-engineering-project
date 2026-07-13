window.SPMSUtils.bindLoginForm({
  buildPayload: () => ({
    contact_email: document.getElementById("email").value,
    password: document.getElementById("password").value
  }),
  demoMethod: "loginCompany",
  path: "/api/companies/login",
  accountKey: "company",
  sessionKey: "companyId",
  sessionValueKey: "id",
  redirect: "companyDashboard.html"
});
