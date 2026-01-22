/* -------------------------------------------------------
   ★ 最重要：ログイン前でも userId を生成して保持する
------------------------------------------------------- */

let userId = localStorage.getItem("userId");

if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem("userId", userId);
}

/* -------------------------------------------------------
   Supabase Auth ログイン / 新規登録
------------------------------------------------------- */

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const authMessage = document.getElementById("authMessage");

/* -------------------------------------------------------
   ログイン処理
------------------------------------------------------- */
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    showMessage("メールアドレスとパスワードを入力してください。");
    return;
  }

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      showMessage("ログインに失敗しました：" + error.message);
      return;
    }

    // Supabase の userId を保存（上書きOK）
    const userId = data.user.id;
    localStorage.setItem("userId", userId);

    // ペット登録が済んでいるか確認
    const { data: petData } = await supabaseClient
      .from("userPet")
      .select("*")
      .eq("userId", userId)
      .single();

    if (!petData) {
      window.location.href = "pet-register.html";
      return;
    }

    // ペット登録済み → index.html へ
    localStorage.setItem("species", petData.species);
    localStorage.setItem("n1Url", petData.n1Url);

    window.location.href = "index.html";

  } catch (err) {
    showMessage("通信エラー：" + err.message);
  }
});

/* -------------------------------------------------------
   新規登録処理
------------------------------------------------------- */
signupBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    showMessage("メールアドレスとパスワードを入力してください。");
    return;
  }

  try {
    const { error } = await supabaseClient.auth.signUp({
      email,
      password
    });

    if (error) {
      showMessage("新規登録に失敗しました：" + error.message);
      return;
    }

    showMessage("登録成功！ログインしてください。", "success");

  } catch (err) {
    showMessage("通信エラー：" + err.message);
  }
});

/* -------------------------------------------------------
   メッセージ表示
------------------------------------------------------- */
function showMessage(msg, type = "error") {
  authMessage.textContent = msg;
  authMessage.style.color = type === "success" ? "#2a7" : "#d33";
}