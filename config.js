window.CIEL_CONFIG = {
  // Leave empty to keep using browser localStorage only.
  // After deploying the Notion proxy Worker, set this to its public URL,
  // for example: "https://ciel-notion-progress.<your-subdomain>.workers.dev"
  progressApiBaseUrl: "",

  // Shared mode means every visitor reads/writes the same Notion checklist.
  progressMode: "notion-shared"
};
