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
let editingIndex = -1;

function saveUserPets() {
    localStorage.setItem("userPets", JSON.stringify(userPets));
}

// ======================================================
//  初期プリセット（userPets が空のときだけ生成）
// ======================================================
if (userPets.length === 0) {
    userPets = [
        {
            name: "Usako",
            type: "rabbit",
            alias: "",
            keywords: ["かわいい", "うさぎ"],
            images: ["assets/usako/n1.png", "assets/usako/n2.png"],
            videos: ["assets/usako/p1.mp4"]
        },
        {
            name: "Kuro",
            type: "cat",
            alias: "",
            keywords: ["にゃー", "猫"],
            images: ["assets/kuro/n1.png", "assets/kuro/n2.png"],
            videos: ["assets/kuro/p1.mp4"]
        },
        {
            name: "Taro",
            type: "dog",
            alias: "",
            keywords: ["わんわん", "犬"],
            images: ["assets/taro/n1.png", "assets/taro/n2.png"],
            videos: ["assets/taro/p1.mp4"]
        }
    ];
    saveUserPets();
}

// ======================================================
//  鳴き声マップ
// ======================================================
const soundMap = {
    rabbit: new Audio("assets/sounds/bark_rabbit.mp3"),
    dog: new Audio("assets/sounds/bark_dog.mp3"),
    cat: new Audio("assets/sounds/bark_cat.mp3")
};

// ======================================================
//  状態遷移フラグ
// ======================================================
let lastInteractionTime = Date.now();
let p2_until = 0;
let p3_until = 0;
let p4_until = 0;
let p5_until = 0;
let p6_until = 0;
let p7_until = 0;
let n2_until = 0;
let n3_until = 0;

// ======================================================
//  ペットカード描画
// ======================================================
function renderPetCards() {
    const container = document.getElementById("pet-list");
    container.innerHTML = "";

    userPets.forEach((pet, index) => {
        const card = document.createElement("div");
        card.className = "pet-card";
        card.innerHTML = `
            <div class="pet-name">${pet.alias || pet.name}</div>
        `;
        card.addEventListener("click", () => selectPetByIndex(index));
        container.appendChild(card);
    });
}

// ======================================================
//  ペット選択
// ======================================================
function selectPetByIndex(index) {
    currentPreset = userPets[index];
    editingIndex = index;

    document.getElementById("selected-name").textContent =
        currentPreset.alias || currentPreset.name;

    showStateMedia();
}

// ======================================================
//  状態に応じて画像・動画を表示
// ======================================================
function showStateMedia() {
    if (!currentPreset) return;

    const img = document.getElementById("pet-image");
    const video = document.getElementById("pet-video");

    img.style.display = "block";
    video.style.display = "none";

    img.src = currentPreset.images[0];
}

// ======================================================
//  呼び名・言葉設定モーダル
// ======================================================
const customModal = document.getElementById("custom-modal");
const customBtn = document.getElementById("custom-btn");
const saveCustomBtn = document.getElementById("save-custom");
const closeModalBtn = document.getElementById("close-modal");

const customNameInput = document.getElementById("custom-name");
const customKeywordsInput = document.getElementById("custom-keywords");
const modalPetName = document.getElementById("modal-pet-name");

// モーダルを開く
customBtn.addEventListener("click", () => {
    if (!currentPreset) return;

    modalPetName.textContent = currentPreset.name;
    customNameInput.value = currentPreset.alias || "";
    customKeywordsInput.value = currentPreset.keywords?.join(", ") || "";

    customModal.style.display = "flex";
});

// モーダルを閉じる
closeModalBtn.addEventListener("click", () => {
    customModal.style.display = "none";
});

// 保存処理
saveCustomBtn.addEventListener("click", () => {
    if (!currentPreset) return;

    currentPreset.alias = customNameInput.value.trim();

    const raw = customKeywordsInput.value.trim();
    currentPreset.keywords = raw
        ? raw.split(",").map(w => w.trim()).filter(w => w.length > 0)
        : [];

    saveUserPets();
    customModal.style.display = "none";
    renderPetCards();
});

// ======================================================
//  音声認識（ブラウザ標準）
// ======================================================
let recognition = null;

if ("webkitSpeechRecognition" in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.continuous = true;

    recognition.onresult = (event) => {
        const text = event.results[event.results.length - 1][0].transcript;
        handleVoiceInput(text);
    };

    recognition.start();
}

function handleVoiceInput(text) {
    if (!currentPreset) return;

    if (currentPreset.keywords.some(k => text.includes(k))) {
        soundMap[currentPreset.type]?.play();
    }
}

// ======================================================
//  初期化
// ======================================================
renderPetCards();