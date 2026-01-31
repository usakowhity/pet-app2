document.addEventListener("DOMContentLoaded", () => {
  const timer = setInterval(() => {
    if (window.apiClient) {
      clearInterval(timer);
      initApp();
    }
  }, 50);
});

function initApp() {
  console.log("initApp started");

  const imageSelect = document.getElementById("imageModeSelect");
  const modeButton = document.getElementById("modeButton");
  const mediaElement = document.getElementById("mediaElement");
  const p2Video = document.getElementById("p2Video");

  const micBtn = document.getElementById("mic-btn");
  const cameraBtn = document.getElementById("camera-btn");
  const inputVideo = document.getElementById("input-video");
  const petSound = document.getElementById("pet-sound");

  let selectedMode = "";
  let isGenerating = false;

  /* -------------------------------------------------------
     種別ごとの喜び音声を返す関数
  ------------------------------------------------------- */
  function getHappySound(species) {
    if (species === "dog") return "assets/sounds/dog-happy.mp3";
    if (species === "cat") return "assets/sounds/cat-happy.mp3";
    if (species === "rabbit") return "assets/sounds/rabbit-happy.mp3";
    return "";
  }

  /* -------------------------------------------------------
     モード選択
  ------------------------------------------------------- */
  imageSelect.addEventListener("change", () => {
    selectedMode = imageSelect.value;

    if (!selectedMode) {
      modeButton.style.display = "none";
      return;
    }

    modeButton.textContent =
      selectedMode === "p2" ? "喜び動画を生成する" : "画像を生成する";

    modeButton.style.display = "inline-block";
  });

  /* -------------------------------------------------------
     生成ボタン
  ------------------------------------------------------- */
  modeButton.addEventListener("click", async () => {
    if (!selectedMode || isGenerating) return;

    isGenerating = true;
    modeButton.textContent = "生成中…";

    const userId = localStorage.getItem("userId");
    const species = localStorage.getItem("species");
    const n1Url = localStorage.getItem("n1Url");

    if (!userId || !species || !n1Url) {
      alert("ペット情報が不足しています。pet-register.html で登録してください。");
      isGenerating = false;
      return;
    }

    try {
      if (selectedMode === "p2") {
        const res = await apiClient.apiGenerateVideo({
          userId,
          species,
          n1Url
        });

        if (!res.ok) throw new Error(res.error);

        p2Video.src = res.videoUrl;
        p2Video.style.display = "block";
        p2Video.play();

      } else {
        const res = await apiClient.apiGenerateImage({
          userId,
          modeId: selectedMode,
          species,
          n1Url
        });

        if (!res.ok) throw new Error(res.error);

        mediaElement.src = res.assetUrl;
        p2Video.style.display = "none";
      }

    } catch (err) {
      console.error(err);
      alert("生成中にエラーが発生しました");
    }

    isGenerating = false;
    modeButton.textContent =
      selectedMode === "p2" ? "喜び動画を生成する" : "画像を生成する";
  });

  /* -------------------------------------------------------
     撫でる（クリック）
  ------------------------------------------------------- */
  mediaElement.addEventListener("click", () => {
    petSound.src = "assets/sounds/pet.mp3";
    petSound.play();
  });

  /* -------------------------------------------------------
     声で反応（音声認識）
  ------------------------------------------------------- */
  micBtn.addEventListener("click", () => {
    const keywords = (localStorage.getItem("customKeywords") || "")
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k);

    const species = localStorage.getItem("species");
    const happySound = getHappySound(species);

    if (!("webkitSpeechRecognition" in window)) {
      alert("音声認識がサポートされていません");
      return;
    }

    const recog = new webkitSpeechRecognition();
    recog.lang = "ja-JP";
    recog.start();

    recog.onresult = (e) => {
      const text = e.results[0][0].transcript;
      console.log("認識:", text);

      if (keywords.some((k) => text.includes(k))) {
        petSound.src = happySound;
        petSound.play();
      }
    };
  });

  /* -------------------------------------------------------
     笑顔で反応（MediaPipe）
  ------------------------------------------------------- */
  cameraBtn.addEventListener("click", async () => {
    inputVideo.style.display = "block";

    const species = localStorage.getItem("species");
    const happySound = getHappySound(species);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true
    });
    inputVideo.srcObject = stream;
    inputVideo.play();

    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      if (!results.multiFaceLandmarks[0]) return;

      const lm = results.multiFaceLandmarks[0];

      const left = lm[61];
      const right = lm[291];
      const top = lm[13];
      const bottom = lm[14];

      const mouthWidth = Math.hypot(right.x - left.x, right.y - left.y);
      const mouthHeight = Math.hypot(bottom.x - top.x, bottom.y - top.y);

      if (mouthHeight / mouthWidth > 0.35) {
        petSound.src = happySound;
        petSound.play();
      }
    });

    const camera = new Camera(inputVideo, {
      onFrame: async () => {
        await faceMesh.send({ image: inputVideo });
      },
      width: 300,
      height: 300,
    });

    camera.start();
  });
}