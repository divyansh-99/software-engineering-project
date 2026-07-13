(function () {
  const dataService = window.SPMSDataService;
  const apiBase = window.location.protocol === "file:" ? "http://localhost:5000" : "";

  async function request({ demo, path, method = "GET", body }) {
    if (dataService && dataService.useDemo && demo) {
      const data = await demo(dataService);
      return {
        data,
        ok: data && data.ok !== undefined ? data.ok : true
      };
    }

    const options = { method };
    if (body !== undefined) {
      options.headers = {
        "Content-Type": "application/json"
      };
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${apiBase}${path}`, options);
    const data = await response.json().catch(() => ({
      message: "Server error"
    }));

    return {
      data,
      ok: response.ok
    };
  }

  function setMessage(message) {
    document.getElementById("message").innerText = message;
  }

  function bindLoginForm({
    buildPayload,
    demoMethod,
    path,
    accountKey,
    sessionKey,
    sessionValueKey,
    redirect
  }) {
    const form = document.getElementById("loginForm");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = buildPayload();

      try {
        const { data } = await request({
          demo: (service) => service[demoMethod](payload),
          path,
          method: "POST",
          body: payload
        });
        const account = data[accountKey];

        if (account) {
          localStorage.setItem(sessionKey, account[sessionValueKey]);
          window.location.href = redirect;
          return;
        }

        setMessage(data.message);
      } catch (error) {
        console.error(error);
        setMessage("Server error");
      }
    });
  }

  function bindRegistrationForm({
    buildPayload,
    demoMethod,
    path,
    redirect
  }) {
    const form = document.getElementById("registerForm");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = buildPayload();

      try {
        const { data, ok } = await request({
          demo: (service) => service[demoMethod](payload),
          path,
          method: "POST",
          body: payload
        });

        setMessage(data.message);

        if (ok) {
          form.reset();
          setTimeout(() => {
            window.location.href = redirect;
          }, 1200);
        }
      } catch (error) {
        console.error(error);
        setMessage("Server error");
      }
    });
  }

  function requireSession(sessionKey, redirect) {
    const value = localStorage.getItem(sessionKey);

    if (!value) {
      window.location.href = redirect;
    }

    return value;
  }

  function logout(sessionKey, redirect) {
    localStorage.removeItem(sessionKey);
    window.location.href = redirect;
  }

  function getStatusClass(status) {
    if (status === "Accepted" || status === "Selected") {
      return "status-pill status-accepted";
    }

    if (status === "Rejected") {
      return "status-pill status-rejected";
    }

    return "status-pill status-pending";
  }

  function getStatusLabel(status) {
    if (status === "Selected") {
      return "Accepted";
    }

    if (status === "Applied") {
      return "Pending";
    }

    return status;
  }

  window.SPMSUtils = {
    bindLoginForm,
    bindRegistrationForm,
    getStatusClass,
    getStatusLabel,
    logout,
    request,
    requireSession
  };
})();
