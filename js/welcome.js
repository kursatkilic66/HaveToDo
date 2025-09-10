const BASE_URL = "https://havetodoonline-production.up.railway.app";

const handleAdd = () => {
  // Eğer form zaten varsa yeni form açma
  if (document.getElementById("taskFormOverlay")) return;

  const taskForm = document.createElement("div");
  taskForm.id = "taskFormOverlay";
  taskForm.style = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
  `;

  taskForm.innerHTML = `
    <form id="taskForm" style="
      display: flex;
      flex-direction: column;
      border: burlywood solid 2px;
      border-radius: 10px;
      padding: 20px;
      width: 90%;
      max-width: 400px;
      background-color: rgb(242, 214, 168);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 1rem;
      box-sizing: border-box;
    ">
      <label for="taskName" style="padding: 10px 0;">Task Name:</label>
      <input type="text" id="taskName" name="title" required maxlength="30"
             style="height:40px; border-radius: 4px; padding:5px; width: 90%; max-width: 300px; display: block; margin: 0 auto;">

      <label for="dueDate" style="padding: 10px 0;">Due Date:</label>
      <input type="date" id="dueDate" name="due_date" required
             style="height: 40px; border-radius: 4px; text-align: center; width: 90%; max-width: 300px; display: block; margin: 0 auto;">

      <label for="description" style="padding: 10px 0;">Description:</label>
      <textarea id="description" name="description" rows="4" required maxlength="250"
                style="border: solid 2px; border-radius: 4px; width: 90%; max-width: 300px; padding:5px; display: block; margin: 0 auto;"></textarea>

      <button type="submit" id="addTaskButton" style="margin-top:15px; height: 40px; cursor: pointer; width: 50%; max-width: 150px; margin-left:auto; margin-right:auto;">
        Add Task
      </button>
      <button type="button" id="closeFormBtn" style="margin-top:10px; height: 40px; width: 50%; max-width: 150px; margin-left:auto; margin-right:auto;">
        Close
      </button>
    </form>
  `;

  document.body.appendChild(taskForm);

  // Min tarihi ayarla
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;
  document.getElementById("dueDate").setAttribute("min", todayStr);

  // Form kapatma butonu
  document.getElementById("closeFormBtn").addEventListener("click", () => {
    taskForm.remove();
  });

  // Submit eventini bağla
  document.getElementById("taskForm").addEventListener("submit", handleSubmit);
};

const handleSubmit = async (event) => {
  event.preventDefault(); // Formun varsayılan submit davranışını engelle
  const taskForm = document.getElementById("taskForm");
  const formData = new FormData(taskForm);
  const data = Object.fromEntries(formData.entries());
  console.log("Gönderilen Data:", data);

  try {
    const response = await fetch(`${BASE_URL}/rest/api/task/saveTask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          btoa(
            `${sessionStorage.getItem("email")}:${sessionStorage.getItem(
              "password"
            )}`
          ),
      },
      body: JSON.stringify(data),
    });
    console.log("Save task response status:", response.status);

    if (response.ok) {
      alert("Task added successfully!");
      document.getElementById("taskFormOverlay")?.remove();
      loadData(); // Yeni eklenen görevi listeye ekle
    } else {
      const errText = await response.text();
      console.error("Save task failed:", errText);
      alert("Failed to add task: " + errText);
    }
  } catch (error) {
    console.error("Error during saveTask fetch:", error);
    alert("Error adding task. See console for details.");
  }
};
const loadData = async () => {
  const taskContainer = document.getElementById("welcome_task_container");

  // Task container stilini JS ile
  Object.assign(taskContainer.style, {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    justifyContent: "flex-start",
    overflowY: "auto",
    overflowX: "hidden",
    maxHeight: "80vh",
    // padding: "1rem",
    boxSizing: "border-box",
  });

  const email = sessionStorage.getItem("email");
  const pw = sessionStorage.getItem("password");

  try {
    const response = await fetch(`${BASE_URL}/rest/api/task/myTasks`, {
      method: "GET",
      headers: { Authorization: "Basic " + btoa(`${email}:${pw}`) },
    });

    if (!response.ok) throw new Error(`Unauthorized or fetch failed: ${email} ${pw}`);

    const tasks = await response.json();
    taskContainer.innerHTML = tasks.length === 0 ? "<p>No tasks found.</p>" : "";

    tasks.forEach((task) => {
      const due_date = new Date(task.due_date);
      const taskDiv = document.createElement("div");
      taskDiv.className = "task-item";

      // Sabit width ve responsive için min-width:0 kritik
      Object.assign(taskDiv.style, {
        flex: "0 0 calc(33.33% - 0.33rem)",
        minWidth: "0",
        minHeight: "180px",
        maxHeight: "220px",
        backgroundColor: "#f3ddbaff",
        display: "flex",
        flexDirection: "column",
        borderRadius: "10px",
        boxSizing: "border-box",
        overflow: "hidden",
      });

      taskDiv.innerHTML = `
        <div id="due_date" style="text-align:center; border:2px solid; border-radius:10px 10px 0 0; background-color:#e0d4b7ff; padding:0.5rem; flex:0 0 auto;">
          ${due_date.toLocaleDateString("en-GB")}
        </div>
        <div id="title" style="padding:0.5rem; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:0 0 auto;">
          ${task.title}
        </div>
        <div id="desc" style="padding:0.5rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1 1 auto;" onclick="handleDesc(this.innerText)">
          ${task.description}
        </div>
        <div id="icon-container" style="display:flex; justify-content:center; gap:1rem; margin-top:auto; padding:0.5rem 0;">
          <img src="/images/dark-check.svg" alt="check" style="width:20px; height:20px; cursor:pointer;" onclick="handleCheck(this)" />
          <img src="/images/delete.svg" alt="delete" style="width:20px; height:20px; cursor:pointer;" onclick="deleteTask(${task.id})" />
          <p id="done" style="text-align:center; margin:0;">${showDone(task)}</p>
        </div>
      `;

      taskContainer.appendChild(taskDiv);
    });

    // Responsive: JS ile
    const resizeTasks = () => {
      const width = window.innerWidth;
      document.querySelectorAll(".task-item").forEach((item) => {
        if (width <= 600) item.style.flex = "0 0 100%"; // mobil: 1 per row
        else if (width <= 1200) item.style.flex = "0 0 calc(50% - 0.25rem)"; // tablet: 2 per row
        else item.style.flex = "0 0 calc(33.33% - 0.33rem)"; // desktop: 3 per row
      });
    };

    resizeTasks();
    window.addEventListener("resize", resizeTasks);

  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};




// const loadData = async () => {
//   const taskContainer = document.getElementById("welcome_task_container");
//   email = sessionStorage.getItem("email");
//   pw = sessionStorage.getItem("password");
//   try {
//     const response = await fetch(`${BASE_URL}/rest/api/task/myTasks`, {
//       method: "GET",
//       headers: {
//         Authorization: "Basic " + btoa(`${email}:${pw}`), // email ve password event'ten alınır
//       },
//     });
//     if (!response.ok)
//       throw new Error(`Unauthorized or fetch failed: ${email} ${pw}`);

//     const tasks = await response.json();
//     if (tasks.length === 0) {
//       taskContainer.innerHTML = "<p>No tasks found.</p>";
//       return;
//     }
//     taskContainer.innerHTML = ""; // Önceki içeriği temizle
//     tasks.forEach((task) => {
//       const taskDiv = document.createElement("div");
//       const due_date = new Date(task.due_date);

//       const title = task.title;

//       const description = task.description;

//       const done = task.done;

//       taskDiv.className = "task-item";
//       //     taskDiv.innerHTML = `
//       //       <div style="
//       //   background-color: #f3ddbaff;
//       //   display: flex;
//       //   flex-direction: column;
//       //   font-size: larger;
//       //   font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//       //   // border-radius: 10px;
//       //   border-bottom-left-radius: 10px;
//       //   border-bottom-right-radius: 10px;
//       //   box-sizing: border-box;
//       //   width: 100%; /* kolonun tamamını kaplasın */
//       // ">
//       //   <div id="due_date" style="
//       //     text-align: center;
//       //     border: solid 2px;
//       //     padding: 10px;
//       //     border-bottom-left-radius: 10px;
//       //     border-bottom-right-radius: 10px;
//       //   ">
//       //     ${due_date.toLocaleDateString("en-GB")}
//       //   </div>
//       //   <div id="title" style="padding: 10px; text-align: start">${title}</div>
//       //   <div id="desc" style="text-align: end; padding: 10px">${description}</div>
//       //   <div id="icon-container" style="display: flex; flex-direction: row; margin: 5px">
//       //     <img src="/images/dark-check.svg" id="checkButton" alt="check" style="width: 20px; height: 20px; cursor: pointer; margin: auto" onclick="handleCheck(this)" />
//       //     <img src="/images/delete.svg" id="deleteButton" alt="delete" style="width: 20px; height: 20px; cursor: pointer; margin: auto" onclick="deleteTask(${
//       //       task.id
//       //     })"/>
//       //     <p id="done" style="text-align: center">${showDone(task)}</p>
//       //   </div>
//       // </div>`;
//       taskDiv.innerHTML = `
//       <div style="
//     background-color: #f3ddbaff;
//     display: flex;
//     flex-direction: column;
//     font-size: larger;
//     font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//     border-radius: 10px;
//     box-sizing: border-box;
//     width: 100%;
//     min-height: 180px;       /* mobilde minimum yükseklik */
//     max-height: 220px;       /* çok uzun olursa taşmasın */
//     overflow: hidden;
//     margin: 0.5rem 0;
//   ">

//   <!-- Due Date -->
//   <div id="due_date" style="
//       text-align: center;
//       border: solid 2px;
//       padding: 0.5rem;
//       border-top-left-radius: 10px;
//       border-top-right-radius: 10px;
//       background-color: #e0d4b7ff;
//       flex: 0 0 auto;
//     ">
//     ${due_date.toLocaleDateString("en-GB")}
//   </div>

//   <!-- Title -->
//   <div id="title" style="
//       padding: 0.5rem;
//       font-weight: bold;
//       text-align: start;
//       white-space: nowrap;
//       overflow: hidden;
//       text-overflow: ellipsis;
//       flex: 0 0 auto;
//     ">
//     ${title}
//   </div>

//   <!-- Description -->
//   <div id="desc" style="
//       text-align: start;
//       padding: 0.5rem;
//       flex: 1 1 auto;
//       overflow: hidden;
//       display: -webkit-box;
//       -webkit-line-clamp: 2;   /* en fazla 2 satır göster */
//       -webkit-box-orient: vertical;
//       text-overflow: ellipsis;
//     " onclick="handleDesc(this.innerText)">
//     ${description}
//   </div>

//   <!-- Icon Container -->
//   <div id="icon-container" style="
//       display: flex;
//       flex-direction: row;
//       justify-content: center;
//       gap: 1rem;
//       margin-top: auto;         /* ikonlar hep altta */
//       padding: 0.5rem 0;
//     ">
//     <img src="/images/dark-check.svg" id="checkButton" alt="check" style="width: 20px; height: 20px; cursor: pointer;" onclick="handleCheck(this)" />
//     <img src="/images/delete.svg" id="deleteButton" alt="delete" style="width: 20px; height: 20px; cursor: pointer;" onclick="deleteTask(${
//       task.id
//     })" />
//     <p id="done" style="text-align: center; margin: 0;">${showDone(task)}</p>
//   </div>
// </div>
//       `;
//       taskContainer.appendChild(taskDiv);
//     });
//   } catch (error) {
//     console.error("Error fetching tasks:", error);
//   }
// };

const showDone = (task) => {
  const done = task.done;
  if (done) {
    return "Tamamlandı";
  } else {
    return "Tamamlanmadı";
  }
};

const deleteTask = async (taskId) => {
  let email = sessionStorage.getItem("email");
  let pw = sessionStorage.getItem("password");
  console.log("Deleting task with ID:", taskId, email, pw);
  try {
    const response = await fetch(`${BASE_URL}/rest/api/task/delete/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: "Basic " + btoa(`${email}:${pw}`),
      },
    });
    if (response.ok) {
      // alert("Task deleted successfully!");
      loadData(); // Görev silindikten sonra listeyi güncelle
    } else {
      alert("Failed to delete task.");
    }
  } catch (error) {
    console.error("Error deleting task:", error);
  }
};

const handleCheck = (checkIcon) => {
  const taskDiv = checkIcon.closest(".task-item");

  // İlgili elemanlar
  const due_date = taskDiv.querySelector("#due_date");
  const title = taskDiv.querySelector("#title");
  const desc = taskDiv.querySelector("#desc");
  const done = taskDiv.querySelector("#done");

  // Toggle kontrolü
  const isDone = done.innerText === "Tamamlandı";

  if (!isDone) {
    // Görev tamamlandı
    due_date.style.textDecoration = "line-through";
    title.style.textDecoration = "line-through";
    desc.style.textDecoration = "line-through";
    done.innerText = "Tamamlandı";

    // Check iconunu close iconu ile değiştir
    checkIcon.src = "/images/close.svg";
  } else {
    // Görev geri alındı
    due_date.style.textDecoration = "none";
    title.style.textDecoration = "none";
    desc.style.textDecoration = "none";
    done.innerText = "Tamamlanmadı";

    // Close iconunu tekrar check iconu ile değiştir
    checkIcon.src = "/images/dark-check.svg";
  }
  // close, delete’ten önce görünsün
};

const handleDesc = (desc) => {
  const container = document.createElement("div");
  const alreadyOpen = document.querySelector(".desc-container");
  if (alreadyOpen) alreadyOpen.remove();
  container.className = "desc-container";
  container.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #f3ddbaff;
      border: solid 2px burlywood;
      border-radius: 10px;
      padding: 20px;
      width: 80%;
      max-width: 400px;
      max-height: 80vh;       /* ekranın %80'i kadar */
      overflow-y: auto;       /* dikey scroll varsa çık */
      overflow-x: hidden;     /* yatay scroll yok */
      z-index: 1000;
      box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    ">
      <div style="
        white-space: pre-wrap;   /* satır sonlarını koru ve kelime kır */
        word-break: break-word;   /* uzun kelimeleri satırda kır */
      ">${desc}</div>
      <button id="closeDescBtn" style="
        margin-top: 15px;
        height: 40px;
        cursor: pointer;
        width: 50%;
        max-width: 150px;
        display: block;
        margin-left: auto;
        margin-right: auto;
      ">Close</button>
    </div>
  `;
  document.body.appendChild(container);

  document.getElementById("closeDescBtn").addEventListener("click", () => {
    container.remove();
  });
};

window.addEventListener("DOMContentLoaded", loadData);
