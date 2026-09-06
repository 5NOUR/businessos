jest.mock("@nestjs/cache-manager", () => ({
  CACHE_MANAGER: "CACHE_MANAGER",
  CacheModule: {
    register: jest.fn().mockReturnValue({
      module: class {},
      providers: [],
      exports: [],
    }),
  },
  ignorePatterns: [
    "dist",
    "node_modules",
    ".eslintrc.cjs",
    "jest.config.js", // ← أضف
    "jest.setup.ts", // ← أضف
  ],
}));
