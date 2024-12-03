// Timer Variables
let focusTime = 25 * 60; // Default focus time (25 minutes)
let breakTime = 5 * 60;  // Default break time (5 minutes)
let currentTimer = focusTime; // The timer starts with focus time
let isFocusMode = true; // Boolean to track if it's focus or break mode
let timerInterval = null; // To store the timer interval
let totalFocusTime = 0; // To track total focus time
let studyColor = "#ff0000"; // Default study color
let breakColor = "#0000ff"; // Default break color
let isRunning = false; // Track if the timer is running
let logs = []; // Array to store session logs
let tasks = []; // Array to store tasks

// DOM Elements
const timerDisplay = document.getElementById("timer-display");
const timerMode = document.getElementById("timer-mode");
const startButton = document.getElementById("start-btn");
const totalTimeDisplay = document.getElementById("total-time");
const timerSound = document.getElementById("timer-sound");

const taskList = document.getElementById("task-list");
const taskInput = document.getElementById("task-input");
const addTaskButton = document.getElementById("add-task-btn");

// Save Timer State to Local Storage
function saveTimerState() {
    const timerState = {
        currentTimer,
        isFocusMode,
        isRunning,
        totalFocusTime,
    };
    localStorage.setItem("timerState", JSON.stringify(timerState));
}

// Load Timer State from Local Storage
function loadTimerState() {
    const timerState = localStorage.getItem("timerState");
    if (timerState) {
        const { currentTimer: savedTimer, isFocusMode: savedMode, isRunning: savedRunning, totalFocusTime: savedFocus } = JSON.parse(timerState);
        currentTimer = savedTimer;
        isFocusMode = savedMode;
        isRunning = savedRunning;
        totalFocusTime = savedFocus;
    }
}

// Load Logs from Local Storage
function loadLogs() {
    const savedLogs = localStorage.getItem("studyLogs");
    logs = savedLogs ? JSON.parse(savedLogs) : [];
}

// Save Logs to Local Storage
function saveLogs() {
    localStorage.setItem("studyLogs", JSON.stringify(logs));
}

// Log Completed Session
function logSession(focusDuration, breakDuration) {
    const now = new Date();
    const logEntry = {
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        focusDuration,
        breakDuration,
    };
    logs.push(logEntry);
    saveLogs(); // Save logs to localStorage
}

// Load Tasks from Local Storage
function loadTasks() {
    const savedTasks = localStorage.getItem("taskList");
    tasks = savedTasks ? JSON.parse(savedTasks) : [];
}

// Save Tasks to Local Storage
function saveTasks() {
    localStorage.setItem("taskList", JSON.stringify(tasks));
}

// Display Tasks on the Page
function displayTasks() {
    taskList.innerHTML = ""; // Clear existing tasks

    if (tasks.length === 0) {
        taskList.innerHTML = "<p>No tasks added yet.</p>";
        return;
    }

    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.classList.add("task-item");

        const taskText = document.createElement("span");
        taskText.textContent = task.text;
        if (task.completed) {
            taskText.classList.add("completed");
        }

        // Add a checkbox to mark task as complete
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.addEventListener("change", () => {
            tasks[index].completed = checkbox.checked;
            saveTasks();
            displayTasks();
        });

        // Add a delete button to remove the task
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "✖";
        deleteButton.classList.add("delete-btn");
        deleteButton.addEventListener("click", () => {
            tasks.splice(index, 1);
            saveTasks();
            displayTasks();
        });

        li.appendChild(checkbox);
        li.appendChild(taskText);
        li.appendChild(deleteButton);
        taskList.appendChild(li);
    });
}

// Add Task Event Listener
addTaskButton.addEventListener("click", () => {
    const taskText = taskInput.value.trim();
    if (taskText !== "") {
        const newTask = {
            text: taskText,
            completed: false,
        };
        tasks.push(newTask);
        saveTasks();
        displayTasks();
        taskInput.value = ""; // Clear input field
    }
});

