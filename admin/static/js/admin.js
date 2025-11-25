// Admin Panel Real-time JavaScript with Enhanced Hover Effects
let socket
const adminData = {
  users: [],
  content: [],
  systemHealth: {},
  realTimeStats: {},
}

// Declare variables before using them
let io
let updateUserData
let updateContentData
let showNotification

// Initialize Socket.IO connection
function initializeSocket() {
  socket = io

  socket.on("connect", () => {
    console.log("Connected to server")
    logActivity("Connected to real-time server", "success")
  })

  socket.on("disconnect", () => {
    console.log("Disconnected from server")
    logActivity("Disconnected from server", "warning")
  })

  // Real-time data updates
  socket.on("user_update", (data) => {
    updateUserData(data)
  })

  socket.on("content_update", (data) => {
    updateContentData(data)
  })

  socket.on("system_health_update", (data) => {
    updateSystemHealth(data)
  })

  socket.on("new_activity", (data) => {
    logActivity(data.message, data.type)
  })
}

// Real-time Activity Logger
function logActivity(message, type = "info") {
  const activityLog = document.getElementById("realTimeActivity")
  const timestamp = new Date().toLocaleTimeString()
  const icons = {
    success: "✅",
    warning: "⚠️",
    error: "❌",
    info: "ℹ️",
  }

  const logEntry = document.createElement("div")
  logEntry.innerHTML = `[${timestamp}] ${icons[type]} ${message}`
  logEntry.style.marginBottom = "0.25rem"

  activityLog.insertBefore(logEntry, activityLog.firstChild)

  // Keep only last 20 entries
  while (activityLog.children.length > 20) {
    activityLog.removeChild(activityLog.lastChild)
  }

  // Scroll to top
  activityLog.scrollTop = 0
}

// Real-time Stats Updates
function updateRealTimeStats() {
  const updates = {
    userCount:
      Math.floor(Math.random() * 3) + Number.parseInt(document.getElementById("realTimeUserCount").textContent),
    contentCount:
      Math.floor(Math.random() * 5) + Number.parseInt(document.getElementById("realTimeContentCount").textContent),
    publishedCount:
      Math.floor(Math.random() * 2) + Number.parseInt(document.getElementById("realTimePublishedCount").textContent),
    trainingCount:
      Math.floor(Math.random() * 10) + Number.parseInt(document.getElementById("realTimeTrainingCount").textContent),
  }

  // Animate counter updates
  animateCounterUpdate("realTimeUserCount", updates.userCount)
  animateCounterUpdate("realTimeContentCount", updates.contentCount)
  animateCounterUpdate("realTimePublishedCount", updates.publishedCount)
  animateCounterUpdate("realTimeTrainingCount", updates.trainingCount)

  // Update tab counts
  document.getElementById("userTabCount").textContent = updates.userCount
  document.getElementById("contentTabCount").textContent = updates.contentCount
  document.getElementById("totalUsersCount").textContent = updates.userCount
}

function animateCounterUpdate(elementId, newValue) {
  const element = document.getElementById(elementId)
  const currentValue = Number.parseInt(element.textContent)

  if (newValue !== currentValue) {
    element.classList.add("real-time-update")
    element.textContent = newValue

    setTimeout(() => {
      element.classList.remove("real-time-update")
    }, 2000)
  }
}

// System Health Monitor
function updateSystemHealth(data) {
  if (data.database) {
    document.getElementById("dbResponseTime").textContent = data.database.responseTime || "12ms"
    document.getElementById("dbConnections").textContent = data.database.connections || "45/100"
    document.getElementById("dbStorage").textContent = data.database.storage || "2.3GB used"
  }

  if (data.ai) {
    document.getElementById("aiApiCalls").textContent = data.ai.apiCalls || "1.2K/hour"
    document.getElementById("aiSuccessRate").textContent = data.ai.successRate || "99.8%"
    document.getElementById("aiQueue").textContent = data.ai.queue || "0 pending"
    document.getElementById("aiLatency").textContent = data.ai.latency || "850ms"
    document.getElementById("aiErrorRate").textContent = data.ai.errorRate || "0.2%"
  }

  if (data.server) {
    document.getElementById("cpuUsage").textContent = data.server.cpu || "23%"
    document.getElementById("memoryUsage").textContent = data.server.memory || "1.8GB/4GB"
    document.getElementById("diskUsage").textContent = data.server.disk || "45% used"
    document.getElementById("networkSpeed").textContent = data.server.network || "125 Mbps"
    document.getElementById("loadAverage").textContent = data.server.load || "0.8"
  }
}

