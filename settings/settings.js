// Default Settings
const defaultSettings = {
    focusTime: 25 * 60, // Default focus time (25 minutes)
    breakTime: 5 * 60,  // Default break time (5 minutes)
    theme: "dark",      // Default theme
    backgroundColorStudy: "#ff69b4", // Default study color (Bright Pink)
    backgroundColorBreak: "#0000ff", // Default break color (Blue)
  };
  
  // Save Settings to Local Storage
  function saveSettings(settings) {
    localStorage.setItem("studySettings", JSON.stringify(settings));
  }
  
  // Load Settings from Local Storage
  function loadSettings() {
    const settings = localStorage.getItem("studySettings");
    return settings ? JSON.parse(settings) : defaultSettings;
  }
  
  // Apply Settings to the Application
  function applySettings() {
    const settings = loadSettings();
    document.body.setAttribute("data-theme", settings.theme); // Apply theme
  }
  
  // Add Event Listeners for Settings Inputs
  function setupSettingsControls() {
    const focusTimeInput = document.getElementById("focus-time");
    const breakTimeInput = document.getElementById("break-time");
    const themeSelect = document.getElementById("theme");
    const backgroundColorStudySelect = document.getElementById("background-color-study");
    const backgroundColorBreakSelect = document.getElementById("background-color-break");
  
    // Load current settings into inputs
    const settings = loadSettings();
    focusTimeInput.value = settings.focusTime / 60; // Convert seconds to minutes
    breakTimeInput.value = settings.breakTime / 60;
    themeSelect.value = settings.theme;
    backgroundColorStudySelect.value = settings.backgroundColorStudy;
    backgroundColorBreakSelect.value = settings.backgroundColorBreak;
  
    // Save updated settings when the save button is clicked
    document.getElementById("save-settings").addEventListener("click", () => {
      const updatedSettings = {
        focusTime: parseInt(focusTimeInput.value, 10) * 60, // Convert minutes to seconds
        breakTime: parseInt(breakTimeInput.value, 10) * 60,
        theme: themeSelect.value,
        backgroundColorStudy: backgroundColorStudySelect.value, // Save study color
        backgroundColorBreak: backgroundColorBreakSelect.value, // Save break color
      };
      saveSettings(updatedSettings);
  
      // Set reset flag for index.html
      localStorage.setItem("resetTimer", "true");
  
      // Notify and redirect
      alert("Settings saved! Timer will restart with new settings.");
      window.location.href = "../index.html";
    });
  }
  
  // Load Logs from Local Storage
  function loadLogs() {
    const savedLogs = localStorage.getItem("studyLogs");
    return savedLogs ? JSON.parse(savedLogs) : [];
  }
  
  // Display Logs on the Page
  function displayLogs() {
    const logs = loadLogs();
    const logsTableBody = document.querySelector("#logs-table tbody");
    logsTableBody.innerHTML = ""; // Clear existing logs
  
    if (logs.length === 0) {
      const logsContainer = document.getElementById("logs-container");
      logsContainer.innerHTML += "<p>No sessions logged yet.</p>";
      return;
    }
  
    logs.forEach((log, index) => {
      const row = logsTableBody.insertRow();
  
      const cellIndex = row.insertCell(0);
      const cellDate = row.insertCell(1);
      const cellTime = row.insertCell(2);
      const cellFocus = row.insertCell(3);
      const cellBreak = row.insertCell(4);
  
      cellIndex.textContent = index + 1;
      cellDate.textContent = log.date;
      cellTime.textContent = log.time;
      cellFocus.textContent = log.focusDuration > 0 ? `${Math.floor(log.focusDuration / 60)} mins` : '-';
      cellBreak.textContent = log.breakDuration > 0 ? `${Math.floor(log.breakDuration / 60)} mins` : '-';
    });
  }
  
  // Generate Statistics and Charts
  function generateStatistics() {
    const logs = loadLogs();
  
    // Initialize data structures for statistics
    let totalFocus = 0;
    let totalBreak = 0;
    const sessionsPerDay = {};
    const focusDurations = [];
    const breakDurations = [];
    const sessionDates = [];
    const dailyFocus = {};
    const dailyBreak = {};
    const dailySessions = {};
  
    logs.forEach((log) => {
      const focusMin = log.focusDuration ? log.focusDuration / 60 : 0;
      const breakMin = log.breakDuration ? log.breakDuration / 60 : 0;
      const date = log.date;
  
      totalFocus += focusMin;
      totalBreak += breakMin;
  
      // Track sessions per day
      if (!sessionsPerDay[date]) {
        sessionsPerDay[date] = 0;
      }
      sessionsPerDay[date] += 1;
  
      // Collect focus and break durations
      if (focusMin > 0) {
        focusDurations.push(focusMin);
        sessionDates.push(log.dateTime || log.date + ' ' + log.time);
      }
      if (breakMin > 0) {
        breakDurations.push(breakMin);
      }
  
      // Daily totals for focus and break
      dailyFocus[date] = (dailyFocus[date] || 0) + focusMin;
      dailyBreak[date] = (dailyBreak[date] || 0) + breakMin;
  
      // Daily session counts
      dailySessions[date] = (dailySessions[date] || 0) + 1;
    });
  
    // Prepare data for charts
    const sortedDates = Object.keys(sessionsPerDay).sort((a, b) => new Date(a) - new Date(b));
    const sessionsPerDayData = sortedDates.map(date => sessionsPerDay[date]);
    const dailyFocusData = sortedDates.map(date => dailyFocus[date] || 0);
    const dailyBreakData = sortedDates.map(date => dailyBreak[date] || 0);
  
    // Chart 1: Focus vs Break Time (Pie Chart)
    createDoughnutChart('focus-break-chart', ['Focus Time', 'Break Time'], [totalFocus, totalBreak], ['#4caf50', '#ff9800']);
  
    // Chart 2: Sessions Per Day (Bar Chart)
    createBarChart('sessions-per-day-chart', sortedDates, sessionsPerDayData, 'Sessions Per Day', '#2196f3');
  
    // Chart 3: Focus Duration Over Time (Line Chart)
    createLineChart('focus-duration-chart', sessionDates, focusDurations, 'Focus Duration (mins)', '#4caf50');
  
    // Chart 4: Break Duration Over Time (Line Chart)
    createLineChart('break-duration-chart', sessionDates, breakDurations, 'Break Duration (mins)', '#ff9800');
  
    // Additional charts can be added similarly
  }
  
  // Helper Functions to Create Charts
  function createDoughnutChart(canvasId, labels, data, backgroundColors) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors,
          hoverBackgroundColor: backgroundColors.map(color => shadeColor(color, -20)),
        }]
      },
      options: chartOptions()
    });
  }
  
  function createBarChart(canvasId, labels, data, label, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: label,
          data: data,
          backgroundColor: color,
        }]
      },
      options: chartOptions()
    });
  }
  
  function createLineChart(canvasId, labels, data, label, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: label,
          data: data,
          borderColor: color,
          backgroundColor: shadeColor(color, 50),
          fill: true,
          tension: 0.4,
        }]
      },
      options: chartOptions()
    });
  }
  
  function chartOptions() {
    return {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: '#fff',
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#fff',
          },
          grid: {
            display: false,
          },
        },
        y: {
          ticks: {
            color: '#fff',
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
    };
  }
  
  // Utility function to shade colors
  function shadeColor(color, percent) {
    const f = parseInt(color.slice(1),16),
          t = percent<0?0:255,
          p = percent<0?percent*-1:percent,
          R = f>>16,
          G = f>>8&0x00FF,
          B = f&0x0000FF;
    return "#" + (0x1000000 + (Math.round((t - R) * p) + R)*0x10000 + (Math.round((t - G) * p) + G)*0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
  }
  
  // Initialize Settings
  document.addEventListener("DOMContentLoaded", () => {
    applySettings(); // Apply existing settings to the page
    setupSettingsControls(); // Initialize controls with saved values
    displayLogs(); // Display logs on settings page
    generateStatistics(); // Generate charts and statistics
  });
  
  // Back button to redirect without affecting timer
  document.querySelector(".back-btn").addEventListener("click", () => {
    window.location.href = "../index.html";
  });
  