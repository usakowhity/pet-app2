/* -------------------------------------------------------
   ギャラリー画面：生成済みの画像・動画を一覧表示
------------------------------------------------------- */

const galleryContainer = document.getElementById("galleryContainer");

/* -------------------------------------------------------
   初期処理
------------------------------------------------------- */
window.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    galleryContainer.innerHTML = "<p>ログイン情報がありません。auth.html からログインしてください。</p>";
    return;
  }

  try {
    /* -------------------------------------------------------
       Supabase から userModeAsset を取得
    ------------------------------------------------------- */
    const { data, error } = await supabase
      .from("userModeAsset")
      .select("*")
      .eq("userId", userId);

    if (error) {
      galleryContainer.innerHTML = `<p>データ取得エラー：${error.message}</p>`;
      return;
    }

    if (!data || data.length === 0) {
      galleryContainer.innerHTML = "<p>まだ生成された画像・動画がありません。</p>";
      return;
    }

    /* -------------------------------------------------------
       モード順に並べる（n2 → n3 → … → p9）
    ------------------------------------------------------- */
    const modeOrder = [
      "n2", "n3",
      "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"
    ];

    const sorted = data.sort((a, b) => {
      return modeOrder.indexOf(a.modeId) - modeOrder.indexOf(b.modeId);
    });

    /* -------------------------------------------------------
       ギャラリー UI を生成
    ------------------------------------------------------- */
    galleryContainer.innerHTML = "";

    sorted.forEach((item) => {
      const div = document.createElement("div");
      div.className = "gallery-item";

      const title = document.createElement("h3");
      title.textContent = `モード: ${item.modeId}`;
      div.appendChild(title);

      if (item.modeId === "p2") {
        const img = document.createElement("img");
        img.src = item.thumbnailUrl;
        img.alt = "thumbnail";
        div.appendChild(img);

        const video = document.createElement("video");
        video.src = item.assetUrl;
        video.controls = true;
        div.appendChild(video);

      } else {
        const img = document.createElement("img");
        img.src = item.assetUrl;
        img.alt = item.modeId;
        div.appendChild(img);
      }

      galleryContainer.appendChild(div);
    });

  } catch (err) {
    galleryContainer.innerHTML = `<p>通信エラー：${err.message}</p>`;
  }
});