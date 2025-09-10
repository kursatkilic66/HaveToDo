  const BASE_URL = "https://havetodoonline-production.up.railway.app";   

  document.getElementById("register-button-id").addEventListener("click", () => {
    fetch("registerForm.html")
    .then((response) => response.text())
    .then((html) => {
      const loginContainer = document.querySelector(".login-container");
      if (loginContainer) loginContainer.remove();

      const container = document.createElement("div");
      container.classList.add("register-container-form");
      container.innerHTML = html;
      document.body.appendChild(container);
    })
    .catch((error) => console.error("Error loading register.html:", error));
});
  document.getElementById("login-button-id").addEventListener("click", () => {
    fetch("loginForm.html")
    .then((response) => response.text())
    .then((html) => {
      const loginContainer = document.querySelector(".login-container");
      if (loginContainer) loginContainer.remove();

      const container = document.createElement("div");
      container.classList.add("login-container-form");
      container.innerHTML = html;
      document.body.appendChild(container);
    })
    .catch((error) => console.error("Error loading login.html:", error));
  });

const registerUser = async () => {
  const user = {
    name: document.getElementById("name").value,
    surname: document.getElementById("surname").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };
  console.log("User objesi:", user);

  try {
    // Kullanıcı kaydı
    const res = await fetch(`${BASE_URL}/rest/api/user/saveUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json"
       },
      body: JSON.stringify(user),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Kayıt hatası:", errText);
      alert("User registration failed!");
      return;
    }

    const savedUser = await res.json();
    console.log("Backend response:", savedUser);
    sessionStorage.setItem("email", user.email);
    sessionStorage.setItem("password", user.password);
    //goHome();
    window.location.href = "welcome.html";
  } catch (err) {
    console.error("Fetch hatası:", err);
    alert("Registration error!");
  }
};

const loginUser = async (event) => {
  

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  sessionStorage.setItem("email", email);
  sessionStorage.setItem("password", password);
  console.log("Login bilgileri:", { email, password });
  

  try {
    const response = await fetch(`${BASE_URL}/rest/api/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
    console.log("Login response status:", response.status);

    if (response.ok) {
      window.location.href = "welcome.html";
    } else {
      const errText = await response.text();
      console.error("Login failed:", errText);
      alert("Login failed!");
    }
  } catch (error) {
    console.error("Error during login:", error);
    alert("Login error!");
  }
};

const goHome = () => {
  const loginContainer = document.querySelector(".login-container");
  const registerContainer = document.querySelector(".register-container-form");
  if (registerContainer) registerContainer.remove();
  document.body.appendChild(loginContainer);
}


