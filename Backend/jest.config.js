module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: [
    "controllers/**/*.js",
    "routes/**/*.js",
    "app.js"
  ],
  coveragePathIgnorePatterns: ["/node_modules/"],
  clearMocks: true
};
