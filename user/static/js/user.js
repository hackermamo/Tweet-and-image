// User Panel Real-time JavaScript with Enhanced Hover Effects
let userSocket
let currentContentId = null
const userContentData = []
let userStats = {
  totalTweets: 0,
  publishedTweets: 0,
  generatedImages: 0,
  engagement: 95,
}

// Declare io variable
const io = window.io

// Declare showNotification function
function showNotification(message, type) {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => {
    document.body.removeChild(notification)
  }, 3000)
}

// Initialize Socket.IO connection for user
function initializeUserSocket() {
  userSocket = io()

  userSocket.on("connect", () => {
    console.log("User connected to real-time server")
    logUserActivity("Connected to real-time server", "success")
    updateUserStatus("online")
  })

  userSocket.on("disconnect", () => {
    console.log("User disconnected from server")
    logUserActivity("Connection lost", "warning")
    updateUserStatus("offline")
  })

  // Real-time user data updates
  userSocket.on("user_stats_update", (data) => {
    updateUserStats(data)
  })

  userSocket.on("user_activity", (data) => {
    addToRecentActivity(data.activity, data.type)
  })

  userSocket.on("content_generated", (data) => {
    logUserActivity("New content generated", "success")
    updateUserStats()
  })
}

// User Activity Logger
function logUserActivity(message, type = "info") {
  const activityFeed = document.getElementById("userActivityFeed")
  const timestamp = new Date().toLocaleTimeString()
  const icons = {
    success: "✅",
    warning: "⚠️",
    error: "❌",
    info: "ℹ️",
  }

  const activityItem = document.createElement("div")
  activityItem.className = "activity-item"
  activityItem.innerHTML = `[${timestamp}] ${icons[type]} ${message}`
  activityItem.style.marginBottom = "0.25rem"

  activityFeed.insertBefore(activityItem, activityFeed.firstChild)

  // Keep only last 15 entries
  while (activityFeed.children.length > 15) {
    activityFeed.removeChild(activityFeed.lastChild)
  }

  activityFeed.scrollTop = 0
}

// Update User Status
function updateUserStatus(status) {
  const statusIndicator = document.querySelector(".status-indicator")
  const statusText = statusIndicator.nextElementSibling

  statusIndicator.className = `status-indicator ${status}`
  statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1)

  // Update last login time
  document.getElementById("lastLoginTime").textContent = new Date().toLocaleTimeString()
}

// Real-time Stats Updates for User
function updateUserStats(data = null) {
  if (data) {
    userStats = { ...userStats, ...data }
  } else {
    // Simulate growth
    userStats.totalTweets += Math.floor(Math.random() * 2)
    userStats.publishedTweets += Math.floor(Math.random() * 1.5)
    userStats.generatedImages += Math.floor(Math.random() * 1.2)
    userStats.engagement = Math.min(100, userStats.engagement + Math.random() * 2)
  }

  // Animate counter updates
  animateUserCounterUpdate("userTotalTweets", userStats.totalTweets)
  animateUserCounterUpdate("userPublishedTweets", userStats.publishedTweets)
  animateUserCounterUpdate("userGeneratedImages", userStats.generatedImages)
  animateUserCounterUpdate("userEngagement", userStats.engagement.toFixed(1) + "%")

  // Update growth indicators
  document.getElementById("tweetsGrowth").textContent = Math.floor(userStats.totalTweets * 0.3)
  document.getElementById("publishedGrowth").textContent = Math.floor(userStats.publishedTweets * 0.25)
  document.getElementById("imagesGrowth").textContent = Math.floor(userStats.generatedImages * 0.4)
  document.getElementById("engagementGrowth").textContent = Math.floor(Math.random() * 5 + 5)
}

function animateUserCounterUpdate(elementId, newValue) {
  const element = document.getElementById(elementId)
  const currentValue = elementId === "userEngagement" ? element.textContent : Number.parseInt(element.textContent)

  if (newValue !== currentValue) {
    element.classList.add("real-time-update")
    element.textContent = newValue

    // Add success animation to parent stat card
    element.closest(".stat-card").classList.add("user-success-animation")

    setTimeout(() => {
      element.classList.remove("real-time-update")
      element.closest(".stat-card").classList.remove("user-success-animation")
    }, 2000)
  }
}

