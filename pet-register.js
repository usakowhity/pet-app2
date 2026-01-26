/* -------------------------------------------------------
   DOM 取得
------------------------------------------------------- */
const speciesEl = document.getElementById("species");
const n1El = document.getElementById("n1");
const previewEl = document.getElementById("preview");
const customNameEl = document.getElementById("customName");
const customKeywordsEl = document.getElementById("customKeywords");
const saveBtn = document.getElementById("saveBtn");
const messageEl = document.getElementById("message");


/* -------------------------------------------------------
   n1 プレビュー表示
------------------------------------------------------- */
n1El.addEventListener("change", () => {
  const file = n1El.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    previewEl.src = e.target.result;
    previewEl.style.display = "block";
  };
  reader.readAsDataURL(file);
});


/* -------------------------------------------------------
   Supabase Storage に n1 をアップロード
------------------------------------------------------- */
async function uploadN1ToSupabase(file, userId) {
  const fileExt = file.name.split(".").pop();
  const fileName = `n1_${userId}.${fileExt}`;
  const filePath = `n1/${fileName}`;

  const { data, error } = await window.supabase.storage
    .from("pet-images")
    .upload(filePath, file, { upsert: true });

  if (error) {
    console.error("Upload error:", error);
    throw new Error("画像アップロードに失敗しました");
  }

  // 公開URLを取得
  const { data: urlData } = window.supabase.storage
    .from("pet-images")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}


/* -------------------------------------------------------
   保存処理
------------------------------------------------------- */
saveBtn.addEventListener("click", async () => {
  messageEl.textContent = "";

  const species = speciesEl.value;
  const customName = customNameEl.value.trim();
  const customKeywords = customKeywordsEl.value.trim();
  const file = n1El.files[0];

  // userId はログイン時に保存済み
  const userId = localStorage.getItem("userId");

  if (!userId) {
    messageEl.textContent = "ログイン情報がありません。auth.html からログインしてください。";
    return;
  }

  if (!species) {
    messageEl.textContent = "ペットの種類を選択してください。";
    return;
  }

  if (!file) {
    messageEl.textContent = "代表写真（n1）を選択してください。";
    return;
  }

  try {
    messageEl.textContent = "画像をアップロード中…";

    // n1 を Supabase にアップロード
    const n1Url = await uploadN1ToSupabase(file, userId);

    // localStorage に保存
    localStorage.setItem("species", species);
    localStorage.setItem("n1Url", n1Url);
    localStorage.setItem("customName", customName);
    localStorage.setItem("customKeywords", customKeywords);

    messageEl.textContent = "保存が完了しました！";

    // 1秒後にメイン画面へ
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);

  } catch (err) {
    console.error(err);
    messageEl.textContent = "保存中にエラーが発生しました。";
  }
});