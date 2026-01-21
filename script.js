/* -------------------------------------------------------
   初期設定
------------------------------------------------------- */

// API の URL（あなたのデプロイ先）
const API_BASE = "https://pet-app2-api.vercel.app";


/* -------------------------------------------------------
   DOM 要素
------------------------------------------------------- */
const modeList = document.getElementById("mode-list");
const resultArea = document.getElementById("result-area");
const mediaElement = document.getElementById("mediaElement"); // 初期画像


/* -------------------------------------------------------
   モード選択処理
------------------------------------------------------- */
modeList.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const mode = btn.dataset.mode;

  // active クラス切り替え
  document.querySelectorAll("#mode-list button").forEach((b) => {
    b.classList.toggle("active", b.dataset.mode === mode);
  });

  // 生成開始
  await generateAsset(mode);
});


/* -------------------------------------------------------
   生成 API 呼び出し
------------------------------------------------------- */
async function generateAsset(mode) {
  resultArea.innerHTML = `<p class="loading-text">生成中です… 少し待ってね。</p>`;

  // ローカルストレージからユーザー情報取得
  const userId = localStorage.getItem("userId");
  const species = localStorage.getItem("species");
  const n1Url = localStorage.getItem("n1Url");

  // デバッグログ（必要に応じて確認）
  console.log("userId:", userId);
  console.log("species:", species);
  console.log("n1Url:", n1Url);

  // 不足チェック
  if (!userId || !species || !n1Url) {
    resultArea.innerHTML = `
      <p>ユーザー情報が不足しています。</p>
      <p>userId: ${userId}</p>
      <p>species: ${species}</p>
      <p>n1Url: ${n1Url}</p>
    `;
    return;
  }

  try {
    let response;

    /* ------------------------------
       p2（動画生成）
    ------------------------------ */
    if (mode === "p2") {
      response = await fetch(`${API_BASE}/generate-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, species, n1Url })
      });

      const data = await response.json();
      if (!data.ok) {
        resultArea.innerHTML = `<p>エラー: ${data.error}</p>`;
        return;
      }

      // 結果表示
      resultArea.innerHTML = `
        <p>生成完了！</p>
        <img src="${data.imageUrl}" alt="thumbnail" />
        <video src="${data.videoUrl}" controls></video>
      `;

      // ★ species に応じた音声を再生
      playSpeciesSound();

      return;
    }

    /* ------------------------------
       n2〜n9 / p1 / p3〜p9（静止画）
    ------------------------------ */
    response = await fetch(`${API_BASE}/generate-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, modeId: mode, species, n1Url })
    });

    const data = await response.json();

    if (!data.ok) {
      resultArea.innerHTML = `<p>エラー: ${data.error}</p>`;
      return;
    }

    // 結果表示
    resultArea.innerHTML = `
      <p>生成完了！</p>
      <img src="${data.assetUrl}" alt="generated image" />
    `;

  } catch (err) {
    resultArea.innerHTML = `<p>通信エラー: ${err.message}</p>`;
  }
}


/* -------------------------------------------------------
   音声再生機能（species に応じて切り替え）
------------------------------------------------------- */
function playSpeciesSound() {
  const species = localStorage.getItem("species");
  if (!species) return;

  let soundPath = "";

  switch (species) {
    case "dog":
      soundPath = "assets/sounds/dog-happy.mp3";
      break;
    case "cat":
      soundPath = "assets/sounds/cat-happy.mp3";
      break;
    case "rabbit":
      soundPath = "assets/sounds/rabbit-happy.mp3";
      break;
    default:
      return;
  }

  const audio = new Audio(soundPath);
  audio.volume = 0.8;

  audio.play().catch(() => {
    console.log("音声の自動再生がブロックされました。ユーザー操作後に再生されます。");
  });
}