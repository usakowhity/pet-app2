// ======================================================
//  ローカル保存データ
// ======================================================
let userPets = JSON.parse(localStorage.getItem("userPets") || "[]");
let currentPreset = null;
let editingIndex = -1;

function saveUserPets() {
    localStorage.setItem("userPets", JSON.stringify(userPets));
}

// ======================================================
//  初回起動時：プリセットを自動登録（assets パス版）
// ======================================================
function loadDefaultPresets() {
    if (localStorage.getItem("presetsLoaded")) return;

    const presets = [
        { name: "Usako", species: "rabbit", folder: "usako", desc: "白ネザーランドドワーフ" },
        { name: "Kuro", species: "rabbit", folder: "kuro", desc: "黒ネザーランドドワーフ" },
        { name: "Taro", species: "dog", folder: "taro", desc: "白パピヨン子犬" },
        { name: "Marple", species: "dog", folder: "marple", desc: "白トイプードル" },
        { name: "Pochi", species: "dog", folder: "pochi", desc: "柴犬子犬" },
        { name: "Tama", species: "cat", folder: "tama", desc: "薄茶白胸猫" }
    ];

    presets.forEach(p => {
        userPets.push({
            name: p.name,
            species: p.species,
            alias: "",
            keywords: [],
            description: p.desc,

            images: {
                n1: `assets/${p.folder}/n1.png`,
                n2: `assets/${p.folder}/n2.png`,
                n3: `assets/${p.folder}/n3.png`,
                p3: `assets/${p.folder}/p3.png`,
                p4: `assets/${p.folder}/p4.png`
            },

            videos: {
                p1: `assets/${p.folder}/p1.png`,
                p2: `assets/${p.folder}/p2.png`,
                p5: `assets/${p.folder}/p5.png`,
                p6: `assets/${p.folder}/p6.png`,
                p7: `assets/${p.folder}/p7.png`
            }
        });
    });

    saveUserPets();
    localStorage.setItem("presetsLoaded", "1");
}

loadDefaultPresets();

// ======================================================
//  ペット管理リスト
// ======================================================
function renderPetList() {
    const list = document.getElementById("petList");
    if (!list) return;
    list.innerHTML = "";

    userPets.forEach((pet, index) => {
        const div = document.createElement("div");
        div.className = "pet-list-item";

        const label = document.createElement("span");
        label.textContent = `${pet.name}（${pet.species}）`;

        const btnBox = document.createElement("div");

        const editBtn = document.createElement("button");
        editBtn.textContent = "編集";
        editBtn.onclick = () => editPet(index);

        const delBtn = document.createElement("button");
        delBtn.textContent = "削除";
        delBtn.classList.add("delete");
        delBtn.onclick = () => {
            if (confirm("このペットを削除しますか？")) {
                userPets.splice(index, 1);
                saveUserPets();
                renderPetList();
                renderPetCards();
            }
        };

        btnBox.appendChild(editBtn);
        btnBox.appendChild(delBtn);

        div.appendChild(label);
        div.appendChild(btnBox);
        list.appendChild(div);
    });
}

// ======================================================
//  ペット追加ボタン
// ======================================================
const addPetBtn = document.getElementById("addPetBtn");
if (addPetBtn) {
    addPetBtn.onclick = () => {
        editingIndex = -1;
        openEditor();
    };
}

