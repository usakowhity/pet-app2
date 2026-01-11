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
//  鳴き声マップ（プリセット用）
// ======================================================
const soundMap = {
    rabbit: new Audio("assets/sounds/bark_rabbit.mp3"),
    dog: new Audio("assets/sounds/bark_dog.mp3"),
    cat: new Audio("assets/sounds/bark_cat.mp3")
};

// ======================================================
//  Whisper / 状態遷移フラグ
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
//  初回起動時：プリセット登録
// ======================================================
function loadDefaultPresets() {
    if (localStorage.getItem("presetsLoaded")) return;

    const presets = [
        { name: "Usako", species: "rabbit", folder: "usako", desc: "白ネザーランドドワーフ" },
        { name: "Kuro",  species: "rabbit", folder: "kuro",  desc: "黒ネザーランドドワーフ" },
        { name: "Taro",  species: "dog",    folder: "taro",  desc: "白パピヨン子犬" },
        { name: "Marple",species: "dog",    folder: "marple",desc: "白トイプードル" },
        { name: "Pochi", species: "dog",    folder: "pochi", desc: "柴犬子犬" },
        { name: "Tama",  species: "cat",    folder: "tama",  desc: "薄茶白胸猫" }
    ];

    presets.forEach(p => {
        let images = {};
        let videos = {};

        if (["taro","marple","pochi","tama"].includes(p.folder)) {
            images = {
                n1:`assets/${p.folder}/n1.png`,
                n2:`assets/${p.folder}/n2.png`,
                n3:`assets/${p.folder}/n3.png`,
                p1:`assets/${p.folder}/p1.png`,
                p2:`assets/${p.folder}/p2.png`,
                p3:`assets/${p.folder}/p3.png`,
                p4:`assets/${p.folder}/p4.png`,
                p5:`assets/${p.folder}/p5.png`,
                p6:`assets/${p.folder}/p6.png`,
                p7:`assets/${p.folder}/p7.png`
            };
        }

        if (p.folder === "usako") {
            images = {
                n1:`assets/usako/n1.png`,
                n2:`assets/usako/n2.png`,
                p3:`assets/usako/p3.png`,
                p4:`assets/usako/p4.png`,
                p6:`assets/usako/p6.png`,
                p7:`assets/usako/p7.png`
            };
            videos = {
                n3:`assets/usako/n3.mp4`,
                p1:`assets/usako/p1.mp4`,
                p2:`assets/usako/p2.mp4`,
                p5:`assets/usako/p5.mp4`
            };
        }

        if (p.folder === "kuro") {
            images = {
                p3:`assets/kuro/p3.png`,
                p4:`assets/kuro/p4.png`,
                p6:`assets/kuro/p6.png`,
                p7:`assets/kuro/p7.png`
            };
            videos = {
                n1:`assets/kuro/n1.mp4`,
                n2:`assets/kuro/n2.mp4`,
                n3:`assets/kuro/n3.mp4`,
                p1:`assets/kuro/p1.mp4`,
                p2:`assets/kuro/p2.mp4`,
                p5:`assets/kuro/p5.mp4`
            };
        }

        userPets.push({
            name: p.name,
            species: p.species,
            alias: "",
            keywords: [],
            description: p.desc,
            isPreset: true,
            images,
            videos
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

        if (!pet.isPreset) {
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
        }

        div.appendChild(label);
        div.appendChild(btnBox);
        list.appendChild(div);
    });
}

// ======================================================
//  ペット追加
// ======================================================
const addPetBtn = document.getElementById("addPetBtn");
if (addPetBtn) {
    addPetBtn.onclick = () => {
        editingIndex = -1;
        openEditor();
    };
}

// ======================================================
//  ペット編集画面
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

    const isPreset = pet?.isPreset;
    const fileInputs = [
        "img_n1","img_n2","img_n3","img_p3","img_p4",
        "vid_p1","vid_p2","vid_p5","vid_p6","vid_p7"
    ];

    fileInputs.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = "";
        el.style.display = isPreset ? "none" : "block";
    });
}

const cancelEditBtn = document.getElementById("cancelEditBtn");
if (cancelEditBtn) {
    cancelEditBtn.onclick = () => {
        document.getElementById("petEditor").style.display = "none";
        document.getElementById("petManager").style.display = "block";
    };
}

function editPet(index) {
    editingIndex = index;
    openEditor(userPets[index]);
}

// ======================================================
//  サムネイル生成
// ======================================================
async function generateThumbnail(src) {
    if (!src) return "assets/usako/n1.png";
    return src;
}

