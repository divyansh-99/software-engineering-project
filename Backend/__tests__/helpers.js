// Shared test helpers for building mock Express req/res objects.

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

function mockReq({ body = {}, params = {} } = {}) {
  return { body, params };
}

module.exports = { mockRes, mockReq };
