module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/../jest.setup.ts"], // أضف هذا السطر
  ignorePatterns: [
    "dist",
    "node_modules",
    ".eslintrc.cjs",
    "jest.config.js", // ← أضف
    "jest.setup.ts", // ← أضف
  ],
};
