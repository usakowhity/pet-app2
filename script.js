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
//  初回起動時：プリセットを自動登録
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
//  ペット一覧の描画
// ======================================================
function renderPetList() {
    const list = document.getElementById("petList");
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
        delBtn.style.background = "#ffd5d5";
        delBtn.onclick = () => {
            if (confirm("このペットを削除しますか？")) {
                userPets.splice(index, 1);
                saveUserPets();
                renderPetList();
                updatePetSelector();
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
document.getElementById("addPetBtn").onclick = () => {
    editingIndex = -1;
    openEditor();
};

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
}

document.getElementById("cancelEditBtn").onclick = () => {
    document.getElementById("petEditor").style.display = "none";
    document.getElementById("petManager").style.display = "block";
};

// ======================================================
//  ファイル → blob URL
// ======================================================
function fileToBlobURL(fileInput) {
    if (!fileInput.files || fileInput.files.length === 0) return null;
    return URL.createObjectURL(fileInput.files[0]);
}

// ======================================================
//  ペット保存処理
// ======================================================
document.getElementById("savePetBtn").onclick = () => {
    const pet = {
        name: document.getElementById("editName").value,
        species: document.getElementById("editSpecies").value,
        alias: document.getElementById("editAlias").value.trim(),
        keywords: document.getElementById("editKeywords").value
            .split(",")
            .map(k => k.trim())
            .filter(k => k.length > 0),

        images: {
            n1: fileToBlobURL(img_n1),
            n2: fileToBlobURL(img_n2),
            n3: fileToBlobURL(img_n3),
            p3: fileToBlobURL(img_p3),
            p4: fileToBlobURL(img_p4)
        },
        videos: {
            p1: fileToBlobURL(vid_p1),
            p2: fileToBlobURL(vid_p2),
            p5: fileToBlobURL(vid_p5),
            p6: fileToBlobURL(vid_p6),
            p7: fileToBlobURL(vid_p7)
        }
    };

    if (editingIndex >= 0) {
        userPets[editingIndex] = pet;
    } else {
        userPets.push(pet);
    }

    saveUserPets();
    renderPetList();

    document.getElementById("petEditor").style.display = "none";
    document.getElementById("petManager").style.display = "block";

    updatePetSelector();
};
// ======================================================
//  ペット選択 UI（アイコン＋説明文）
// ======================================================
function updatePetSelector() {
    const select = document.getElementById("petSelect");
    select.innerHTML = "";

    userPets.forEach((pet, index) => {
        const opt = document.createElement("option");
        opt.value = index;
        opt.textContent = pet.name;

        // アイコン（n1.png）を option に付与
        opt.dataset.icon = pet.images?.n1 || "assets/common/placeholder.png";

        select.appendChild(opt);
    });

    select.onchange = () => {
        currentPreset = userPets[select.value];
        showStateMedia("n1");
        showPetDescription();
    };

    if (userPets.length > 0) {
        currentPreset = userPets[0];
        showStateMedia("n1");
        showPetDescription();
    }
}

// 説明文表示
function showPetDescription() {
    const box = document.getElementById("petDescription");
    if (!currentPreset) {
        box.textContent = "";
        return;
    }
    box.textContent = currentPreset.description || "";
}

renderPetList();
updatePetSelector();


// ======================================================
//  Whisper（音声認識）
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

function handleVoiceCommand(text) {
    const now = Date.now() / 1000;
    lastInteractionTime = Date.now();

    // 固定キーワード
    const fixed = ["かわいい", "可愛い", "よしよし", "おりこう"];
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

    // その他のコマンド
    if (["ごはん", "ご飯"].some(w => text.includes(w))) { p5_until = now + 5; return; }
    if (["水", "お水"].some(w => text.includes(w))) { p6_until = now + 4; return; }
    if (["トイレ"].some(w => text.includes(w))) { p7_until = now + 4; return; }
    if (["伏せ"].some(w => text.includes(w))) { p3_until = now + 3; return; }
    if (["お手"].some(w => text.includes(w))) { p4_until = now + 3; return; }
    if (["待て"].some(w => text.includes(w))) { n2_until = now + 5; return; }
    if (["ねんね", "おやすみ"].some(w => text.includes(w))) { n3_until = now + 9999; return; }
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

// 手振り判定（顔が消えた瞬間）
function detectHandWave(results) {
    const faceVisible = results.detections && results.detections.length > 0;

    if (lastFaceVisible && !faceVisible) {
        const now = Date.now() / 1000;
        p2_until = now + 1.5;
        lastInteractionTime = Date.now();
    }

    lastFaceVisible = faceVisible;
}

// 顔の距離判定（近づいたら p2）
function onFaceDetect(results) {
    detectHandWave(results);

    const now = Date.now() / 1000;

    if (!results.detections || results.detections.length === 0) return;

    lastInteractionTime = Date.now();

    const box = results.detections[0].boundingBox;
    const faceSize = box.width * box.height;

    // 顔が大きく映ったら（近い）
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

// 視線判定（目がこちらを向いている）
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

    // 笑顔 → p2
    if (isSmile(landmarks)) {
        p2_until = now + 2.0;
        lastInteractionTime = Date.now();
    }

    // 視線（目が合う）→ p2
    if (isEyeContact(landmarks)) {
        p2_until = now + 1.5;
        lastInteractionTime = Date.now();
    }
}

initFaceMesh();


// ======================================================
//  撫でる（タッチ操作）
// ======================================================

let touchStartX = 0;
let touchStartY = 0;

const petContainer = document.getElementById("pet-container");

petContainer.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
});

petContainer.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    const dx = Math.abs(t.clientX - touchStartX);
    const dy = Math.abs(t.clientY - touchStartY);

    // 指が動いたら「撫でた」と判定
    if (dx + dy > 20) {
        const now = Date.now() / 1000;
        p2_until = now + 2.0;
        lastInteractionTime = Date.now();
    }
});


