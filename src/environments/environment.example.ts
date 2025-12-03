// Example local configuration for secrets
// Copy this file to: environment.local.ts
// This file is gitignored and will never be committed
// For production, use AWS Amplify environment variables instead

export const localConfig = {
  github: {
    // Get your token from: https://github.com/settings/tokens
    // Required scopes: Basic access (no special scopes needed for GitHub Models)
    pat: 'github_pat_YOUR_TOKEN_HERE',
  },
};
