window.SPMSUtils.bindRegistrationForm({
  buildPayload: () => ({
    company_name: document.getElementById("company_name").value,
    contact_email: document.getElementById("contact_email").value,
    password: document.getElementById("password").value
  }),
  demoMethod: "registerCompany",
  path: "/api/companies/register",
  redirect: "companyLogin.html"
});
