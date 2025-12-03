// Development environment configuration
// For local development: Copy environment.example.ts to environment.local.ts and add your GitHub PAT
// In CI/test environments without environment.local.ts, AI features will be disabled (empty PAT)

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyBKnrcZbmpF15HGEOpWhQgYAE14jMz2wHE',
    authDomain: 'focusgo-6450e.firebaseapp.com',
    projectId: 'focusgo-6450e',
    storageBucket: 'focusgo-6450e.firebasestorage.app',
    messagingSenderId: '844992821880',
    appId: '1:844992821880:web:13c9ae7e31f74ccf52cb8d',
    measurementId: 'G-0842SCQMVE',
  },
  github: {
    // GitHub PAT loaded from environment.local.ts (gitignored)
    // Falls back to empty string in CI/test environments
    pat: '',
    modelsApiUrl: 'https://models.inference.ai.azure.com',
    modelName: 'gpt-4o',
  },
};
