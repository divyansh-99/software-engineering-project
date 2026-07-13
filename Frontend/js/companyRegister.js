const API_BASE = window.location.protocol === "file:" ? "http://localhost:5000" : "";
const USE_DEMO_DATA = window.SPMSDataService && window.SPMSDataService.useDemo;
const { getErrorMessage, logError, requestJson } = window.SPMSApi;

const form = document.getElementById("registerForm");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const payload = {
    company_name: document.getElementById("company_name").value,
    contact_email: document.getElementById("contact_email").value,
    password: document.getElementById("password").value
  };

  try {
    let data;
    let ok;

    if (USE_DEMO_DATA) {
      data = await window.SPMSDataService.registerCompany(payload);
      ok = data.ok;
    } else {
      data = await requestJson(`${API_BASE}/api/companies/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      ok = true;
    }

    document.getElementById("message").innerText = data.message;

    if (ok) {
      form.reset();
      setTimeout(() => {
        window.location.href = "companyLogin.html";
      }, 1200);
    }
  } catch (error) {
    logError(error);
    document.getElementById("message").innerText = getErrorMessage(
      error,
      "Server error"
    );
  }
});
