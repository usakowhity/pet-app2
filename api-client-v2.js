// api-client-v2.js

// ------------------------------
// 画像生成（N1 → N2）
// ------------------------------
async function apiGenerateImage(data) {
  const res = await fetch(`${API_BASE_URL}/api/generate-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),   // ★ 修正：そのまま送る
  });
  return await res.json();
}

// ------------------------------
// 喜び動画生成（P2）
// ------------------------------
async function apiGenerateVideo(data) {
  const res = await fetch(`${API_BASE_URL}/api/generate-video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),   // ★ 修正：そのまま送る
  });
  return await res.json();
}

// ------------------------------
// アセット保存
// ------------------------------
async function apiSaveUserModeAsset(data) {
  const res = await fetch(`${API_BASE_URL}/api/save-user-mode-asset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

// ------------------------------
// ヘルスチェック
// ------------------------------
async function apiHealth() {
  const res = await fetch(`${API_BASE_URL}/api/health`);
  return await res.json();
}

// ------------------------------
// window.apiClient に登録
// ------------------------------
window.apiClient = {
  apiGenerateImage,
  apiGenerateVideo,
  apiSaveUserModeAsset,
  apiHealth,
};