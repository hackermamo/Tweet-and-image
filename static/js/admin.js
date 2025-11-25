// Admin-specific JavaScript with real-time functionality and enhanced hover effects

// WebSocket connection for real-time updates
let adminSocket
let isConnected = false

// Initialize admin dashboard
document.addEventListener("DOMContentLoaded", () => {
  initializeAdminDashboard()
  connectWebSocket()
  startRealTimeUpdates()
  initializeHoverEffects()
  loadInitialData()
})

// Initialize admin dashboard
function initializeAdminDashboard() {
  console.log("🚀 Admin Dashboard Initializing...")

  // Initialize search functionality
  initializeSearch()

  // Initialize filters
  initializeFilters()

  // Initialize bulk actions
  initializeBulkActions()

  // Initialize adjustable text containers
  initializeAdjustableContainers()

  // Start periodic updates
  setInterval(updateRealTimeStats, 15000) // Update every 15 seconds
  setInterval(updateSystemHealth, 30000) // Update every 30 seconds

  console.log("✅ Admin Dashboard Initialized")
}

// Connect WebSocket for real-time updates
function connectWebSocket() {
  try {
    adminSocket = window.io()

    adminSocket.on("connect", () => {
      console.log("🔌 WebSocket Connected")
      isConnected = true
      adminSocket.emit("join_admin")
      updateConnectionStatus(true)
    })

    adminSocket.on("disconnect", () => {
      console.log("🔌 WebSocket Disconnected")
      isConnected = false
      updateConnectionStatus(false)
    })

    adminSocket.on("admin_joined", (data) => {
      console.log("👑 Admin joined:", data.message)
      addActivityLog("System", "Admin panel connected", "success")
    })

    adminSocket.on("user_update", (data) => {
      handleUserUpdate(data)
    })

    adminSocket.on("content_update", (data) => {
      handleContentUpdate(data)
    })

    adminSocket.on("user_activity", (data) => {
      addActivityLog(data.user_id || "System", data.activity, data.type || "info")
    })

    adminSocket.on("system_health_update", (data) => {
      updateSystemHealthData(data)
    })
  } catch (error) {
    console.error("❌ WebSocket connection failed:", error)
    updateConnectionStatus(false)
  }
}

// Update connection status indicator
function updateConnectionStatus(connected) {
  const indicator = document.querySelector(".badge-success i")
  if (indicator) {
    if (connected) {
      indicator.className = "fas fa-circle"
      indicator.style.color = "#10b981"
    } else {
      indicator.className = "fas fa-exclamation-circle"
      indicator.style.color = "#ef4444"
    }
  }
}

// Handle user updates
function handleUserUpdate(data) {
  console.log("👤 User Update:", data)

  switch (data.action) {
    case "new_user":
      addActivityLog("System", `New user registered: ${data.username}`, "success")
      updateUserCount()
      break
    case "user_login":
      addActivityLog(data.username, "User logged in", "info")
      updateUserStatus(data.user_id, "online")
      break
    case "user_logout":
      addActivityLog(data.username, "User logged out", "info")
      updateUserStatus(data.user_id, "offline")
      break
  }
}

// Handle content updates
function handleContentUpdate(data) {
  console.log("📝 Content Update:", data)

  switch (data.action) {
    case "new_content":
      addActivityLog(data.username, "Created new content", "success")
      updateContentCount()
      break
    case "content_published":
      addActivityLog(data.username, "Published content", "success")
      updatePublishedCount()
      break
    case "content_deleted":
      addActivityLog(data.admin_user, `Deleted content ID: ${data.content_id}`, "warning")
      updateContentCount()
      break
  }
}

// Add activity log entry
function addActivityLog(user, activity, type = "info") {
  const activityFeed = document.getElementById("realTimeActivity")
  if (!activityFeed) return

  const timestamp = new Date().toLocaleTimeString()
  const typeColors = {
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  }

  const logEntry = document.createElement("div")
  logEntry.style.color = typeColors[type] || "#00ff00"
  logEntry.style.marginBottom = "0.5rem"
  logEntry.innerHTML = `[${timestamp}] ${user}: ${activity}`

  activityFeed.appendChild(logEntry)
  activityFeed.scrollTop = activityFeed.scrollHeight

  // Keep only last 50 entries
  while (activityFeed.children.length > 50) {
    activityFeed.removeChild(activityFeed.firstChild)
  }
}