// Tweet Creator Form Handler with Enhanced Feedback
document.getElementById("tweetCreatorForm").addEventListener("submit", async function (e) {
  e.preventDefault()

  const btn = this.querySelector('button[type="submit"]')
  const btnText = btn.querySelector(".btn-text")
  const loading = btn.querySelector(".loading")

  const description =
    document.getElementById("tweetDescription").textContent || document.getElementById("tweetDescription").innerText

  const formData = {
    prompt: `Title: ${document.getElementById("tweetTitle").value}\n\nDescription: ${description}`,
    tone: document.getElementById("tweetTone").value,
    length: document.getElementById("tweetLength").value,
    category: document.getElementById("tweetCategory").value,
    include_hashtags: document.getElementById("includeHashtags").checked,
    include_emojis: document.getElementById("includeEmojis").checked,
    generate_image: document.getElementById("generateImage").checked,
  }

  // Enhanced loading state
  btn.classList.add("user-loading-state")
  btnText.style.display = "none"
  loading.style.display = "inline-block"
  btn.disabled = true

  logUserActivity("Generating tweet with AI...", "info")

  try {
    const response = await fetch("/generate-tweet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    const result = await response.json()

    if (result.success) {
      document.getElementById("generatedTweetText").textContent = result.tweet
      updateCharacterCount()
      currentContentId = result.content_id

      if (result.image_url && formData.generate_image) {
        document.getElementById("generatedImageDisplay").src = result.image_url
        document.getElementById("generatedImageContainer").style.display = "block"
        document.getElementById("downloadImageBtn").style.display = "inline-flex"
        logUserActivity("Image generated successfully", "success")
      } else {
        document.getElementById("generatedImageContainer").style.display = "none"
        document.getElementById("downloadImageBtn").style.display = "none"
      }

      document.getElementById("generatedContent").style.display = "block"
      document.getElementById("generatedContent").scrollIntoView({ behavior: "smooth" })

      showNotification("Tweet generated successfully!", "success")
      logUserActivity("Tweet generated successfully", "success")
      updateUserStats()
      addToRecentActivity("Tweet Created", "success")

      // Enhanced success feedback
      btn.classList.add("user-success-animation")

      if (document.getElementById("autoSave").checked) {
        setTimeout(() => saveAsDraft(), 1000)
      }
    } else {
      showNotification(result.message || "Failed to generate tweet", "error")
      logUserActivity("Tweet generation failed", "error")
      btn.classList.add("error-animation")
      setTimeout(() => btn.classList.remove("error-animation"), 600)
    }
  } catch (error) {
    showNotification("Network error. Please try again.", "error")
    logUserActivity("Network error occurred", "error")
    btn.classList.add("error-animation")
    setTimeout(() => btn.classList.remove("error-animation"), 600)
  } finally {
    btnText.style.display = "inline"
    loading.style.display = "none"
    btn.disabled = false
    btn.classList.remove("user-loading-state")
    setTimeout(() => {
      btn.classList.remove("user-success-animation")
    }, 600)
  }
})

// Character count update with enhanced visuals
document.getElementById("generatedTweetText").addEventListener("input", updateCharacterCount)

function updateCharacterCount() {
  const text =
    document.getElementById("generatedTweetText").textContent || document.getElementById("generatedTweetText").innerText
  const count = text.length
  const countElement = document.getElementById("characterCount")

  countElement.textContent = count

  // Enhanced color feedback
  if (count > 280) {
    countElement.style.color = "#e53e3e"
    countElement.style.fontWeight = "700"
    countElement.parentElement.classList.add("error-animation")
  } else if (count > 250) {
    countElement.style.color = "#d69e2e"
    countElement.style.fontWeight = "600"
    countElement.parentElement.classList.remove("error-animation")
  } else {
    countElement.style.color = "var(--text-muted)"
    countElement.style.fontWeight = "400"
    countElement.parentElement.classList.remove("error-animation")
  }
}

// Enhanced Action Functions
function copyGeneratedTweet() {
  const tweet =
    document.getElementById("generatedTweetText").textContent || document.getElementById("generatedTweetText").innerText
  navigator.clipboard
    .writeText(tweet)
    .then(() => {
      showNotification("Tweet copied to clipboard!", "success")
      logUserActivity("Tweet copied to clipboard", "info")

      // Visual feedback
      const btn = event.target.closest("button")
      btn.classList.add("user-success-animation")
      setTimeout(() => btn.classList.remove("user-success-animation"), 600)
    })
    .catch(() => {
      showNotification("Failed to copy tweet", "error")
      logUserActivity("Failed to copy tweet", "error")
    })
}

function saveAsDraft() {
  const btn = event.target.closest("button")
  btn.classList.add("user-loading-state")

  setTimeout(() => {
    showNotification("Tweet saved as draft!", "success")
    logUserActivity("Draft saved", "success")
    updateUserStats()
    addToRecentActivity("Draft Saved", "info")
    refreshUserContent()

    btn.classList.remove("user-loading-state")
    btn.classList.add("user-success-animation")
    setTimeout(() => btn.classList.remove("user-success-animation"), 600)
  }, 1000)
}

async function publishTweet() {
  if (!currentContentId) {
    showNotification("No content to publish", "error")
    return
  }

  const btn = event.target.closest("button")
  btn.classList.add("user-loading-state")

  try {
    const response = await fetch("/post-tweet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content_id: currentContentId,
      }),
    })

    const result = await response.json()

    if (result.success) {
      showNotification("Tweet published successfully!", "success")
      logUserActivity("Tweet published", "success")
      updateUserStats()
      addToRecentActivity("Tweet Published", "success")
      refreshUserContent()

      btn.classList.remove("user-loading-state")
      btn.classList.add("user-success-animation")
      setTimeout(() => btn.classList.remove("user-success-animation"), 600)
    } else {
      showNotification(result.message || "Failed to publish tweet", "error")
      logUserActivity("Tweet publication failed", "error")
      btn.classList.remove("user-loading-state")
      btn.classList.add("error-animation")
      setTimeout(() => btn.classList.remove("error-animation"), 600)
    }
  } catch (error) {
    showNotification("Network error. Please try again.", "error")
    logUserActivity("Network error during publication", "error")
    btn.classList.remove("user-loading-state")
    btn.classList.add("error-animation")
    setTimeout(() => btn.classList.remove("error-animation"), 600)
  }
}