// ======================================================
//  ペットカード UI
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

        const n1src =
            pet.images?.n1 ||
            pet.videos?.n1 ||
            pet.videos?.p1 ||
            pet.images?.p1 ||
            "assets/usako/n1.png";

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

        card.onclick = () => selectPetByIndex(index);

        petCardsContainer.appendChild(card);
    }

    if (userPets.length > 0) selectPetByIndex(0);
}

// ======================================================
//  ペット選択
// ======================================================
function selectPetByIndex(index) {
    currentPreset = userPets[index];

    const cards = petCardsContainer.querySelectorAll(".pet-card");
    cards.forEach(card => {
        card.classList.toggle(
            "selected",
            parseInt(card.dataset.index, 10) === index
        );
    });

    showStateMedia("n1");
    showPetDescription();

    lastInteractionTime = Date.now();

    const now = Date.now() / 1000;
    p2_until = now + 1.5;
}

// ======================================================
//  説明文
// ======================================================
function showPetDescription() {
    if (!petDescriptionBox) return;
    petDescriptionBox.textContent = currentPreset?.description || "";
}

// ======================================================
//  初期描画
// ======================================================
renderPetList();
renderPetCards();

// ======================================================
//  Whisper（音声コマンド）
// ======================================================
function handleVoiceCommand(text) {
    const now = Date.now() / 1000;
    lastInteractionTime = Date.now();

    const fixed = ["かわいい", "可愛い", "よしよし", "おりこう", "いい子"];
    if (fixed.some(w => text.includes(w))) { p2_until = now + 3; return; }

    if (currentPreset?.keywords?.some(w => text.includes(w))) {
        p2_until = now + 3; return;
    }

    if (currentPreset?.alias && text.includes(currentPreset.alias)) {
        p2_until = now + 2; return;
    }

    if (["ごはん", "ご飯"].some(w => text.includes(w))) { p5_until = now + 5; return; }
    if (["水", "お水"].some(w => text.includes(w))) { p6_until = now + 4; return; }
    if (["トイレ"].some(w => text.includes(w))) { p7_until = now + 4; return; }
    if (["伏せ"].some(w => text.includes(w))) { p3_until = now + 3; return; }
    if (["お手"].some(w => text.includes(w))) { p4_until = now + 3; return; }

    if (["お座り", "待て", "ストップ"].some(w => text.includes(w))) {
        n2_until = now + 5; return;
    }

    if (["ねんね", "おやすみ"].some(w => text.includes(w))) {
        n3_until = now + 9999; return;
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
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4.1646424915/${file}`
    });

    faceDetector.setOptions({
        model: "short",
        minDetectionConfidence: 0.6
    });

    faceDetector.onResults(onFaceDetect);

    const video = document.createElement("video");
    video.style.display = "none";
    document.body.appendChild(video);

    detectCamera = new CameraUtils.Camera(video, {
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

function isSmile(landmarks) {
    const left = landmarks[61];
    const right = landmarks[291];
    const top = landmarks[13];
    const bottom = landmarks[14];

    const width = Math.hypot(right.x - left.x, right.y - left.y);
    const height = Math.hypot(bottom.y - top.y, bottom.x - top.x);

    return width / height > 3.0;
}

function isEyeContact(landmarks) {
    const leftEye = landmarks[468];
    const rightEye = landmarks[473];
    const eyeCenterX = (leftEye.x + rightEye.x) / 2;

    return (eyeCenterX > 0.40 && eyeCenterX < 0.60);
}

async function initFaceMesh() {

    faceMesh = new FaceMesh.FaceMesh({
        locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`
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

    smileCamera = new CameraUtils.Camera(video, {
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

    if (isSmile(landmarks)) {
        p2_until = now + 2.0;
        lastInteractionTime = Date.now();
    }

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

    if (now < p5_until) return "p5";
    if (now < p6_until) return "p6";
    if (now < p7_until) return "p7";
    if (now < p2_until) return "p2";
    if (now < p3_until) return "p3";
    if (now < p4_until) return "p4";
    if (now < n2_until) return "n2";
    if (now < n3_until) return "n3";

    if (Date.now() - lastInteractionTime > 30000) return "n3";

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

    petVideo.pause();
    petVideo.removeAttribute("src");
    petVideo.load();

    if (videoSrc) {
        petImage.style.display = "none";
        petVideo.style.display = "block";

        petVideo.src = videoSrc;
        petVideo.loop = true;
        petVideo.muted = true;
        petVideo.playsInline = true;

        petVideo.play().catch(err => console.log("動画再生エラー:", err));

    } else if (imageSrc) {
        petVideo.style.display = "none";
        petImage.style.display = "block";
        petImage.src = imageSrc;

    } else {
        petVideo.style.display = "none";
        petImage.style.display = "block";
        petImage.src = "assets/usako/n1.png";
    }
}

//