// Load Settings from Local Storage
function loadSettings() {
    const settings = localStorage.getItem("studySettings");
    if (settings) {
        const {
            focusTime: savedFocusTime,
            breakTime: savedBreakTime,
            backgroundColorStudy,
            backgroundColorBreak,
        } = JSON.parse(settings);

        focusTime = savedFocusTime; // Update focusTime with saved value
        breakTime = savedBreakTime; // Update breakTime with saved value
        studyColor = backgroundColorStudy; // Update study color
        breakColor = backgroundColorBreak; // Update break color
        currentTimer = isFocusMode ? focusTime : breakTime; // Set currentTimer to match mode

        // Apply initial background color
        document.body.style.backgroundColor = isFocusMode ? studyColor : breakColor;
    }
}

// Reset Timer if Needed
function resetTimerIfNeeded() {
    const resetFlag = localStorage.getItem("resetTimer");
    if (resetFlag === "true") {
        // Reset the timer with new settings
        isFocusMode = true; // Start with focus mode
        loadSettings(); // Reload settings to get new focusTime and breakTime
        currentTimer = focusTime; // Reset to new focus time
        document.body.style.backgroundColor = studyColor; // Apply new study color
        updateDisplay(); // Update timer display
        clearInterval(timerInterval); // Stop any running timer
        timerInterval = null; // Clear the interval
        isRunning = false; // Reset running state
        startButton.textContent = "START"; // Reset button text
        localStorage.removeItem("resetTimer"); // Clear the reset flag
        saveTimerState(); // Save the reset state
    }
}

// Play Timer Sound
function playTimerSound() {
    timerSound.currentTime = 0; // Reset to the beginning
    timerSound.play(); // Play the sound
}

// Update Timer Display
function updateDisplay() {
    const minutes = Math.floor(currentTimer / 60);
    const seconds = currentTimer % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    timerMode.textContent = isFocusMode ? "Time to focus!" : "Time to relax!";
}

// Start or Pause Timer
startButton.addEventListener("click", () => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        isRunning = false; // Mark as paused
        startButton.textContent = "START";
        saveTimerState(); // Save state when paused
    } else {
        isRunning = true; // Mark as running
        startButton.textContent = "PAUSE";
        timerInterval = setInterval(() => {
            // Check if reset is needed during interval
            if (localStorage.getItem("resetTimer") === "true") {
                resetTimerIfNeeded();
                return; // Exit the interval function
            }

            currentTimer--;
            updateDisplay();
            saveTimerState(); // Save state every second

            // When timer ends
            if (currentTimer <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;

                // Play timer sound
                playTimerSound();

                if (isFocusMode) {
                    totalFocusTime += focusTime;
                    updateTotalFocusTime();
                    logSession(focusTime, 0); // Log completed focus session
                    currentTimer = breakTime; // Switch to break timer
                } else {
                    logSession(0, breakTime); // Log completed break session
                    currentTimer = focusTime; // Switch back to focus timer
                }

                isFocusMode = !isFocusMode; // Toggle mode

                // Update background color
                document.body.style.backgroundColor = isFocusMode ? studyColor : breakColor;

                // Reset button to START for the new mode
                startButton.textContent = "START";
                isRunning = false; // Reset to paused for the new mode
                saveTimerState(); // Save the state
                updateDisplay();
            }
        }, 1000);
    }
});

// Update Total Focus Time
function updateTotalFocusTime() {
    const totalMinutes = Math.floor(totalFocusTime / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    totalTimeDisplay.textContent = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
}

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
    loadSettings(); // Load saved settings
    resetTimerIfNeeded(); // Reset timer if needed
    loadTimerState(); // Load timer state
    loadLogs(); // Load saved logs
    loadTasks(); // Load saved tasks
    updateDisplay(); // Update the timer display with loaded settings and state
    updateTotalFocusTime(); // Update total focus time display
    displayTasks(); // Display tasks on page load

    // Resume timer if it was running
    if (isRunning) {
        startButton.textContent = "PAUSE";
        startButton.click(); // Simulate click to resume timer
    }
});

// Pause Timer When Navigating Away
window.addEventListener('beforeunload', function () {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        isRunning = false;
        saveTimerState();
    }
});