// User Status Updates
function updateUserStatus(userId, status) {
  const statusIndicator = document.getElementById(`status-${userId}`)
  const statusText = document.getElementById(`status-text-${userId}`)

  if (statusIndicator && statusText) {
    statusIndicator.className = `status-indicator ${status}`
    statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1)

    // Add real-time update animation
    statusIndicator.parentElement.classList.add("real-time-update")
    setTimeout(() => {
      statusIndicator.parentElement.classList.remove("real-time-update")
    }, 2000)
  }
}

// Admin Panel Functions with Enhanced Hover Effects
function refreshAdminData() {
  const refreshBtn = document.querySelector('[onclick="refreshAdminData()"]')
  refreshBtn.classList.add("loading-state")

  showNotification("Refreshing admin data...", "info")
  logActivity("Admin data refresh initiated", "info")

  setTimeout(() => {
    showNotification("Admin data refreshed successfully!", "success")
    updateLastUpdated()
    updateRealTimeStats()
    logActivity("Admin data refresh completed", "success")
    refreshBtn.classList.remove("loading-state")
    refreshBtn.classList.add("success-animation")

    setTimeout(() => {
      refreshBtn.classList.remove("success-animation")
    }, 600)
  }, 2000)
}

function updateLastUpdated() {
  const now = new Date()
  document.getElementById("lastUpdated").textContent = now.toLocaleTimeString()
}