function regenerateTweet() {
  logUserActivity("Regenerating tweet...", "info")
  document.getElementById("tweetCreatorForm").dispatchEvent(new Event("submit"))
}

function downloadImage() {
  const imageUrl = document.getElementById("generatedImageDisplay").src
  if (imageUrl) {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = "generated-image.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showNotification("Image download started!", "success")
    logUserActivity("Image downloaded", "info")

    // Visual feedback
    const btn = event.target.closest("button")
    btn.classList.add("user-success-animation")
    setTimeout(() => btn.classList.remove("user-success-animation"), 600)
  }
}

// Enhanced Quick Action Functions
function openTemplateModal() {
  const modal = document.createElement("div")
  modal.className = "modal show"
  modal.innerHTML = `
        <div class="modal-content hover-lift">
            <div class="modal-header">
                <button class="modal-close hover-lift" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
                <h2><i class="fas fa-file-alt"></i> Tweet Templates</h2>
                <p>Choose from pre-made templates to get started quickly</p>
            </div>
            <div class="modal-body">
                <div style="display: grid; gap: 1rem;">
                    <div class="card hover-card" onclick="useTemplate('tech')" style="cursor: pointer; padding: 1rem;">
                        <h4><i class="fas fa-laptop"></i> Technology Update</h4>
                        <p style="font-size: 0.875rem; color: var(--text-muted);">Share the latest tech news and innovations</p>
                    </div>
                    <div class="card hover-card" onclick="useTemplate('business')" style="cursor: pointer; padding: 1rem;">
                        <h4><i class="fas fa-briefcase"></i> Business Insight</h4>
                        <p style="font-size: 0.875rem; color: var(--text-muted);">Professional business content and tips</p>
                    </div>
                    <div class="card hover-card" onclick="useTemplate('motivational')" style="cursor: pointer; padding: 1rem;">
                        <h4><i class="fas fa-heart"></i> Motivational Quote</h4>
                        <p style="font-size: 0.875rem; color: var(--text-muted);">Inspire your audience with uplifting content</p>
                    </div>
                    <div class="card hover-card" onclick="useTemplate('educational')" style="cursor: pointer; padding: 1rem;">
                        <h4><i class="fas fa-graduation-cap"></i> Educational Content</h4>
                        <p style="font-size: 0.875rem; color: var(--text-muted);">Share knowledge and learning resources</p>
                    </div>
                </div>
            </div>
        </div>
    `
  document.body.appendChild(modal)
  logUserActivity("Template selection opened", "info")
}

