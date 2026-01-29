/* -------------------------------------------------------
   pet-app2 script.js（Railway版・完全統合版）
   - n1 をホームとして表示
   - 生成中は選択モードのみ回転＆他無効化
   - 生成後は n1 に戻って待機
   - 撫でる・声・笑顔 → 生成済み p2 / 静止画を表示
   - 動画終了 or 10秒後に n1 に戻る
------------------------------------------------------- */

const API_BASE = "https://pet-app2-api-production.up.railway.app";

const videoBtn = document.getElementById("videoModeBtn");
const imageSelect = document.getElementById("imageModeSelect");
const generateBtn = document.getElementById("generateBtn");
const resultArea = document.getElementById("result-area");
let mediaElement = document.getElementById("mediaElement");

let selectedMode = null;
let generatedAsset = null;   // 生成済みの動画/画像
let isReacting = false;      // インタラクション重複防止

/* -------------------------------------------------------
   初期表示：n1 をホームとして表示
------------------------------------------------------- */
window.addEventListener("DOMContentLoaded", () => {
  const n1 = localStorage.getItem("n1Url");
  if (n1) {
    mediaElement.src = n1;
  } else {
    resultArea.textContent = "まずはペット登録画面で代表写真（n1）を登録してください。";
  }
});

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
   ボタン状態制御（回転・無効化）
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
   生成ボタン
------------------------------------------------------- */
generateBtn.addEventListener("click", async () => {
  if (!selectedMode) {
    resultArea.textContent = "モードを選択してください。";
    return;
  }

  const userId = localStorage.getItem("userId");
  const species = localStorage.getItem("species");
  const n1Url = localStorage.getItem("n1Url");

  if (!userId || !species || !n1Url) {
    resultArea.textContent = "ペット登録が完了していません。pet-register.html で設定してください。";
    return;
  }

  generatedAsset = null;
  setButtonState(selectedMode);
  showLoadingAnimation();

  try {
    if (selectedMode === "p2") {
      await generateVideo(userId, species, n1Url);
    } else {
      await generateImage(selectedMode, userId, species, n1Url);
    }

    generatedAsset = {
      mode: selectedMode,
      url: mediaElement.src
    };

    returnToN1();
    resultArea.textContent = "生成が完了しました。撫でる・声・笑顔で再生されます。";
  } catch (err) {
    console.error(err);
    resultArea.textContent = "生成中にエラーが発生しました：" + err.message;
  } finally {
    hideLoadingAnimation();
    resetButtonState();
  }
});

/* -------------------------------------------------------
   画像生成（安定版 API を維持）
------------------------------------------------------- */
async function generateImage(mode, userId, species, n1Url) {
  const res = await fetch(`${API_BASE}/api/generate-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, modeId: mode, species, n1Url })
  });

  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "画像生成に失敗しました");

  mediaElement.src = data.assetUrl;
}

/* -------------------------------------------------------
   動画生成（安定版 API を維持）
------------------------------------------------------- */
async function generateVideo(userId, species, n1Url) {
  const res = await fetch(`${API_BASE}/api/generate-video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, species, n1Url })
  });

  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "動画生成に失敗しました");

  mediaElement.src = data.videoUrl;
}

/* -------------------------------------------------------
   生成済みアセットの再生（インタラクションから呼ばれる）
------------------------------------------------------- */
function triggerGeneratedAsset() {
  if (!generatedAsset) return;

  const { mode, url } = generatedAsset;

  if (mode === "p2") {
    mediaElement.outerHTML = `
      <video id="mediaElement" src="${url}" autoplay playsinline></video>
    `;
    mediaElement = document.getElementById("mediaElement");

    mediaElement.onended = () => {
      returnToN1();
      isReacting = false;
    };
  } else {
    mediaElement.outerHTML = `
      <img id="mediaElement" src="${url}" />
    `;
    mediaElement = document.getElementById("mediaElement");

    setTimeout(() => {
      returnToN1();
      isReacting = false;
    }, 10000);
  }
}