// ======================================================
//  鳴き声（species に応じて）
// ======================================================

const soundMap = {
    dog: new Audio("assets/sounds/bark_dog.mp3"),
    cat: new Audio("assets/sounds/bark_cat.mp3"),
    rabbit: new Audio("assets/sounds/bark_rabbit.mp3")
};
// ======================================================
//  状態遷移ロジック
// ======================================================
function determineState() {
    const now = Date.now() / 1000;

    // 優先度の高い順に判定
    if (now < p5_until) return "p5"; // 食事
    if (now < p6_until) return "p6"; // 給水
    if (now < p7_until) return "p7"; // トイレ
    if (now < p2_until) return "p2"; // 喜び・甘え
    if (now < p3_until) return "p3"; // 伏せ
    if (now < p4_until) return "p4"; // お手
    if (now < n2_until) return "n2"; // 待て
    if (now < n3_until) return "n3"; // 睡眠

    // 30秒以上ユーザーが離れたら睡眠
    if (Date.now() - lastInteractionTime > 30000) return "n3";

    return "n1"; // 通常
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

    // 動画がある場合
    if (videoSrc) {
        petImage.style.display = "none";
        petVideo.style.display = "block";

        petVideo.src = videoSrc;
        petVideo.loop = true;
        petVideo.muted = true;
        petVideo.playsInline = true;

        petVideo.play().catch(err => console.log("動画再生エラー:", err));

    // 画像がある場合
    } else if (imageSrc) {
        petVideo.style.display = "none";
        petImage.style.display = "block";
        petImage.src = imageSrc;

    // どちらもない場合（プレースホルダー）
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

        // p2 のときだけ鳴き声を再生
        if (state === "p2" && currentPreset) {
            const sp = currentPreset.species;
            if (soundMap[sp]) {
                soundMap[sp].currentTime = 0;
                soundMap[sp].play();
            }
        }

        lastState = state;

        // ログ表示（デバッグ用）
        const log = document.getElementById("log");
        if (log) {
            log.textContent = `[${new Date().toLocaleTimeString()}] state = ${state}`;
        }
    }

    requestAnimationFrame(mainLoop);
}

mainLoop();