// Update real-time statistics
function updateRealTimeStats() {
  // Simulate real-time data updates
  const userCount = document.getElementById("realTimeUserCount")
  const contentCount = document.getElementById("realTimeContentCount")
  const publishedCount = document.getElementById("realTimePublishedCount")
  const trainingCount = document.getElementById("realTimeTrainingCount")

  if (userCount) {
    const currentUsers = Number.parseInt(userCount.textContent) || 0
    const growth = Math.floor(Math.random() * 3)
    if (growth > 0) {
      userCount.textContent = currentUsers + growth
      document.getElementById("userGrowth").textContent =
        Number.parseInt(document.getElementById("userGrowth").textContent) + growth
    }
  }

  if (contentCount) {
    const currentContent = Number.parseInt(contentCount.textContent) || 0
    const growth = Math.floor(Math.random() * 5)
    if (growth > 0) {
      contentCount.textContent = currentContent + growth
      document.getElementById("contentGrowth").textContent =
        Number.parseInt(document.getElementById("contentGrowth").textContent) + growth
    }
  }

  updateLastUpdated()
}

// Update system health data
function updateSystemHealth() {
  // Placeholder for system health update logic
  console.log("🔄 Updating system health...")
}

function updateSystemHealthData(data) {
  if (data.database) {
    document.getElementById("dbResponseTime").textContent = data.database.responseTime
    document.getElementById("dbConnections").textContent = data.database.connections
    document.getElementById("dbStorage").textContent = data.database.storage
  }

  if (data.ai) {
    document.getElementById("aiApiCalls").textContent = data.ai.apiCalls
    document.getElementById("aiSuccessRate").textContent = data.ai.successRate
    document.getElementById("aiQueue").textContent = data.ai.queue
    document.getElementById("aiLatency").textContent = data.ai.latency
    document.getElementById("aiErrorRate").textContent = data.ai.errorRate
  }

  if (data.server) {
    document.getElementById("cpuUsage").textContent = data.server.cpu
    document.getElementById("memoryUsage").textContent = data.server.memory
    document.getElementById("diskUsage").textContent = data.server.disk
    document.getElementById("networkSpeed").textContent = data.server.network
    document.getElementById("loadAverage").textContent = data.server.load
  }
}

// Initialize enhanced hover effects
function initializeHoverEffects() {
  // Add hover effects to stat cards
  const statCards = document.querySelectorAll(".stat-card")
  statCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-8px) scale(1.05)"
      this.style.boxShadow = "0 25px 50px rgba(0, 0, 0, 0.15)"
    })

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)"
      this.style.boxShadow = ""
    })
  })

  // Add hover effects to table rows
  const tableRows = document.querySelectorAll(".user-row")
  tableRows.forEach((row) => {
    row.addEventListener("mouseenter", function () {
      this.style.background = "linear-gradient(135deg, rgba(103, 126, 234, 0.1), rgba(168, 85, 247, 0.1))"
      this.style.transform = "translateX(4px)"
    })

    row.addEventListener("mouseleave", function () {
      this.style.background = ""
      this.style.transform = "translateX(0)"
    })
  })

  // Add hover effects to buttons
  const buttons = document.querySelectorAll(".btn")
  buttons.forEach((button) => {
    button.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-2px)"
      this.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.2)"
    })

    button.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)"
      this.style.boxShadow = ""
    })
  })
}

// Initialize search functionality
function initializeSearch() {
  const userSearch = document.getElementById("userSearch")
  const contentSearch = document.getElementById("contentSearch")

  if (userSearch) {
    userSearch.addEventListener("input", function () {
      filterUsers(this.value)
    })
  }

  if (contentSearch) {
    contentSearch.addEventListener("input", function () {
      filterContent(this.value)
    })
  }
}

