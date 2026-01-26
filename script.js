/* -------------------------------------------------------
   初期設定
------------------------------------------------------- */
const API_BASE = "https://pet-app2-api.vercel.app";

const videoBtn = document.getElementById("videoModeBtn");
const imageSelect = document.getElementById("imageModeSelect");
const generateBtn = document.getElementById("generateBtn");
const resultArea = document.getElementById("result-area");
let mediaElement = document.getElementById("mediaElement");

let selectedMode = null;
let generatedAsset = null; // ← 生成済みの動画/画像を保持


/* -------------------------------------------------------
   モード選択
------------------------------------------------------- */
videoBtn.addEventListener("click", () => {
  selectedMode = "p2";
  imageSelect.value = "";
  resultArea.textContent = "喜び動画を生成します。";
});

imageSelect.addEventListener("change", () => {
  selectedMode = imageSelect.value;
  resultArea.textContent = selectedMode ? "画像を生成します。" : "モードを選択してください。";
});


/* -------------------------------------------------------
   ボタン状態制御
------------------------------------------------------- */
function setButtonState(activeMode) {
  const buttons = document.querySelectorAll(".mode-section button, .mode-section select");

  buttons.forEach(btn => {
    if (btn.dataset.mode === activeMode || btn.value === activeMode) {
      btn.classList.add("active-rotate");
      btn.disabled = false;
    } else {
      btn.classList.remove("active-rotate");
      btn.disabled = true;
      btn.classList.add("disabled");
    }
  });
}

function resetButtonState() {
  const buttons = document.querySelectorAll(".mode-section button, .mode-section select");

  buttons.forEach(btn => {
    btn.classList.remove("active-rotate");
    btn.classList.remove("disabled");
    btn.disabled = false;
  });
}


/* -------------------------------------------------------
   生成ボタン
------------------------------------------------------- */
generateBtn.addEventListener("click", async () => {
  if (!selectedMode) {
    resultArea.textContent = "モードを選択してください。";
    return;
  }

  setButtonState(selectedMode);
  showLoadingAnimation();

  if (selectedMode === "p2") {
    await generateVideo();
  } else {
    await generateImage(selectedMode);
  }

  hideLoadingAnimation();
  resetButtonState();

  // 生成結果を保存（表示はしない）
  generatedAsset = {
    mode: selectedMode,
    url: mediaElement.src
  };

  // n1 に戻す
  mediaElement.src = localStorage.getItem("n1Url");
  resultArea.textContent = "生成が完了しました。インタラクションで再生できます。";
});


/* -------------------------------------------------------
   生成中アニメーション
------------------------------------------------------- */
function showLoadingAnimation() {
  resultArea.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>生成中です… 少しお待ちください。</p>
    </div>
  `;
}

function hideLoadingAnimation() {
  resultArea.innerHTML = "";
}


/* -------------------------------------------------------
   画像生成
------------------------------------------------------- */
async function generateImage(mode) {
  try {
    const userId = localStorage.getItem("userId");
    const species = localStorage.getItem("species");
    const n1Url = localStorage.getItem("n1Url");

    const res = await fetch(`${API_BASE}/api/generate-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, modeId: mode, species, n1Url })
    });

    const data = await res.json();
    if (!data.ok) throw new Error(data.error);

    mediaElement.src = data.assetUrl;

  } catch (err) {
    resultArea.textContent = "通信エラー：" + err.message;
  }
}


/* -------------------------------------------------------
   動画生成
------------------------------------------------------- */
async function generateVideo() {
  try {
    const userId = localStorage.getItem("userId");
    const species = localStorage.getItem("species");
    const n1Url = localStorage.getItem("n1Url");

    const res = await fetch(`${API_BASE}/api/generate-video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, species, n1Url })
    });

    const data = await res.json();
    if (!data.ok) throw new Error(data.error);

    mediaElement.src = data.videoUrl;

  } catch (err) {
    resultArea.textContent = "通信エラー：" + err.message;
  }
}


/* -------------------------------------------------------
   インタラクション発火 → 生成済みの動画/画像を表示
------------------------------------------------------- */
function triggerGeneratedAsset() {
  if (!generatedAsset) return;

  const { mode, url } = generatedAsset;

  if (mode === "p2") {
    mediaElement.outerHTML = `
      <video id="mediaElement" src="${url}" autoplay playsinline></video>
    `;
    mediaElement = document.getElementById("mediaElement");

    mediaElement.onended = () => returnToN1();
  } else {
    mediaElement.src = url;
    setTimeout(returnToN1, 10000);
  }
}


/* -------------------------------------------------------
   n1 に戻る
------------------------------------------------------- */
function returnToN1() {
  mediaElement.outerHTML = `
    <img id="mediaElement" src="${localStorage.getItem("n1Url")}" />
  `;
  mediaElement = document.getElementById("mediaElement");
}


/* -------------------------------------------------------
   インタラクション（撫でる・声・笑顔）
------------------------------------------------------- */
function triggerPetReaction() {
  playSpeciesSound();
  triggerGeneratedAsset();
}

/* 既存の enableTouchInteraction / enableVoiceInteraction / enableSmileDetection はそのまま利用 */