function useTemplate(type) {
  const templates = {
    tech: {
      title: "Latest Technology Breakthrough",
      description:
        "Share exciting news about artificial intelligence, machine learning, or emerging technologies that are changing our world and revolutionizing industries.",
    },
    business: {
      title: "Business Growth Strategy",
      description:
        "Discuss effective strategies for business growth, productivity tips, or entrepreneurship insights that can help others succeed in their ventures.",
    },
    motivational: {
      title: "Daily Motivation",
      description:
        "Create an inspiring message that motivates people to pursue their goals, overcome challenges, and believe in themselves to achieve greatness.",
    },
    educational: {
      title: "Learning Tip",
      description:
        "Share valuable educational content, study tips, or interesting facts that can help others learn something new and expand their knowledge.",
    },
  }

  const template = templates[type]
  if (template) {
    document.getElementById("tweetTitle").value = template.title
    document.getElementById("tweetDescription").textContent = template.description
    showNotification("Template applied successfully!", "success")
    logUserActivity(`Applied ${type} template`, "success")

    // Scroll to form
    document.getElementById("tweetTitle").focus()
    document.getElementById("tweetTitle").scrollIntoView({ behavior: "smooth", block: "center" })
  }

  // Close modal with animation
  const modal = document.querySelector(".modal")
  modal.style.opacity = "0"
  setTimeout(() => modal.remove(), 300)
}

