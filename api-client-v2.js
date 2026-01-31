// api-client.js

async function apiGenerateImage(prompt) {
  const res = await fetch(`${API_BASE_URL}/api/generate-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  return await res.json();
}

async function apiGenerateVideo(imageUrl) {
  const res = await fetch(`${API_BASE_URL}/api/generate-video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl }),
  });
  return await res.json();
}

async function apiSaveUserModeAsset(data) {
  const res = await fetch(`${API_BASE_URL}/api/save-user-mode-asset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

async function apiHealth() {
  const res = await fetch(`${API_BASE_URL}/api/health`);
  return await res.json();
}

window.apiClient = {
  apiGenerateImage,
  apiGenerateVideo,
  apiSaveUserModeAsset,
  apiHealth,
};