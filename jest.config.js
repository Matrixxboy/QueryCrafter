export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    '^(\.{1,2}/.*)\.js$': '$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!node-fetch|groq-sdk)/',
  ],
};
