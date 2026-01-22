/* -------------------------------------------------------
   ★ userId を事前生成（ログイン前でも一意に持つ）
------------------------------------------------------- */
let userId = localStorage.getItem("userId");

if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem("userId", userId);
}

/* -------------------------------------------------------
   DOM 要素
------------------------------------------------------- */
const emailInput = document.getElementById("email");
const loginBtn = document.getElementById("loginBtn");
const authMessage = document.getElementById("authMessage");

/* -------------------------------------------------------
   Magic Link ログイン
------------------------------------------------------- */
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();

  if (!email) {
    showMessage("メールアドレスを入力してください。");
    return;
  }

  try {
    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "https://usakowhity.github.io/pet-app2/pet-register.html"
      }
    });

    if (error) {
      showMessage("Magic Link の送信に失敗しました：" + error.message);
      return;
    }

    showMessage("ログイン用リンクをメールに送信しました！", "success");

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