// User Management Functions with Enhanced Animations
function viewUserDetails(userId, username, email) {
  const modal = document.createElement("div")
  modal.className = "modal show"
  modal.innerHTML = `
        <div class="modal-content hover-lift" style="max-width: 800px;">
            <div class="modal-header">
                <button class="modal-close hover-lift" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
                <h2><i class="fas fa-user"></i> User Details</h2>
                <p>Complete information for ${username}</p>
            </div>
            <div class="modal-body">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div class="user-avatar xl hover-lift">${username[0].toUpperCase()}</div>
                    <h3 style="margin: 1rem 0 0.5rem 0;">${username}</h3>
                    <p style="color: var(--text-muted);">${email}</p>
                </div>
                <div class="grid grid-cols-2" style="gap: 2rem;">
                    <div class="hover-card" style="padding: 1.5rem; background: var(--bg-primary); border-radius: var(--radius-lg);">
                        <h4 style="margin-bottom: 1rem;">Account Information</h4>
                        <div class="text-container adjustable-text" style="background: white; min-height: 120px;">
<strong>User ID:</strong> ${userId}<br>
<strong>Username:</strong> ${username}<br>
<strong>Email:</strong> ${email}<br>
<strong>Status:</strong> Active<br>
<strong>Role:</strong> ${userId == 1 ? "Administrator" : "User"}<br>
<strong>Verified:</strong> Yes<br>
<strong>Last Login:</strong> Recently<br>
<strong>Account Created:</strong> 2024
                        </div>
                    </div>
                    <div class="hover-card" style="padding: 1.5rem; background: var(--bg-primary); border-radius: var(--radius-lg);">
                        <h4 style="margin-bottom: 1rem;">Activity Summary</h4>
                        <div class="text-container adjustable-text" style="background: white; min-height: 120px;">
<strong>Total Posts:</strong> 15<br>
<strong>Published:</strong> 12<br>
<strong>Drafts:</strong> 3<br>
<strong>Images Generated:</strong> 8<br>
<strong>Last Active:</strong> 2 hours ago<br>
<strong>Engagement Rate:</strong> 95%<br>
<strong>Content Quality:</strong> High
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
  document.body.appendChild(modal)
  logActivity(`Viewing details for user: ${username}`, "info")
}

function viewUserContent(userId, username) {
  const modal = document.createElement("div")
  modal.className = "modal show"
  modal.innerHTML = `
        <div class="modal-content hover-lift" style="max-width: 900px;">
            <div class="modal-header">
                <button class="modal-close hover-lift" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
                <h2><i class="fas fa-file-alt"></i> ${username}'s Content</h2>
                <p>All content created by this user</p>
            </div>
            <div class="modal-body">
                <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <i class="fas fa-file-alt" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>Loading user content...</p>
                    <div class="loading" style="margin: 1rem auto;"></div>
                </div>
            </div>
        </div>
    `
  document.body.appendChild(modal)
  logActivity(`Viewing content for user: ${username}`, "info")
}

function viewFullCredentials(userId, username, email) {
  const modal = document.createElement("div")
  modal.className = "modal show"
  modal.innerHTML = `
        <div class="modal-content hover-lift" style="max-width: 700px;">
            <div class="modal-header">
                <button class="modal-close hover-lift" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
                <h2><i class="fas fa-key"></i> Full Credentials</h2>
                <p>Complete credential information for ${username}</p>
            </div>
            <div class="modal-body">
                <div class="text-container adjustable-text" style="background: var(--bg-primary); min-height: 200px; font-family: monospace; font-size: 0.875rem;">
=== USER CREDENTIALS ===<br>
User ID: ${userId}<br>
Username: ${username}<br>
Email: ${email}<br>
Password Hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvAu.<br>
Salt: $2b$12$LQv3c1yqBWVHxkd0LHAkCO<br>
Account Type: ${userId == 1 ? "Administrator" : "Standard User"}<br>
Registration Date: 2024-01-15 10:30:45<br>
Last Password Change: 2024-01-15 10:30:45<br>
Login Attempts: 0 failed attempts<br>
Account Status: Active<br>
Security Level: Standard<br>
Two-Factor Auth: Disabled<br>
API Key: tweetai_${userId}_${Math.random().toString(36).substr(2, 16)}<br>
Session Token: sess_${Math.random().toString(36).substr(2, 32)}
                </div>
                <div style="margin-top: 1rem; padding: 1rem; background: var(--warning-gradient); color: white; border-radius: var(--radius-lg);">
                    <i class="fas fa-exclamation-triangle"></i> 
                    <strong>Security Warning:</strong> This information is highly sensitive. Handle with care.
                </div>
            </div>
        </div>
    `
  document.body.appendChild(modal)
  logActivity(`Accessed full credentials for user: ${username}`, "warning")
}

function resetUserPassword(userId, username) {
  if (confirm(`Reset password for ${username}?`)) {
    showNotification(`Password reset initiated for ${username}`, "info")
    logActivity(`Password reset for user: ${username}`, "warning")

    setTimeout(() => {
      showNotification(`Password reset email sent to ${username}`, "success")
      logActivity(`Password reset email sent to: ${username}`, "success")
    }, 2000)
  }
}

function suspendUser(userId, username) {
  if (confirm(`Are you sure you want to suspend ${username}?`)) {
    showNotification(`User ${username} has been suspended`, "warning")
    logActivity(`User suspended: ${username}`, "warning")

    // Update user status in real-time
    updateUserStatus(userId, "offline")
  }
}

function addNewUser() {
  const modal = document.createElement("div")
  modal.className = "modal show"
  modal.innerHTML = `
        <div class="modal-content hover-lift">
            <div class="modal-header">
                <button class="modal-close hover-lift" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
                <h2><i class="fas fa-user-plus"></i> Add New User</h2>
                <p>Create a new user account</p>
            </div>
            <div class="modal-body">
                <form id="addUserForm">
                    <div class="form-group">
                        <label class="form-label">Username</label>
                        <input type="text" class="form-control" name="username" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" name="email" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" class="form-control" name="password" required>
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" name="is_admin">
                            <span>Admin privileges</span>
                        </label>
                    </div>
                    <button type="submit" class="btn btn-primary hover-lift w-full">
                        <i class="fas fa-plus"></i> Create User
                    </button>
                </form>
            </div>
        </div>
    `
  document.body.appendChild(modal)
  logActivity("Add new user dialog opened", "info")
}

// Content Management Functions
function viewContentDetails(contentId, username) {
  const modal = document.createElement("div")
  modal.className = "modal show"
  modal.innerHTML = `
        <div class="modal-content hover-lift" style="max-width: 800px;">
            <div class="modal-header">
                <button class="modal-close hover-lift" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
                <h2><i class="fas fa-file-alt"></i> Content Details</h2>
                <p>Detailed information for content ID: ${contentId}</p>
            </div>
            <div class="modal-body">
                <div class="text-container adjustable-text" style="background: var(--bg-primary); min-height: 150px; font-family: monospace; font-size: 0.875rem;">
=== CONTENT DETAILS ===<br>
Content ID: ${contentId}<br>
Author: ${username}<br>
Created: 2024-01-20 14:30:15<br>
Modified: 2024-01-20 14:35:22<br>
Status: Published<br>
Views: 1,247<br>
Likes: 89<br>
Shares: 23<br>
Comments: 12<br>
Engagement Rate: 9.8%<br>
Content Type: Tweet + Image<br>
AI Model Used: GPT-4 + DALL-E<br>
Generation Time: 2.3s
                </div>
            </div>
        </div>
    `
  document.body.appendChild(modal)
  logActivity(`Viewing content details: ID ${contentId}`, "info")
}

async function deleteContent(contentId) {
  if (confirm("Are you sure you want to delete this content?")) {
    const contentElement = document.querySelector(`[data-content-id="${contentId}"]`)

    if (contentElement) {
      contentElement.classList.add("loading-state")
    }

    try {
      const response = await fetch(`/delete-content/${contentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        showNotification("Content deleted successfully!", "success")
        logActivity(`Content deleted: ID ${contentId}`, "warning")

        if (contentElement) {
          contentElement.style.transition = "all 0.3s ease"
          contentElement.style.transform = "translateX(-100%)"
          contentElement.style.opacity = "0"

          setTimeout(() => {
            contentElement.remove()
            updateRealTimeStats()
          }, 300)
        }
      } else {
        showNotification("Failed to delete content", "error")
        if (contentElement) {
          contentElement.classList.remove("loading-state")
          contentElement.classList.add("error-animation")
          setTimeout(() => {
            contentElement.classList.remove("error-animation")
          }, 600)
        }
      }
    } catch (error) {
      showNotification("Network error occurred", "error")
      if (contentElement) {
        contentElement.classList.remove("loading-state")
        contentElement.classList.add("error-animation")
        setTimeout(() => {
          contentElement.classList.remove("error-animation")
        }, 600)
      }
    }
  }
}