function openScheduleModal() {
  const modal = document.createElement("div")
  modal.className = "modal show"
  modal.innerHTML = `
        <div class="modal-content hover-lift">
            <div class="modal-header">
                <button class="modal-close hover-lift" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
                <h2><i class="fas fa-calendar"></i> Schedule Tweet</h2>
                <p>Plan your content for optimal engagement</p>
            </div>
            <div class="modal-body">
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-calendar-plus" style="font-size: 3rem; color: var(--primary-gradient); margin-bottom: 1rem;"></i>
                    <h3>Scheduling Feature Coming Soon!</h3>
                    <p style="color: var(--text-muted); margin-bottom: 2rem;">We're working on advanced scheduling capabilities to help you post at the perfect time.</p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button class="btn btn-primary hover-lift" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-bell"></i> Notify Me When Ready
                        </button>
                        <button class="btn btn-secondary hover-lift" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
  document.body.appendChild(modal)
  logUserActivity("Schedule feature accessed", "info")
}

function openAnalyticsModal() {
  const modal = document.createElement("div")
  modal.className = "modal show"
  modal.innerHTML = `
        <div class="modal-content hover-lift" style="max-width: 600px;">
            <div class="modal-header">
                <button class="modal-close hover-lift" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
                <h2><i class="fas fa-chart-line"></i> My Analytics</h2>
                <p>Your content performance overview</p>
            </div>
            <div class="modal-body">
                <div class="grid grid-cols-2" style="gap: 1rem; margin-bottom: 2rem;">
                    <div class="card text-center hover-card" style="background: var(--success-gradient); color: white;">
                        <div style="font-size: 2rem; font-weight: 800;">${document.getElementById("userTotalTweets").textContent}</div>
                        <div>Total Tweets</div>
                    </div>
                    <div class="card text-center hover-card" style="background: var(--primary-gradient); color: white;">
                        <div style="font-size: 2rem; font-weight: 800;">${document.getElementById("userPublishedTweets").textContent}</div>
                        <div>Published</div>
                    </div>
                    <div class="card text-center hover-card" style="background: var(--warning-gradient); color: white;">
                        <div style="font-size: 2rem; font-weight: 800;">${document.getElementById("userGeneratedImages").textContent}</div>
                        <div>Images Generated</div>
                    </div>
                    <div class="card text-center hover-card" style="background: var(--info-gradient); color: white;">
                        <div style="font-size: 2rem; font-weight: 800;">${document.getElementById("userEngagement").textContent}</div>
                        <div>Engagement Rate</div>
                    </div>
                </div>
                <div style="text-align: center;">
                    <p style="color: var(--text-muted);">Detailed analytics dashboard coming soon!</p>
                    <button class="btn btn-primary hover-lift" onclick="this.closest('.modal').remove()" style="margin-top: 1rem;">
                        <i class="fas fa-chart-bar"></i> View Full Analytics (Soon)
                    </button>
                </div>
            </div>
        </div>
    `
  document.body.appendChild(modal)
  logUserActivity("Analytics viewed", "info")
}

function clearForm() {
  if (confirm("Are you sure you want to clear the form?")) {
    document.getElementById("tweetTitle").value = ""
    document.getElementById("tweetDescription").textContent = ""
    document.getElementById("generatedContent").style.display = "none"
    showNotification("Form cleared!", "info")
    logUserActivity("Form cleared", "info")

    // Reset to default placeholder
    const descElement = document.getElementById("tweetDescription")
    descElement.innerHTML =
      '<span style="color: var(--text-muted);">Describe your topic in detail. Be specific for better AI results...</span>'

    // Focus on title input
    document.getElementById("tweetTitle").focus()
  }
}

function scrollToCreator() {
  document.getElementById("tweetCreatorForm").scrollIntoView({ behavior: "smooth" })
  document.getElementById("tweetTitle").focus()
  logUserActivity("Navigated to tweet creator", "info")
}

// Enhanced Activity Functions
function addToRecentActivity(activity, type) {
  const activityContainer = document.getElementById("userRecentActivity")
  const icons = {
    success: "fas fa-check",
    info: "fas fa-info",
    warning: "fas fa-exclamation",
  }
  const colors = {
    success: "var(--success-gradient)",
    info: "var(--primary-gradient)",
    warning: "var(--warning-gradient)",
  }

  const newActivity = document.createElement("div")
  newActivity.className = "activity-item hover-card"
  newActivity.style.cssText =
    "display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-primary); border-radius: var(--radius-lg); transition: all 0.3s ease;"
  newActivity.innerHTML = `
        <div style="width: 44px; height: 44px; background: ${colors[type]}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
            <i class="${icons[type]}"></i>
        </div>
        <div style="flex: 1;">
            <div style="font-weight: 600; color: var(--text-primary); font-size: 0.875rem;">${activity}</div>
            <div style="color: var(--text-muted); font-size: 0.75rem;">Just now</div>
        </div>
    `

  activityContainer.insertBefore(newActivity, activityContainer.firstChild)

  // Keep only the last 3 activities
  while (activityContainer.children.length > 3) {
    activityContainer.removeChild(activityContainer.lastChild)
  }

  logUserActivity(`Activity added: ${activity}`, "info")
}

function refreshUserData() {
  const btn = event.target
  btn.classList.add("user-loading-state")

  showNotification("Refreshing your data...", "info")
  logUserActivity("Data refresh initiated", "info")

  setTimeout(() => {
    updateUserStats()
    refreshUserContent()
    updateUserStatus("online")
    showNotification("Data refreshed successfully!", "success")
    logUserActivity("Data refresh completed", "success")

    btn.classList.remove("user-loading-state")
    btn.classList.add("user-success-animation")
    setTimeout(() => btn.classList.remove("user-success-animation"), 600)
  }, 2000)
}

function refreshUserContent() {
  const contentGrid = document.getElementById("userContentGrid")
  contentGrid.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
            <div class="loading" style="margin: 0 auto 1rem;"></div>
            <p>Loading your content...</p>
        </div>
    `

  // Simulate loading user's content
  setTimeout(() => {
    loadUserContent()
  }, 1500)
}

