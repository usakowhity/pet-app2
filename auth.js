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
const loginBtn = document.getElementById("sendLinkBtn");
const authMessage = document.getElementById("authMessage");

/* -------------------------------------------------------
   Railway API によるログイン（Magic Link 送信）
------------------------------------------------------- */
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();

  if (!email) {
    showMessage("メールアドレスを入力してください。");
    return;
  }

  try {
    showMessage("送信中…");

    const res = await fetch(`${API_BASE_URL}/api/auth-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, userId })
    });

    const data = await res.json();

    if (!data.ok) {
      showMessage("ログインに失敗しました：" + data.error);
      return;
    }

    // userId はすでに localStorage にあるので OK
    showMessage("ログインリンクを送信しました！", "success");

    setTimeout(() => {
      window.location.href = "pet-register.html";
    }, 1000);

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