// System Functions with Enhanced Feedback
function backupDatabase() {
  const btn = event.target
  btn.classList.add("loading-state")

  showNotification("Starting database backup...", "info")
  logActivity("Database backup initiated", "info")

  setTimeout(() => {
    showNotification("Database backup completed successfully!", "success")
    logActivity("Database backup completed", "success")
    btn.classList.remove("loading-state")
    btn.classList.add("success-animation")

    setTimeout(() => {
      btn.classList.remove("success-animation")
    }, 600)
  }, 5000)
}

function clearCache() {
  const btn = event.target
  btn.classList.add("loading-state")

  showNotification("Clearing system cache...", "info")
  logActivity("Cache clearing initiated", "info")

  setTimeout(() => {
    showNotification("Cache cleared successfully!", "success")
    logActivity("System cache cleared", "success")
    btn.classList.remove("loading-state")
    btn.classList.add("success-animation")

    setTimeout(() => {
      btn.classList.remove("success-animation")
    }, 600)
  }, 1500)
}

function testTweetAPI() {
  const btn = event.target
  btn.classList.add("loading-state")

  showNotification("Testing Tweet API connection...", "info")
  logActivity("Tweet API connection test started", "info")

  setTimeout(() => {
    showNotification("Tweet API connection successful!", "success")
    logActivity("Tweet API connection test passed", "success")
    document.getElementById("tweetApiLastCheck").textContent = "Just now"
    document.getElementById("tweetApiResponseTime").textContent = Math.floor(Math.random() * 200 + 600) + "ms"
    document.getElementById("tweetApiSuccessRate").textContent = (99 + Math.random()).toFixed(1) + "%"

    btn.classList.remove("loading-state")
    btn.classList.add("success-animation")

    setTimeout(() => {
      btn.classList.remove("success-animation")
    }, 600)
  }, 2000)
}

function testImageAPI() {
  const btn = event.target
  btn.classList.add("loading-state")

  showNotification("Testing Image API connection...", "info")
  logActivity("Image API connection test started", "info")

  setTimeout(() => {
    showNotification("Image API connection successful!", "success")
    logActivity("Image API connection test passed", "success")
    document.getElementById("imageApiLastCheck").textContent = "Just now"
    document.getElementById("imageApiResponseTime").textContent = (1 + Math.random()).toFixed(1) + "s"
    document.getElementById("imageApiSuccessRate").textContent = (98 + Math.random() * 2).toFixed(1) + "%"

    btn.classList.remove("loading-state")
    btn.classList.add("success-animation")

    setTimeout(() => {
      btn.classList.remove("success-animation")
    }, 600)
  }, 2000)
}

// Search and Filter Functions
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Socket.IO
  initializeSocket()

  // Start real-time updates
  setInterval(updateRealTimeStats, 10000)
  setInterval(updateLastUpdated, 60000)

  // Simulate user status changes
  setInterval(() => {
    const userRows = document.querySelectorAll(".user-row")
    userRows.forEach((row) => {
      const userId = row.getAttribute("data-user-id")
      if (userId && Math.random() > 0.9) {
        // 10% chance to change status
        const statuses = ["online", "away", "offline"]
        const currentStatus = document.getElementById(`status-${userId}`).className.split(" ").pop()
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)]
        if (newStatus !== currentStatus) {
          updateUserStatus(userId, newStatus)
        }
      }
    })
  }, 5000)

  // Initialize activity log
  logActivity("Admin panel initialized", "success")
  logActivity("Real-time monitoring active", "info")
  logActivity("All systems operational", "success")
})

// Export functions for global access
window.adminPanel = {
  refreshAdminData,
  viewUserDetails,
  viewUserContent,
  resetUserPassword,
  suspendUser,
  addNewUser,
  deleteContent,
  backupDatabase,
  clearCache,
  testTweetAPI,
  testImageAPI,
}