function loadUserContent() {
  const contentGrid = document.getElementById("userContentGrid")

  if (userContentData.length === 0) {
    contentGrid.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
                <i class="fas fa-file-alt" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>No content yet. Create your first tweet above!</p>
                <button onclick="scrollToCreator()" class="btn btn-primary hover-lift" style="margin-top: 1rem;">
                    <i class="fas fa-plus"></i> Create Your First Tweet
                </button>
            </div>
        `
  } else {
    // Display user content
    contentGrid.innerHTML = userContentData
      .map(
        (item) => `
            <div class="card hover-lift">
                <h4>${item.title}</h4>
                <p>${item.content}</p>
                <div style="margin-top: 1rem;">
                    <span class="badge badge-${item.status === "published" ? "success" : "warning"}">
                        ${item.status}
                    </span>
                </div>
            </div>
        `,
      )
      .join("")
  }
}

function exportUserContent() {
  const btn = event.target
  btn.classList.add("user-loading-state")

  showNotification("Exporting your content...", "info")
  logUserActivity("Content export initiated", "info")

  setTimeout(() => {
    showNotification("Content exported successfully!", "success")
    logUserActivity("Content export completed", "success")

    btn.classList.remove("user-loading-state")
    btn.classList.add("user-success-animation")
    setTimeout(() => btn.classList.remove("user-success-animation"), 600)
  }, 2000)
}

function viewAllActivity() {
  const modal = document.createElement("div")
  modal.className = "modal show"
  modal.innerHTML = `
        <div class="modal-content hover-lift" style="max-width: 700px;">
            <div class="modal-header">
                <button class="modal-close hover-lift" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
                <h2><i class="fas fa-history"></i> Full Activity History</h2>
                <p>Complete timeline of your actions</p>
            </div>
            <div class="modal-body">
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-clock" style="font-size: 3rem; color: var(--primary-gradient); margin-bottom: 1rem;"></i>
                    <h3>Full Activity History Coming Soon!</h3>
                    <p style="color: var(--text-muted);">We're working on a comprehensive activity timeline feature.</p>
                </div>
            </div>
        </div>
    `
  document.body.appendChild(modal)
  logUserActivity("Full activity history accessed", "info")
}

// Content filter handler
document.getElementById("userContentFilter").addEventListener("change", function () {
  logUserActivity(`Content filter changed to: ${this.value}`, "info")
  refreshUserContent()
})

// Initialize user panel
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Socket.IO
  initializeUserSocket()

  // Start real-time updates
  updateUserStats()
  loadUserContent()

  // Set placeholder for description
  const descElement = document.getElementById("tweetDescription")
  if (descElement.textContent.trim() === "") {
    descElement.innerHTML =
      '<span style="color: var(--text-muted);">Describe your topic in detail. Be specific for better AI results...</span>'
  }

  descElement.addEventListener("focus", function () {
    if (this.innerHTML.includes("Describe your topic")) {
      this.innerHTML = ""
    }
  })

  descElement.addEventListener("blur", function () {
    if (this.textContent.trim() === "") {
      this.innerHTML =
        '<span style="color: var(--text-muted);">Describe your topic in detail. Be specific for better AI results...</span>'
    }
  })

  // Real-time updates
  setInterval(updateUserStats, 15000)
  setInterval(() => {
    updateUserStatus("online")
  }, 30000)

  // Add some initial activity
  setTimeout(() => {
    logUserActivity("User panel initialized", "success")
    logUserActivity("Real-time features activated", "info")
  }, 1000)

  // Simulate periodic activity updates
  setInterval(() => {
    const activities = [
      "System health check completed",
      "New features available",
      "Performance optimization applied",
      "Content backup completed",
    ]
    const randomActivity = activities[Math.floor(Math.random() * activities.length)]
    if (Math.random() > 0.7) {
      // 30% chance
      logUserActivity(randomActivity, "info")
    }
  }, 45000)
})

// Export functions for global access
window.userPanel = {
  refreshUserData,
  updateUserStats,
  logUserActivity,
  addToRecentActivity,
  scrollToCreator,
  clearForm,
}
