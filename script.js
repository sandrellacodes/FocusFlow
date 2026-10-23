const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");

const completedCount = document.getElementById("completed-count");
const remainingCount = document.getElementById("remaining-count");
const sessionCount = document.getElementById("session-count");
const progressPercent = document.getElementById("progress-percent");
const progressBar = document.getElementById("progress-bar");

const timerDisplay = document.getElementById("timer-display");
const timerMode = document.getElementById("timer-mode");
const timerStatus = document.getElementById("timer-status");
const timerStart = document.getElementById("timer-start");
const timerReset = document.getElementById("timer-reset");
const themeToggle = document.getElementById("theme-toggle");

let tasks = [];
let sessions = 0;

try {
tasks = JSON.parse(localStorage.getItem("focusflow-tasks")) || [];
sessions = Number(localStorage.getItem("focusflow-sessions")) || 0;
} catch (error) {
tasks = [];
sessions = 0;
}

function saveData() {
localStorage.setItem("focusflow-tasks", JSON.stringify(tasks));
localStorage.setItem("focusflow-sessions", String(sessions));
}

function renderTasks() {
taskList.replaceChildren();

let completed = 0;

tasks.forEach((task) => {
    if (task.done) completed++;

    const item = document.createElement("li");
    item.className = "task-item" + (task.done ? " completed" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", "Mark task complete");

    checkbox.addEventListener("change", () => {
        task.done = checkbox.checked;
        saveData();
        renderTasks();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-task";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Delete task");

    deleteButton.addEventListener("click", () => {
        tasks = tasks.filter((entry) => entry.id !== task.id);
        saveData();
        renderTasks();
    });

    item.append(checkbox, text, deleteButton);
    taskList.appendChild(item);
});

const total = tasks.length;
const remaining = total - completed;
const progress = total ? Math.round((completed / total) * 100) : 0;

completedCount.textContent = completed;
remainingCount.textContent = remaining;
sessionCount.textContent = sessions;
progressPercent.textContent = progress + "%";
progressBar.style.width = progress + "%";

emptyState.hidden = total > 0;

}

taskForm.addEventListener("submit", (event) => {
event.preventDefault();

const text = taskInput.value.trim();
if (!text) return;

tasks.push({
    id: Date.now() + Math.random(),
    text,
    done: false
});

taskInput.value = "";
saveData();
renderTasks();
taskInput.focus();

});

const savedTheme = localStorage.getItem("focusflow-theme");

if (savedTheme === "dark") {
document.body.classList.add("dark");
themeToggle.textContent = "☀";
}

themeToggle.addEventListener("click", () => {
document.body.classList.toggle("dark");

const isDark = document.body.classList.contains("dark");

themeToggle.textContent = isDark ? "☀" : "☾";
localStorage.setItem("focusflow-theme", isDark ? "dark" : "light");

});

let selectedMinutes = 25;
let remainingSeconds = selectedMinutes * 60;
let timerInterval = null;
let isRunning = false;
let currentMode = "focus";

function updateTimerDisplay() {
const minutes = Math.floor(remainingSeconds / 60);
const seconds = remainingSeconds % 60;

timerDisplay.textContent =
    String(minutes).padStart(2, "0") + ":" +
    String(seconds).padStart(2, "0");

}

function stopTimer() {
clearInterval(timerInterval);
timerInterval = null;
isRunning = false;
timerStart.textContent = "▶️ Start";
}

function selectTimer(minutes, mode) {
stopTimer();

selectedMinutes = minutes;
remainingSeconds = minutes * 60;
currentMode = mode;

timerMode.textContent = mode === "focus" ? "FOCUS TIME" : "BREAK TIME";
timerStatus.textContent = "Ready when you are";

document.querySelectorAll(".preset").forEach((button) => {
    button.classList.toggle(
        "active",
        Number(button.dataset.minutes) === minutes
    );
});

updateTimerDisplay();

}

document.querySelectorAll(".preset").forEach((button) => {
button.addEventListener("click", () => {
selectTimer(
Number(button.dataset.minutes),
button.dataset.mode
);
});
});

timerStart.addEventListener("click", () => {
if (isRunning) {
stopTimer();
timerStatus.textContent = "Paused — take your time";
return;
}

if (remainingSeconds <= 0) {
    remainingSeconds = selectedMinutes * 60;
}

isRunning = true;
timerStart.textContent = "Ⅱ Pause";
timerStatus.textContent = "You're doing great. Keep going!";

timerInterval = setInterval(() => {
    remainingSeconds--;
    updateTimerDisplay();

    if (remainingSeconds <= 0) {
        stopTimer();
        timerStatus.textContent = "Session complete! 🎉";

        if (currentMode === "focus") {
            sessions++;
            saveData();
            renderTasks();
        }

        alert(
            currentMode === "focus"
                ? "Focus session complete! Great work. Take a break."
                : "Break's over! Ready to focus again?"
        );
    }
}, 1000);

});

timerReset.addEventListener("click", () => {
selectTimer(selectedMinutes, currentMode);
});

renderTasks();
updateTimerDisplay();