// ======================================================
//  ペット編集画面の開閉
// ======================================================
function openEditor(pet = null) {
    document.getElementById("petManager").style.display = "none";
    document.getElementById("petEditor").style.display = "block";

    if (pet) {
        document.getElementById("editName").value = pet.name;
        document.getElementById("editSpecies").value = pet.species;
        document.getElementById("editAlias").value = pet.alias || "";
        document.getElementById("editKeywords").value = (pet.keywords || []).join(", ");
    } else {
        document.getElementById("editName").value = "";
        document.getElementById("editSpecies").value = "rabbit";
        document.getElementById("editAlias").value = "";
        document.getElementById("editKeywords").value = "";
    }

    // ファイル入力は初期化
    [
        "img_n1","img_n2","img_n3","img_p3","img_p4",
        "vid_p1","vid_p2","vid_p5","vid_p6","vid_p7"
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

const cancelEditBtn = document.getElementById("cancelEditBtn");
if (cancelEditBtn) {
    cancelEditBtn.onclick = () => {
        document.getElementById("petEditor").style.display = "none";
        document.getElementById("petManager").style.display = "block";
    };
}

// 編集開始
function editPet(index) {
    editingIndex = index;
    openEditor(userPets[index]);
}

// ======================================================
//  ファイル → blob URL（ユーザー追加用）
// ======================================================
function fileToBlobURL(fileInput) {
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return null;
    return URL.createObjectURL(fileInput.files[0]);
}
// ======================================================
//  サムネイル生成（安定版：動画でもそのまま表示）
// ======================================================
async function generateThumbnail(src) {
    if (!src) {
        return "assets/common/placeholder.png";
    }
    // 動画でも画像でも、そのまま <img> に表示
    return src;
}


// ======================================================
//  ペット選択 UI（カード表示）
// ======================================================
const petCardsContainer = document.getElementById("petCards");
const petDescriptionBox = document.getElementById("petDescription");

async function renderPetCards() {
    if (!petCardsContainer) return;

    petCardsContainer.innerHTML = "";

    for (let index = 0; index < userPets.length; index++) {
        const pet = userPets[index];

        const card = document.createElement("div");
        card.className = "pet-card";
        card.dataset.index = index;

        const thumb = document.createElement("img");
        thumb.className = "pet-card-thumb";

        // n1 が動画でも画像でもOK
        const n1src =
            pet.images?.n1 ||
            pet.videos?.p1 ||
            "assets/common/placeholder.png";

        thumb.src = await generateThumbnail(n1src);

        const nameEl = document.createElement("div");
        nameEl.className = "pet-card-name";
        nameEl.textContent = pet.name;

        const speciesEl = document.createElement("div");
        speciesEl.className = "pet-card-species";
        speciesEl.textContent = pet.species;

        card.appendChild(thumb);
        card.appendChild(nameEl);
        card.appendChild(speciesEl);

        card.onclick = () => {
            selectPetByIndex(index);
        };

        petCardsContainer.appendChild(card);
    }

    // ★ 初期選択（プリセットを選んだ瞬間に動く）
    if (userPets.length > 0) {
        selectPetByIndex(0);
    }
}


// ======================================================
//  ペット選択時の処理（プリセット即動作）
// ======================================================
function selectPetByIndex(index) {
    currentPreset = userPets[index];

    // カードの選択状態更新
    const cards = petCardsContainer.querySelectorAll(".pet-card");
    cards.forEach(card => {
        card.classList.toggle(
            "selected",
            parseInt(card.dataset.index, 10) === index
        );
    });

    // ★ 選んだ瞬間に通常状態を表示
    showStateMedia("n1");

    // 説明文表示
    showPetDescription();

    // ★ 状態遷移を確実に開始
    lastInteractionTime = Date.now();

    // ★ 選んだ瞬間に軽く喜ぶ（自然な反応）
    const now = Date.now() / 1000;
    p2_until = now + 1.5;
}


// ======================================================
//  説明文表示
// ======================================================
function showPetDescription() {
    if (!petDescriptionBox) return;
    if (!currentPreset) {
        petDescriptionBox.textContent = "";
        return;
    }
    petDescriptionBox.textContent = currentPreset.description || "";
}


// ======================================================
//  初期描画
// ======================================================
renderPetList();
renderPetCards();
// ======================================================
//  Whisper（音声認識）用の状態フラグ
// ======================================================
let lastInteractionTime = Date.now();
let p2_until = 0;  // 喜び
let p3_until = 0;  // 伏せ
let p4_until = 0;  // お手
let p5_until = 0;  // 食事
let p6_until = 0;  // 給水
let p7_until = 0;  // トイレ
let n2_until = 0;  // お座り / 待て
let n3_until = 0;  // 睡眠


// ======================================================
//  音声コマンド処理（Whisper）
// ======================================================
function handleVoiceCommand(text) {
    const now = Date.now() / 1000;
    lastInteractionTime = Date.now();

    // 固定キーワード（喜び）
    const fixed = ["かわいい", "可愛い", "よしよし", "おりこう", "いい子"];
    if (fixed.some(w => text.includes(w))) {
        p2_until = now + 3;
        return;
    }

    // ユーザー定義キーワード
    if (currentPreset?.keywords?.some(w => text.includes(w))) {
        p2_until = now + 3;
        return;
    }

    // 呼び名（alias）
    if (currentPreset?.alias && text.includes(currentPreset.alias)) {
        p2_until = now + 2;
        return;
    }

    // コマンド
    if (["ごはん", "ご飯"].some(w => text.includes(w))) { p5_until = now + 5; return; }
    if (["水", "お水"].some(w => text.includes(w))) { p6_until = now + 4; return; }
    if (["トイレ"].some(w => text.includes(w))) { p7_until = now + 4; return; }
    if (["伏せ"].some(w => text.includes(w))) { p3_until = now + 3; return; }
    if (["お手"].some(w => text.includes(w))) { p4_until = now + 3; return; }

    // ★ n2 = お座り / 待て
    if (["お座り", "待て", "ストップ"].some(w => text.includes(w))) {
        n2_until = now + 5;
        return;
    }

    if (["ねんね", "おやすみ"].some(w => text.includes(w))) {
        n3_until = now + 9999;
        return;
    }
}


// ======================================================
//  FaceDetection（距離・手振り）
// ======================================================
let faceDetector;
let detectCamera;
let lastFaceVisible = true;

async function initFaceDetection() {
    faceDetector = new FaceDetection.FaceDetection({
        locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
    });

    faceDetector.setOptions({
        model: "short",
        minDetectionConfidence: 0.6
    });

    faceDetector.onResults(onFaceDetect);

    const video = document.createElement("video");
    video.style.display = "none";
    document.body.appendChild(video);

    detectCamera = new Camera(video, {
        onFrame: async () => {
            await faceDetector.send({ image: video });
        },
        width: 320,
        height: 240
    });

    detectCamera.start();
}

function detectHandWave(results) {
    const faceVisible = results.detections && results.detections.length > 0;

    // 顔が消えた瞬間 → 手を振ったと判定
    if (lastFaceVisible && !faceVisible) {
        const now = Date.now() / 1000;
        p2_until = now + 1.5;
        lastInteractionTime = Date.now();
    }

    lastFaceVisible = faceVisible;
}

function onFaceDetect(results) {
    detectHandWave(results);

    const now = Date.now() / 1000;

    if (!results.detections || results.detections.length === 0) return;

    lastInteractionTime = Date.now();

    const box = results.detections[0].boundingBox;
    const faceSize = box.width * box.height;

    // 顔が近い → 喜び
    if (faceSize > 0.15) {
        p2_until = now + 1.0;
    }
}

initFaceDetection();


// ======================================================
//  FaceMesh（表情・視線）
// ======================================================
let faceMesh = null;
let smileCamera = null;
let meshFrame = 0;

// 笑顔判定
function isSmile(landmarks) {
    const left = landmarks[61];
    const right = landmarks[291];
    const top = landmarks[13];
    const bottom = landmarks[14];

    const width = Math.hypot(right.x - left.x, right.y - left.y);
    const height = Math.hypot(bottom.y - top.y, bottom.x - top.x);

    return width / height > 3.0;
}

// 視線判定（目が合う）
function isEyeContact(landmarks) {
    const leftEye = landmarks[468];
    const rightEye = landmarks[473];
    const eyeCenterX = (leftEye.x + rightEye.x) / 2;

    return (eyeCenterX > 0.40 && eyeCenterX < 0.60);
}

async function initFaceMesh() {
    faceMesh = new FaceMesh({
        locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onSmileResults);

    const video = document.createElement("video");
    video.style.display = "none";
    document.body.appendChild(video);

    smileCamera = new Camera(video, {
        onFrame: async () => {
            await faceMesh.send({ image: video });
        },
        width: 320,
        height: 240
    });

    smileCamera.start();
}

function onSmileResults(results) {
    meshFrame++;
    if (meshFrame % 5 !== 0) return;

    const now = Date.now() / 1000;

    if (!results.multiFaceLandmarks) return;

    const landmarks = results.multiFaceLandmarks[0];

    // 笑顔 → 喜び（p2）
    if (isSmile(landmarks)) {
        p2_until = now + 2.0;
        lastInteractionTime = Date.now();
    }

    // 視線が合う → 喜び（p2）
    if (isEyeContact(landmarks)) {
        p2_until = now + 1.5;
        lastInteractionTime = Date.now();
    }
}

initFaceMesh();
// ======================================================
//  状態遷移ロジック
// ======================================================
function determineState() {
    const now = Date.now() / 1000;

    // 優先度の高い順
    if (now < p5_until) return "p5"; // 食事
    if (now < p6_until) return "p6"; // 給水
    if (now < p7_until) return "p7"; // トイレ
    if (now < p2_until) return "p2"; // 喜び（呼ばれた時の反応）
    if (now < p3_until) return "p3"; // 伏せ
    if (now < p4_until) return "p4"; // お手
    if (now < n2_until) return "n2"; // お座り / 待て
    if (now < n3_until) return "n3"; // 睡眠

    // 長時間無反応 → 睡眠
    if (Date.now() - lastInteractionTime > 30000) return "n3";

    // 通常状態
    return "n1";
}


// ======================================================
//  メディア表示（画像/動画）
// ======================================================
const petImage = document.getElementById("petImage");
const petVideo = document.getElementById("petVideo");

function showStateMedia(state) {
    if (!currentPreset) return;

    const videoSrc = currentPreset.videos?.[state];
    const imageSrc = currentPreset.images?.[state];

    // 動画を一旦停止
    petVideo.pause();
    petVideo.removeAttribute("src");
    petVideo.load();

    // ★ 動画がある場合
    if (videoSrc) {
        petImage.style.display = "none";
        petVideo.style.display = "block";

        petVideo.src = videoSrc;
        petVideo.loop = true;
        petVideo.muted = true;
        petVideo.playsInline = true;

        petVideo.play().catch(err => console.log("動画再生エラー:", err));

    // ★ 画像がある場合
    } else if (imageSrc) {
        petVideo.style.display = "none";
        petImage.style.display = "block";
        petImage.src = imageSrc;

    // ★ どちらも無い場合（代替）
    } else {
        petVideo.style.display = "none";
        petImage.style.display = "block";
        petImage.src = "assets/common/placeholder.png";
    }
}


// ======================================================
//  メインループ
// ======================================================
let lastState = null;

function mainLoop() {
    const state = determineState();

    // 状態が変わったときだけメディア更新
    if (state !== lastState) {
        showStateMedia(state);

        // ★ p2（喜び）のときだけ鳴き声
        if (state === "p2" && currentPreset) {
            const sp = currentPreset.species;
            if (soundMap[sp]) {
                soundMap[sp].currentTime = 0;
                soundMap[sp].play().catch(() => {});
            }
        }

        lastState = state;

        // デバッグログ
        const log = document.getElementById("log");
        if (log) {
            log.textContent = `[${new Date().toLocaleTimeString()}] state = ${state}`;
        }
    }

    requestAnimationFrame(mainLoop);
}

mainLoop();