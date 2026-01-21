/* -------------------------------------------------------
   ペット登録処理（species + n1画像）
------------------------------------------------------- */

const speciesSelect = document.getElementById("species");
const n1FileInput = document.getElementById("n1File");
const registerBtn = document.getElementById("registerBtn");
const registerMessage = document.getElementById("registerMessage");

/* -------------------------------------------------------
   登録ボタン
------------------------------------------------------- */
registerBtn.addEventListener("click", async () => {
  const species = speciesSelect.value;
  const file = n1FileInput.files[0];

  if (!species) {
    showMessage("ペットの種類を選択してください。");
    return;
  }

  if (!file) {
    showMessage("代表画像（n1）をアップロードしてください。");
    return;
  }

  const userId = localStorage.getItem("userId");
  if (!userId) {
    showMessage("ログイン情報がありません。auth.html からログインしてください。");
    return;
  }

  try {
    /* -------------------------------------------------------
       1. n1画像を Supabase Storage にアップロード
    ------------------------------------------------------- */
    const fileExt = file.name.split(".").pop();
    const filePath = `n1/${userId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("pet-images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      showMessage("画像アップロードに失敗しました：" + uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("pet-images")
      .getPublicUrl(filePath);

    const n1Url = publicUrlData.publicUrl;

    /* -------------------------------------------------------
       2. userPet テーブルに保存（1アカウント1匹）
    ------------------------------------------------------- */
    const { error: insertError } = await supabase
      .from("userPet")
      .upsert({
        userId,
        species,
        n1Url,
        createdAt: new Date().toISOString()
      });

    if (insertError) {
      showMessage("データ保存に失敗しました：" + insertError.message);
      return;
    }

    /* -------------------------------------------------------
       3. localStorage に保存
    ------------------------------------------------------- */
    localStorage.setItem("species", species);
    localStorage.setItem("n1Url", n1Url);

    /* -------------------------------------------------------
       4. index.html に遷移
    ------------------------------------------------------- */
    window.location.href = "index.html";

  } catch (err) {
    showMessage("通信エラー：" + err.message);
  }
});


/* -------------------------------------------------------
   メッセージ表示
------------------------------------------------------- */
function showMessage(msg, type = "error") {
  registerMessage.textContent = msg;
  registerMessage.style.color = type === "success" ? "#2a7" : "#d33";
}