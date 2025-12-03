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
    // In production, this should be injected via AWS Amplify environment variables
    // For now, AI features will be disabled in production until configured
    pat: '',
    modelsApiUrl: 'https://models.inference.ai.azure.com',
    modelName: 'gpt-4o',
  },
};