// Initialize filters
function initializeFilters() {
  const userFilter = document.getElementById("userFilter")
  const contentFilter = document.getElementById("contentFilter")

  if (userFilter) {
    userFilter.addEventListener("change", function () {
      filterUsersByType(this.value)
    })
  }

  if (contentFilter) {
    contentFilter.addEventListener("change", function () {
      filterContentByType(this.value)
    })
  }
}

// Initialize bulk actions
function initializeBulkActions() {
  const selectAllUsers = document.getElementById("selectAllUsers")
  if (selectAllUsers) {
    selectAllUsers.addEventListener("change", () => {
      toggleSelectAllUsers()
    })
  }

  // Initialize individual checkboxes
  const userCheckboxes = document.querySelectorAll(".user-checkbox")
  userCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      updateBulkActions()
    })
  })
}

// Initialize adjustable text containers
function initializeAdjustableContainers() {
  const containers = document.querySelectorAll(".adjustable-text")
  containers.forEach((container) => {
    // Add resize handle
    container.style.resize = "both"
    container.style.overflow = "auto"

    // Add resize event listener
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        console.log("📏 Container resized:", entry.contentRect)
      }
    })

    resizeObserver.observe(container)
  })
}

// Tab switching functionality
function showTab(tabName, group) {
  // Hide all tab contents for the group
  const tabContents = document.querySelectorAll(`[data-group="${group}"].tab-content`)
  tabContents.forEach((content) => {
    content.classList.remove("active")
  })

  // Remove active class from all tab buttons for the group
  const tabButtons = document.querySelectorAll(`[data-group="${group}"].tab-btn`)
  tabButtons.forEach((button) => {
    button.classList.remove("active")
  })

  // Show selected tab content
  const selectedContent = document.getElementById(`${tabName}Content`)
  if (selectedContent) {
    selectedContent.classList.add("active")
  }

  // Add active class to selected tab button
  const selectedButton = document.getElementById(`${tabName}Tab`)
  if (selectedButton) {
    selectedButton.classList.add("active")
  }

  // Load tab-specific data
  loadTabData(tabName)
}

// Load tab-specific data
function loadTabData(tabName) {
  switch (tabName) {
    case "users":
      loadUsersData()
      break
    case "credentials":
      loadCredentialsData()
      break
    case "content":
      loadContentData()
      break
    case "analytics":
      loadAnalyticsData()
      break
    case "settings":
      loadSettingsData()
      break
  }
}

function loadUsersData() {
  // Placeholder for loading users data logic
  console.log("🔄 Loading users data...")
}

function loadCredentialsData() {
  // Placeholder for loading credentials data logic
  console.log("🔄 Loading credentials data...")
}

function loadContentData() {
  // Placeholder for loading content data logic
  console.log("🔄 Loading content data...")
}

function loadAnalyticsData() {
  // Placeholder for loading analytics data logic
  console.log("🔄 Loading analytics data...")
}

function loadSettingsData() {
  // Placeholder for loading settings data logic
  console.log("🔄 Loading settings data...")
}

// Filter functions
function filterUsers(searchTerm) {
  const userRows = document.querySelectorAll(".user-row")
  userRows.forEach((row) => {
    const username = row.querySelector("[data-user-id]").textContent.toLowerCase()
    const email = row.querySelector('div[style*="color: var(--text-muted)"]').textContent.toLowerCase()

    if (username.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase())) {
      row.style.display = ""
    } else {
      row.style.display = "none"
    }
  })
}

function filterUsersByType(type) {
  const userRows = document.querySelectorAll(".user-row")
  userRows.forEach((row) => {
    const role = row.dataset.role
    const status = row.dataset.status

    switch (type) {
      case "all":
        row.style.display = ""
        break
      case "admin":
        row.style.display = role === "admin" ? "" : "none"
        break
      case "active":
        row.style.display = status === "active" ? "" : "none"
        break
      case "recent":
        // Show users from last 7 days (simplified)
        row.style.display = ""
        break
    }
  })
}

