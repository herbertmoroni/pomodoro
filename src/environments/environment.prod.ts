// Production environment configuration
// For production: Set GITHUB_PAT as environment variable in AWS Amplify Console
// AWS Amplify -> App Settings -> Environment variables -> Add: GITHUB_PAT=your_token

export const environment = {
  production: true,
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
    // This will be replaced at build time via Amplify build command
    // In Amplify Console: Add GITHUB_PAT environment variable
    // Then in build settings, add to preBuild:
    // - sed -i "s|GITHUB_PAT_PLACEHOLDER|$GITHUB_PAT|g" src/environments/environment.prod.ts
    pat: 'GITHUB_PAT_PLACEHOLDER',
    modelsApiUrl: 'https://models.inference.ai.azure.com',
    modelName: 'gpt-4o',
  },
};
