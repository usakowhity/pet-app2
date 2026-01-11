// ======================================================
//  ローカル保存データ（安全版）
// ======================================================
let raw = localStorage.getItem("userPets");
let userPets = [];

try {
  userPets = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(userPets)) userPets = [];
} catch (e) {
  userPets = [];
}

let currentPreset = null;

// 保存
function saveUserPets() {
  localStorage.setItem("userPets", JSON.stringify(userPets));
}

// ======================================================
//  初期プリセット（userPets が空のときだけ生成）
// ======================================================
if (userPets.length === 0) {
  userPets = [
    {
      id: "usako",
      name: "Usako（白うさぎ）",
      type: "rabbit",
      alias: "",
      keywords: ["かわいい", "うさぎ", "ラビット"],
      images: ["assets/usako/n1.png"],
      videos: ["assets/usako/p1.mp4"]
    },
    {
      id: "kuro",
      name: "Kuro（黒うさぎ）",
      type: "rabbit",
      alias: "",
      keywords: ["黒うさぎ", "くろ"],
      images: ["assets/kuro/n1.png"],
      videos: ["assets/kuro/p1.mp4"]
    },
    {
      id: "taro",
      name: "Taro（パピヨン子犬）",
      type: "dog",
      alias: "",
      keywords: ["たろう", "タロウ", "わんわん"],
      images: ["assets/taro/n1.png"],
      videos: ["assets/taro/p1.mp4"]
    },
    {
      id: "marple",
      name: "Marple（トイプードル）",
      type: "dog",
      alias: "",
      keywords: ["マープル", "トイプー"],
      images: ["assets/marple/n1.png"],
      videos: ["assets/marple/p1.mp4"]
    },
    {
      id: "pochi",
      name: "Pochi（柴犬子犬）",
      type: "dog",
      alias: "",
      keywords: ["ポチ", "しばいぬ"],
      images: ["assets/pochi/n1.png"],
      videos: ["assets/pochi/p1.mp4"]
    },
    {
      id: "tama",
      name: "Tama（猫）",
      type: "cat",
      alias: "",
      keywords: ["たま", "にゃー", "ねこ"],
      images: ["assets/tama/n1.png"],
      videos: ["assets/tama/p1.mp4"]
    }
  ];
  saveUserPets();
}

// ======================================================
//  DOM 要素取得
// ======================================================
const petSelect = document.getElementById("pet-select");
const statusDiv = document.getElementById("status");
const petVideo = document.getElementById("pet-video");
const petImg = document.getElementById("pet-img");

const micBtn = document.getElementById("mic-btn");
const cameraBtn = document.getElementById("camera-btn");

const barkSound = document.getElementById("bark-sound");
const eatingSound = document.getElementById("eating-sound");
const drinkingSound = document.getElementById("drinking-sound");

// モーダル関連
const customModal = document.getElementById("custom-modal");
const customBtn = document.getElementById("custom-btn");
const saveCustomBtn = document.getElementById("save-custom");
const closeModalBtn = document.getElementById("close-modal");
const modalPetName = document.getElementById("modal-pet-name");
const customNameInput = document.getElementById("custom-name");
const customKeywordsInput = document.getElementById("custom-keywords");

// ======================================================
//  ユーティリティ
// ======================================================
function findPetById(id) {
  return userPets.find(p => p.id === id) || null;
}

function updateStatus(text) {
  statusDiv.textContent = text;
}

// ======================================================
//  ペット表示更新
// ======================================================
function showCurrentPet() {
  if (!currentPreset) {
    petImg.style.display = "none";
    petVideo.style.display = "none";
    return;
  }

  // まず画像を表示（デフォルト）
  petVideo.pause();
  petVideo.style.display = "none";

  if (currentPreset.images && currentPreset.images.length > 0) {
    petImg.src = currentPreset.images[0];
    petImg.style.display = "block";
  } else {
    petImg.style.display = "none";
  }

  const displayName = currentPreset.alias || currentPreset.name;
  updateStatus(`「${displayName}」と遊んでね`);
}

// ======================================================
//  セレクトボックスでペット選択
// ======================================================
petSelect.addEventListener("change", () => {
  const id = petSelect.value;
  currentPreset = findPetById(id);
  showCurrentPet();
});

// 初期選択
(function initSelection() {
  const firstId = petSelect.value;
  currentPreset = findPetById(firstId);
  showCurrentPet();
})();

// ======================================================
//  呼び名・言葉設定モーダル
// ======================================================
customBtn.addEventListener("click", () => {
  if (!currentPreset) return;

  modalPetName.textContent = currentPreset.name;
  customNameInput.value = currentPreset.alias || "";
  customKeywordsInput.value = currentPreset.keywords?.join(", ") || "";

  customModal.style.display = "flex";
});

closeModalBtn.addEventListener("click", () => {
  customModal.style.display = "none";
});

saveCustomBtn.addEventListener("click", () => {
  if (!currentPreset) return;

  currentPreset.alias = customNameInput.value.trim();

  const raw = customKeywordsInput.value.trim();
  currentPreset.keywords = raw
    ? raw.split(",").map(w => w.trim()).filter(w => w.length > 0)
    : [];

  saveUserPets();
  customModal.style.display = "none";
  showCurrentPet();
});

// ======================================================
//  音声認識（ブラウザ標準 / 簡易版）
// ======================================================
let recognition = null;
let micActive = false;

if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = "ja-JP";
  recognition.continuous = true;

  recognition.onresult = (event) => {
    const text = event.results[event.results.length - 1][0].transcript;
    handleVoiceInput(text);
  };

  recognition.onend = () => {
    if (micActive) {
      recognition.start();
    }
  };
}

function handleVoiceInput(text) {
  if (!currentPreset || !currentPreset.keywords) return;

  if (currentPreset.keywords.some(k => text.includes(k))) {
    // 喜びリアクション：とりあえず吠え声＋ステータス
    const displayName = currentPreset.alias || currentPreset.name;
    updateStatus(`「${displayName}」は喜んでいるみたい！`);
    barkSound.currentTime = 0;
    barkSound.play().catch(() => {});
  }
}

micBtn.addEventListener("click", () => {
  if (!recognition) {
    alert("このブラウザでは音声認識が利用できません。");
    return;
  }
  if (!micActive) {
    recognition.start();
    micActive = true;
    micBtn.textContent = "🎤 音声認識（停止）";
  } else {
    recognition.stop();
    micActive = false;
    micBtn.textContent = "🎤 音声認識";
  }
});

// ======================================================
//  カメラ／笑顔検知ボタン（今はプレースホルダ）
// ======================================================
cameraBtn.addEventListener("click", () => {
  alert("笑顔検知は準備中です（FaceMesh は正常に読み込まれています）。");
});

// ここに mediapipe face_mesh / camera_utils を使った
// 本格的な笑顔検知ロジックを後で追加できる。