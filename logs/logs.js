// Logs File for Sebastien Study Tool

// Function to log a session
function logSession(focusTime, breakTime) {
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const log = { date, focusTime, breakTime };
  
    // Retrieve existing logs from localStorage
    let logs = JSON.parse(localStorage.getItem("studyLogs") || "[]");
  
    // Add the new log to the logs array
    logs.push(log);
  
    // Save updated logs back to localStorage
    localStorage.setItem("studyLogs", JSON.stringify(logs));
    console.log("Session logged:", log);
  }
  
  // Function to retrieve all logs
  function getLogs() {
    return JSON.parse(localStorage.getItem("studyLogs") || "[]");
  }
  
  // Function to display logs (for debugging or UI)
  function displayLogs() {
    const logs = getLogs();
    console.log("Study Logs:", logs);
  
    // Optional: Display logs on the webpage
    const logContainer = document.getElementById("logs-container");
    if (logContainer) {
      logContainer.innerHTML = ""; // Clear current logs display
      logs.forEach((log, index) => {
        const logItem = document.createElement("p");
        logItem.textContent = `Session ${index + 1} - Date: ${log.date}, Focus Time: ${Math.floor(log.focusTime / 60)} mins, Break Time: ${Math.floor(log.breakTime / 60)} mins`;
        logContainer.appendChild(logItem);
      });
    }
  }
  