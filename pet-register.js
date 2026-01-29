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
   保存処理（Railway API 版）
------------------------------------------------------- */
saveBtn.addEventListener("click", async () => {
  messageEl.textContent = "";

  const species = speciesEl.value;
  const customName = customNameEl.value.trim();
  const customKeywords = customKeywordsEl.value.trim();
  const file = n1El.files[0];

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
    messageEl.textContent = "保存中…";

    // FormData で送信（画像 + テキスト）
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("species", species);
    formData.append("customName", customName);
    formData.append("customKeywords", customKeywords);
    formData.append("n1", file);

    const res = await fetch(`${API_BASE_URL}/api/save-user-mode-asset`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (!data.ok) {
      throw new Error(data.error || "保存に失敗しました");
    }

    // バックエンドが返す n1Url を保存
    localStorage.setItem("species", species);
    localStorage.setItem("n1Url", data.n1Url);
    localStorage.setItem("customName", customName);
    localStorage.setItem("customKeywords", customKeywords);

    messageEl.textContent = "保存が完了しました！";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);

  } catch (err) {
    console.error(err);
    messageEl.textContent = "保存中にエラーが発生しました。";
  }
});