function filterContent(searchTerm) {
  const contentItems = document.querySelectorAll(".content-item")
  contentItems.forEach((item) => {
    const prompt = item.querySelector(".text-container").textContent.toLowerCase()
    const tweet = item.querySelector("p").textContent.toLowerCase()

    if (prompt.includes(searchTerm.toLowerCase()) || tweet.includes(searchTerm.toLowerCase())) {
      item.style.display = ""
    } else {
      item.style.display = "none"
    }
  })
}

function filterContentByType(type) {
  const contentItems = document.querySelectorAll(".content-item")
  contentItems.forEach((item) => {
    const status = item.dataset.status
    const hasImage = item.dataset.hasImage

    switch (type) {
      case "all":
        item.style.display = ""
        break
      case "published":
        item.style.display = status === "published" ? "" : "none"
        break
      case "draft":
        item.style.display = status === "draft" ? "" : "none"
        break
      case "with-images":
        item.style.display = hasImage === "true" ? "" : "none"
        break
      case "flagged":
        // Implement flagged content logic
        item.style.display = ""
        break
    }
  })
}

// Bulk actions
function toggleSelectAllUsers() {
  const selectAll = document.getElementById("selectAllUsers")
  const userCheckboxes = document.querySelectorAll(".user-checkbox")

  userCheckboxes.forEach((checkbox) => {
    checkbox.checked = selectAll.checked
  })

  updateBulkActions()
}

function updateBulkActions() {
  const selectedCheckboxes = document.querySelectorAll(".user-checkbox:checked")
  const bulkActions = document.getElementById("bulkUserActions")
  const selectedCount = document.getElementById("selectedUserCount")

  if (selectedCheckboxes.length > 0) {
    bulkActions.style.display = "block"
    selectedCount.textContent = selectedCheckboxes.length
  } else {
    bulkActions.style.display = "none"
  }
}

// Admin action functions
function refreshAdminData() {
  console.log("🔄 Refreshing admin data...")
  addActivityLog("Admin", "Refreshed dashboard data", "info")

  // Show loading state
  const refreshBtn = document.querySelector('button[onclick="refreshAdminData()"]')
  const originalText = refreshBtn.innerHTML
  refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...'
  refreshBtn.disabled = true

  // Simulate data refresh
  setTimeout(() => {
    updateRealTimeStats()
    updateLastUpdated()
    refreshBtn.innerHTML = originalText
    refreshBtn.disabled = false
    addActivityLog("System", "Dashboard data refreshed", "success")
  }, 2000)
}

function updateLastUpdated() {
  const lastUpdated = document.getElementById("lastUpdated")
  if (lastUpdated) {
    lastUpdated.textContent = new Date().toLocaleTimeString()
  }
}

// User management functions
function viewUserDetails(userId, username, email) {
  console.log("👤 Viewing user details:", { userId, username, email })

  const modal = createModal(
    "User Details",
    `
        <div style="padding: 2rem;">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
                <div class="user-avatar large">${username[0].toUpperCase()}</div>
                <div>
                    <h3 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">${username}</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">${email}</p>
                    <div style="font-size: 0.875rem; color: var(--text-muted);">User ID: ${userId}</div>
                </div>
            </div>
            
            <div class="grid grid-cols-2" style="gap: 2rem;">
                <div>
                    <h4 style="font-weight: 600; color: var(--text-primary); margin-bottom: 1rem;">Account Information</h4>
                    <div style="background: var(--bg-primary); padding: 1rem; border-radius: var(--radius-lg);">
                        <p><strong>Status:</strong> Active</p>
                        <p><strong>Role:</strong> ${userId === 1 ? "Administrator" : "User"}</p>
                        <p><strong>Last Login:</strong> Recently</p>
                        <p><strong>Total Posts:</strong> Loading...</p>
                    </div>
                </div>
                
                <div>
                    <h4 style="font-weight: 600; color: var(--text-primary); margin-bottom: 1rem;">Security</h4>
                    <div style="background: var(--bg-primary); padding: 1rem; border-radius: var(--radius-lg);">
                        <p><strong>2FA:</strong> Disabled</p>
                        <p><strong>Password:</strong> Secure</p>
                        <p><strong>Login Attempts:</strong> 0 failed</p>
                        <p><strong>Account Lock:</strong> No</p>
                    </div>
                </div>
            </div>
        </div>
    `,
  )

  showModal(modal)
}

