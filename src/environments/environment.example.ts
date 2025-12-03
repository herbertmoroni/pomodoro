// Example local configuration for secrets
// Copy this file to: environment.local.ts
// This file is gitignored and will never be committed
// For production, use AWS Amplify environment variables instead

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
    // Get your token from: https://github.com/settings/tokens
    // Required scopes: Basic access (no special scopes needed for GitHub Models)
    pat: 'github_pat_YOUR_TOKEN_HERE',
    modelsApiUrl: 'https://models.inference.ai.azure.com',
    modelName: 'gpt-4o',
  },
};
