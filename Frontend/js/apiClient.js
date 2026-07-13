(function () {
  async function requestJson(url, options) {
    let response;

    try {
      response = await fetch(url, options);
    } catch (cause) {
      const error = new Error("Unable to reach the server");
      error.cause = cause;
      throw error;
    }

    const body = await response.text();
    let data = {};

    if (body) {
      try {
        data = JSON.parse(body);
      } catch (cause) {
        const error = new Error("Server returned an invalid response");
        error.status = response.status;
        error.cause = cause;
        throw error;
      }
    }

    if (!response.ok) {
      const error = new Error(
        data.message || `Request failed with status ${response.status}`
      );
      error.status = response.status;
      throw error;
    }

    return data;
  }

  function getErrorMessage(error, fallback) {
    return error && error.message ? error.message : fallback;
  }

  function logError(error) {
    if (!error.status || error.status >= 500) {
      console.error(error);
    }
  }

  window.SPMSApi = {
    getErrorMessage,
    logError,
    requestJson
  };
})();
