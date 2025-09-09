  const BASE_URL = "https://havetodoonline-production.up.railway.app";   


const handleAdd = () => {
  // Eğer form zaten varsa yeni form açma
  if (document.getElementById("taskFormOverlay")) return;

  const taskForm = document.createElement("div");
  taskForm.id = "taskFormOverlay"; // formu tekil olarak tanımlıyoruz
  taskForm.innerHTML = `
    <form id="taskForm" style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        border: burlywood solid 2px;
        border-radius: 10px;
        padding: 20px;
        width: 30%;
        height: 500px;
        background-color: aliceblue;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: larger;
        z-index: 1000;
      ">
        <label for="title" style="padding: 10px;">Task Name:</label>
        <input type="text" id="taskName" name="title" style="height:20px; border-radius: 4px;" required><br><br>

        <label for="due_date">Due Date:</label>
        <input type="date" id="dueDate" name="due_date" required style="height: 35px;border-radius: 4px;text-align: center;"><br><br>

        <label for="description">Description:</label><br>
        <textarea id="description" name="description" rows="4" cols="50" required style="max-width: fit-content;border: solid 2px;border-radius: 4px;"></textarea><br><br>

        <button type="submit" id="addTaskButton" style="height: 30px;cursor: pointer;">
          Add Task
        </button>
        <button type="button" id="closeFormBtn" style="margin-top:10px;">Close</button>
    </form>
  `;

  document.body.appendChild(taskForm);

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

  // Token'ı localStorage veya global değişkenden al
  // const token = localStorage.getItem("jwtToken");
  // if (!token) {
  //   alert("User not authenticated. Please log in.");
  //   return;
  // }

  try {
    const response = await fetch(
      `${BASE_URL}/rest/api/task/saveTask`,
      {
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
      }
    );
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
  email = sessionStorage.getItem("email");
  pw = sessionStorage.getItem("password");
  try {
    const response = await fetch(
      `${BASE_URL}/rest/api/task/myTasks`,
      {
        method: "GET",
        headers: {
          Authorization: "Basic " + btoa(`${email}:${pw}`), // email ve password event'ten alınır
        },
      }
    );
    if (!response.ok)
      throw new Error(`Unauthorized or fetch failed: ${email} ${pw}`);

    const tasks = await response.json();
    if (tasks.length === 0) {
      taskContainer.innerHTML = "<p>No tasks found.</p>";
      return;
    }
    taskContainer.innerHTML = ""; // Önceki içeriği temizle
    tasks.forEach((task) => {
      const taskDiv = document.createElement("div");
      const due_date = new Date(task.due_date);

      const title = task.title;

      const description = task.description;

      const done = task.done;

      taskDiv.className = "task-item";
      taskDiv.innerHTML = `
        <div style="
    background-color: #f3ddbaff;
    display: flex;
    flex-direction: column;
    font-size: larger;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    // border-radius: 10px;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    box-sizing: border-box;
    width: 100%; /* kolonun tamamını kaplasın */
  ">
    <div id="due_date" style="
      text-align: center;
      border: solid 2px;
      padding: 10px;
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;
    ">
      ${due_date.toLocaleDateString("en-GB")}
    </div>
    <div id="title" style="padding: 10px; text-align: start">${title}</div>
    <div id="desc" style="text-align: end; padding: 10px">${description}</div>
    <div id="icon-container" style="display: flex; flex-direction: row; margin: 5px">
      <img src="/images/dark-check.svg" id="checkButton" alt="check" style="width: 20px; height: 20px; cursor: pointer; margin: auto" onclick="handleCheck(this)" />
      <img src="/images/delete.svg" id="deleteButton" alt="delete" style="width: 20px; height: 20px; cursor: pointer; margin: auto" onclick="deleteTask(${
        task.id
      })"/>
      <p id="done" style="width: 50%; text-align: center">${done}</p>
    </div>
  </div>`;
      taskContainer.appendChild(taskDiv);
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};

const deleteTask = async (taskId) => {
  let email = sessionStorage.getItem("email");
  let pw = sessionStorage.getItem("password");
  console.log("Deleting task with ID:", taskId,email,pw);
  try {
    const response = await fetch(
      `${BASE_URL}/rest/api/task/delete/${taskId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "Basic " + btoa(`${email}:${pw}`)
        }
      }

    );
    if (response.ok) {
      alert("Task deleted successfully!");
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
  const isDone = done.innerText === "true";

  if (!isDone) {
    // Görev tamamlandı
    due_date.style.textDecoration = "line-through";
    title.style.textDecoration = "line-through";
    desc.style.textDecoration = "line-through";
    done.innerText = "true";

    // Check iconunu close iconu ile değiştir
    checkIcon.src = "/images/close.svg";
  } else {
    // Görev geri alındı
    due_date.style.textDecoration = "none";
    title.style.textDecoration = "none";
    desc.style.textDecoration = "none";
    done.innerText = "false";

    // Close iconunu tekrar check iconu ile değiştir
    checkIcon.src = "/images/check_.svg";
  }
  // close, delete’ten önce görünsün
};
// document.getElementById("checkButton").addEventListener("click", handleCheck);

window.addEventListener("DOMContentLoaded", loadData);