/* -------------------------------------------------------
   n1 に戻る（ホーム画面）
------------------------------------------------------- */
function returnToN1() {
  const n1Url = localStorage.getItem("n1Url");
  if (!n1Url) return;

  mediaElement.outerHTML = `
    <img id="mediaElement" src="${n1Url}" />
  `;
  mediaElement = document.getElementById("mediaElement");
}

/* -------------------------------------------------------
   インタラクション → 反応 → 生成済みアセット再生
------------------------------------------------------- */
function triggerPetReaction() {
  if (isReacting) return;
  if (!generatedAsset) return;

  isReacting = true;
  playSpeciesSound();
  triggerGeneratedAsset();
}

/* -------------------------------------------------------
   種族別の音声再生
------------------------------------------------------- */
function playSpeciesSound() {
  const species = localStorage.getItem("species");
  const audio = document.getElementById("pet-sound");
  if (!species || !audio) return;

  let path = "";
  switch (species) {
    case "dog":
      path = "assets/sounds/dog-happy.mp3";
      break;
    case "cat":
      path = "assets/sounds/cat-happy.mp3";
      break;
    case "rabbit":
      path = "assets/sounds/rabbit-happy.mp3";
      break;
    default:
      return;
  }

  audio.src = path;
  audio.volume = 0.8;
  audio.play().catch(() => {
    console.log("音声の自動再生がブロックされました。");
  });
}

/* -------------------------------------------------------
   撫でる（タッチ・クリック）
------------------------------------------------------- */
function enableTouchInteraction() {
  const wrapper = document.getElementById("mediaWrapper");
  if (!wrapper) return;

  wrapper.addEventListener("touchstart", () => {
    triggerPetReaction();
  });

  wrapper.addEventListener("mousedown", () => {
    triggerPetReaction();
  });
}

/* -------------------------------------------------------
   音声認識（名前・キーワード）
------------------------------------------------------- */
function enableVoiceInteraction() {
  const micBtn = document.getElementById("mic-btn");
  if (!micBtn) return;

  micBtn.onclick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("音声認識がサポートされていません。");
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = "ja-JP";

    recog.onresult = (e) => {
      const text = e.results[0][0].transcript;
      console.log("認識:", text);

      const customName = (localStorage.getItem("customName") || "").trim();
      const keywords = (localStorage.getItem("customKeywords") || "")
        .split(",")
        .map(k => k.trim())
        .filter(k => k.length > 0);

      let hit = false;

      if (customName && text.includes(customName)) {
        hit = true;
      } else if (keywords.some(k => text.includes(k))) {
        hit = true;
      }

      if (hit) {
        triggerPetReaction();
      }
    };

    recog.start();
  };
}

/* -------------------------------------------------------
   笑顔検知（MediaPipe）
------------------------------------------------------- */
function enableSmileDetection() {
  const cameraBtn = document.getElementById("camera-btn");
  const inputVideo = document.getElementById("input-video");
  if (!cameraBtn || !inputVideo) return;

  cameraBtn.onclick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    inputVideo.srcObject = stream;
    inputVideo.style.display = "block";

    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults((results) => {
      if (!results.multiFaceLandmarks || !results.multiFaceLandmarks[0]) return;

      const lm = results.multiFaceLandmarks[0];
      const mouthLeft = lm[61];
      const mouthRight = lm[291];
      const mouthTop = lm[13];
      const mouthBottom = lm[14];

      const width = Math.hypot(mouthRight.x - mouthLeft.x, mouthRight.y - mouthLeft.y);
      const height = Math.hypot(mouthBottom.x - mouthTop.x, mouthBottom.y - mouthTop.y);
      const smileRatio = height / width;

      if (smileRatio > 0.35) {
        triggerPetReaction();
      }
    });

    const camera = new Camera(inputVideo, {
      onFrame: async () => {
        await faceMesh.send({ image: inputVideo });
      },
      width: 640,
      height: 480
    });

    camera.start();
  };
}

/* -------------------------------------------------------
   インタラクション有効化
------------------------------------------------------- */
enableTouchInteraction();
enableVoiceInteraction();
enableSmileDetection();