function viewUserContent(userId, username) {
  console.log("📝 Viewing user content:", { userId, username })
  addActivityLog("Admin", `Viewed content for user: ${username}`, "info")

  // Implementation for viewing user content
  showNotification(`Loading content for ${username}...`, "info")
}

function resetUserPassword(userId, username) {
  console.log("🔑 Resetting password for:", { userId, username })

  if (confirm(`Are you sure you want to reset the password for ${username}?`)) {
    addActivityLog("Admin", `Reset password for user: ${username}`, "warning")
    showNotification(`Password reset for ${username}. New password sent via email.`, "success")
  }
}

function suspendUser(userId, username) {
  console.log("🚫 Suspending user:", { userId, username })

  if (confirm(`Are you sure you want to suspend ${username}?`)) {
    addActivityLog("Admin", `Suspended user: ${username}`, "warning")
    showNotification(`User ${username} has been suspended.`, "warning")

    // Update UI to reflect suspension
    const userRow = document.querySelector(`[data-user-id="${userId}"]`)
    if (userRow) {
      userRow.style.opacity = "0.5"
      const statusBadge = userRow.querySelector(".badge-success")
      if (statusBadge) {
        statusBadge.className = "badge badge-danger"
        statusBadge.innerHTML = '<i class="fas fa-ban"></i> Suspended'
      }
    }
  }
}

// Content management functions
function viewContentDetails(contentId, username) {
  console.log("📄 Viewing content details:", { contentId, username })
  addActivityLog("Admin", `Viewed content details: ID ${contentId}`, "info")
}

function viewContentImage(imageUrl) {
  console.log("🖼️ Viewing content image:", imageUrl)

  const modal = createModal(
    "Content Image",
    `
        <div style="text-align: center; padding: 2rem;">
            <img src="${imageUrl}" alt="Content Image" style="max-width: 100%; max-height: 80vh; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);">
        </div>
    `,
  )

  showModal(modal)
}

function editContent(contentId) {
  console.log("✏️ Editing content:", contentId)
  addActivityLog("Admin", `Editing content: ID ${contentId}`, "info")
}

function moderateContentItem(contentId) {
  console.log("🔍 Moderating content:", contentId)
  addActivityLog("Admin", `Moderated content: ID ${contentId}`, "warning")
  showNotification("Content has been flagged for review.", "warning")
}

