const API_BASE = window.location.protocol === "file:" ? "http://localhost:5000" : "";
const USE_DEMO_DATA = window.SPMSDataService && window.SPMSDataService.useDemo;

const form = document.getElementById("loginForm");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    let data;

    if (USE_DEMO_DATA) {
      data = await window.SPMSDataService.loginStudent({ email, password });
    } else {
      const response = await fetch(`${API_BASE}/api/students/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
      data = await response.json();
    }

    if (data.student) {
      localStorage.setItem("studentId", data.student.id);
      window.location.href = "studentDashboard.html";
    } else {
      document.getElementById("message").innerText = data.message;
    }
  } catch (error) {
    console.error(error);
    document.getElementById("message").innerText = "Server error";
  }
});
