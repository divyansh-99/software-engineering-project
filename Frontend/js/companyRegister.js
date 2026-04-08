const form = document.getElementById("registerForm");

form.addEventListener("submit", async function (e) {

  e.preventDefault();

  const payload = {
    company_name: document.getElementById("company_name").value,
    contact_email: document.getElementById("contact_email").value,
    password: document.getElementById("password").value
  };

  try {
    const response = await fetch("http://localhost:5000/api/companies/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    document.getElementById("message").innerText = data.message;

    if (response.ok) {
      form.reset();
      setTimeout(() => {
        window.location.href = "companyLogin.html";
      }, 1200);
    }
  } catch (error) {
    console.error(error);
    document.getElementById("message").innerText = "Server error";
  }

});