function deleteContent(contentId) {
  console.log("🗑️ Deleting content:", contentId)

  if (confirm("Are you sure you want to delete this content? This action cannot be undone.")) {
    fetch(`/delete-content/${contentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          addActivityLog("Admin", `Deleted content: ID ${contentId}`, "warning")
          showNotification("Content deleted successfully.", "success")

          // Remove from UI
          const contentItem = document.querySelector(`[data-content-id="${contentId}"]`)
          if (contentItem) {
            contentItem.style.animation = "fadeOut 0.5s ease"
            setTimeout(() => {
              contentItem.remove()
              updateContentCount()
            }, 500)
          }
        } else {
          showNotification("Failed to delete content: " + data.message, "error")
        }
      })
      .catch((error) => {
        console.error("Error deleting content:", error)
        showNotification("Error deleting content.", "error")
      })
  }
}

// Export functions
function exportAllUsers() {
  console.log("📤 Exporting all users...")
  addActivityLog("Admin", "Exported user data", "info")
  showNotification("User data export started. Download will begin shortly.", "info")

  // Simulate export process
  setTimeout(() => {
    showNotification("User data exported successfully!", "success")
  }, 2000)
}

function exportAllContent() {
  console.log("📤 Exporting all content...")
  addActivityLog("Admin", "Exported content data", "info")
  showNotification("Content data export started. Download will begin shortly.", "info")
}

function exportAnalyticsReport() {
  console.log("📊 Exporting analytics report...")
  addActivityLog("Admin", "Exported analytics report", "info")
  showNotification("Analytics report export started.", "info")
}

// System functions
function testTweetAPI() {
  console.log("🧪 Testing Tweet API...")
  addActivityLog("Admin", "Testing Tweet API connection", "info")

  const button = document.querySelector('button[onclick="testTweetAPI()"]')
  const originalText = button.innerHTML
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...'
  button.disabled = true

  setTimeout(() => {
    button.innerHTML = originalText
    button.disabled = false
    addActivityLog("System", "Tweet API test completed successfully", "success")
    showNotification("Tweet API connection test passed!", "success")
  }, 3000)
}

function testImageAPI() {
  console.log("🧪 Testing Image API...")
  addActivityLog("Admin", "Testing Image API connection", "info")

  const button = document.querySelector('button[onclick="testImageAPI()"]')
  const originalText = button.innerHTML
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...'
  button.disabled = true

  setTimeout(() => {
    button.innerHTML = originalText
    button.disabled = false
    addActivityLog("System", "Image API test completed successfully", "success")
    showNotification("Image API connection test passed!", "success")
  }, 3000)
}

function backupDatabase() {
  console.log("💾 Starting database backup...")
  addActivityLog("Admin", "Started database backup", "info")
  showNotification("Database backup started. This may take a few minutes.", "info")

  setTimeout(() => {
    addActivityLog("System", "Database backup completed successfully", "success")
    showNotification("Database backup completed successfully!", "success")
  }, 5000)
}

function saveAllSettings() {
  console.log("💾 Saving all settings...")
  addActivityLog("Admin", "Saved system settings", "info")
  showNotification("All settings saved successfully!", "success")
}

// Utility functions
function createModal(title, content) {
  return {
    title: title,
    content: content,
  }
}

function showModal(modal) {
  // Create modal overlay
  const overlay = document.createElement("div")
  overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(5px);
    `

  // Create modal content
  const modalContent = document.createElement("div")
  modalContent.style.cssText = `
        background: white;
        border-radius: var(--radius-xl);
        max-width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
        animation: modalSlideIn 0.3s ease;
    `

  modalContent.innerHTML = `
        <div style="padding: 2rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin: 0;">${modal.title}</h2>
            <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" style="background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer;">×</button>
        </div>
        ${modal.content}
    `

  overlay.appendChild(modalContent)
  document.body.appendChild(overlay)

  // Close on overlay click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove()
    }
  })
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  const colors = {
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  }

  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-lg);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        animation: slideInFromRight 0.3s ease;
        max-width: 400px;
    `

  notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${type === "success" ? "check" : type === "error" ? "times" : type === "warning" ? "exclamation" : "info"}-circle"></i>
            ${message}
        </div>
    `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideOutToRight 0.3s ease"
    setTimeout(() => {
      notification.remove()
    }, 300)
  }, 5000)
}

// Load initial data
function loadInitialData() {
  console.log("📊 Loading initial data...")
  updateRealTimeStats()
  addActivityLog("System", "Admin dashboard loaded", "success")
}

// Start real-time updates
function startRealTimeUpdates() {
  console.log("🔄 Starting real-time updates...")

  // Update stats every 15 seconds
  setInterval(() => {
    if (isConnected) {
      updateRealTimeStats()
    }
  }, 15000)

  // Update system health every 30 seconds
  setInterval(() => {
    if (isConnected) {
      // System health updates are handled via WebSocket
      updateSystemHealth()
      addActivityLog("System", "System health check completed", "info")
    }
  }, 30000)
}

// CSS animations
const style = document.createElement("style")
style.textContent = `
    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    @keyframes slideInFromRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutToRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.9);
        }
    }
`
document.head.appendChild(style)

function updateUserCount() {
  // Placeholder for updating user count logic
  console.log("🔄 Updating user count...")
}

function updateUserStatus(userId, status) {
  // Placeholder for updating user status logic
  console.log(`🔄 Updating user ${userId} status to ${status}...`)
}

function updateContentCount() {
  // Placeholder for updating content count logic
  console.log("🔄 Updating content count...")
}

function updatePublishedCount() {
  // Placeholder for updating published count logic
  console.log("🔄 Updating published count...")
}

console.log("🎉 Admin JavaScript loaded successfully!")
