const API_BASE = window.location.protocol === "file:" ? "http://localhost:5000" : "";

const form = document.getElementById("registerForm");

form.addEventListener("submit", async function (e) {

  e.preventDefault();

  const payload = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    roll_number: document.getElementById("roll_number").value,
    branch: document.getElementById("branch").value,
    cgpa: document.getElementById("cgpa").value
  };

  try {
    const response = await fetch(`${API_BASE}/api/students/register`, {
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
        window.location.href = "studentLogin.html";
      }, 1200);
    }
  } catch (error) {
    console.error(error);
    document.getElementById("message").innerText = "Server error";
  }

});
