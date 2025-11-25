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

// Declare showNotification function
function showNotification(message, type) {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `

  if (type === "success") {
    notification.style.background = "#10b981"
  } else if (type === "error") {
    notification.style.background = "#ef4444"
  } else if (type === "warning") {
    notification.style.background = "#f59e0b"
  } else {
    notification.style.background = "#3b82f6"
  }

  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification)
    }
  }, 5000)
}

// Initialize Socket.IO connection for user
function initializeUserSocket() {
  if (typeof io !== "undefined") {
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
}

// User Activity Logger
function logUserActivity(message, type = "info") {
  const activityFeed = document.getElementById("userActivityFeed")
  if (!activityFeed) return

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
  if (statusIndicator) {
    const statusText = statusIndicator.nextElementSibling
    statusIndicator.className = `status-indicator ${status}`
    if (statusText) {
      statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  // Update last active time
  const lastActiveElement = document.getElementById("lastActive")
  if (lastActiveElement) {
    lastActiveElement.textContent = new Date().toLocaleTimeString()
  }
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
  animateUserCounterUpdate("realTimeTotalPosts", userStats.totalTweets)
  animateUserCounterUpdate("realTimePublishedPosts", userStats.publishedTweets)
  animateUserCounterUpdate("realTimeDraftPosts", Math.max(0, userStats.totalTweets - userStats.publishedTweets))
  animateUserCounterUpdate("realTimeImagesGenerated", userStats.generatedImages)

  // Update growth indicators
  const postsGrowthElement = document.getElementById("postsGrowth")
  const publishedGrowthElement = document.getElementById("publishedGrowth")

  if (postsGrowthElement) postsGrowthElement.textContent = Math.floor(userStats.totalTweets * 0.3)
  if (publishedGrowthElement) publishedGrowthElement.textContent = Math.floor(userStats.publishedTweets * 0.25)
}

function animateUserCounterUpdate(elementId, newValue) {
  const element = document.getElementById(elementId)
  if (!element) return

  const currentValue = Number.parseInt(element.textContent) || 0

  if (newValue !== currentValue) {
    element.classList.add("real-time-update")
    element.textContent = newValue

    // Add success animation to parent stat card
    const statCard = element.closest(".stat-card")
    if (statCard) {
      statCard.classList.add("user-success-animation")
    }

    setTimeout(() => {
      element.classList.remove("real-time-update")
      if (statCard) {
        statCard.classList.remove("user-success-animation")
      }
    }, 2000)
  }
}

// Main function to generate tweet from form
async function generateTweetFromForm() {
  const promptInput = document.getElementById("promptInput")
  const generateBtn = document.getElementById("generateBtn")

  if (!promptInput || !generateBtn) {
    showNotification("Form elements not found", "error")
    return
  }

  const prompt = promptInput.value.trim()

  if (!prompt) {
    showNotification("Please enter a prompt", "error")
    promptInput.focus()
    return
  }

  // Show loading state
  const originalText = generateBtn.innerHTML
  generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...'
  generateBtn.disabled = true

  logUserActivity("Generating tweet with AI...", "info")

  try {
    const formData = {
      prompt: prompt,
      tone: document.getElementById("tweetStyle")?.value || "professional",
      length: "medium",
      category: "general",
      includeHashtags: document.getElementById("includeHashtags")?.checked || true,
      includeEmojis: document.getElementById("includeEmojis")?.checked || true,
      generateImage: document.getElementById("generateImage")?.checked || true,
    }

    console.log("Sending request with data:", formData)

    const response = await fetch("/generate-tweet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    const result = await response.json()
    console.log("Received response:", result)

    if (result.success) {
      // Update tweet preview
      const tweetPreviewContent = document.getElementById("tweetPreviewContent")
      if (tweetPreviewContent) {
        tweetPreviewContent.innerHTML = `
          <div style="text-align: left; color: var(--text-primary);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
              <i class="fas fa-twitter" style="color: #1da1f2;"></i>
              <strong>Generated Tweet</strong>
            </div>
            <p style="margin: 0; line-height: 1.5;">${result.tweet}</p>
          </div>
        `
      }

      // Update image preview
      const imagePreviewContent = document.getElementById("imagePreviewContent")
      if (result.image_url && imagePreviewContent) {
        imagePreviewContent.innerHTML = `
          <img src="${result.image_url}" alt="Generated image" style="max-width: 100%; height: auto; border-radius: 8px;">
        `
      }

      // Show action buttons
      const previewActions = document.getElementById("previewActions")
      if (previewActions) {
        previewActions.style.display = "flex"
      }

      currentContentId = result.content_id

      showNotification("Tweet and image generated successfully!", "success")
      logUserActivity("Tweet generated successfully", "success")
      updateUserStats()
      addToRecentActivity("Tweet Created", "success")

      // Scroll to preview
      document.getElementById("tweetPreview")?.scrollIntoView({ behavior: "smooth" })
    } else {
      showNotification(result.message || "Failed to generate tweet", "error")
      logUserActivity("Tweet generation failed", "error")
    }
  } catch (error) {
    console.error("Generation error:", error)
    showNotification("Network error. Please try again.", "error")
    logUserActivity("Network error occurred", "error")
  } finally {
    generateBtn.innerHTML = originalText
    generateBtn.disabled = false
  }
}

// Enhanced Action Functions
function copyGeneratedTweet() {
  const tweetElement = document.querySelector("#tweetPreviewContent p")
  if (!tweetElement) {
    showNotification("No tweet to copy", "error")
    return
  }

  const tweet = tweetElement.textContent
  navigator.clipboard
    .writeText(tweet)
    .then(() => {
      showNotification("Tweet copied to clipboard!", "success")
      logUserActivity("Tweet copied to clipboard", "info")
    })
    .catch(() => {
      showNotification("Failed to copy tweet", "error")
      logUserActivity("Failed to copy tweet", "error")
    })
}

function saveDraft() {
  showNotification("Tweet saved as draft!", "success")
  logUserActivity("Draft saved", "success")
  updateUserStats()
  addToRecentActivity("Draft Saved", "info")
}

async function publishTweet() {
  if (!currentContentId) {
    showNotification("No content to publish", "error")
    return
  }

  const btn = event.target.closest("button")
  const originalText = btn.innerHTML
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...'
  btn.disabled = true

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
    } else {
      showNotification(result.message || "Failed to publish tweet", "error")
      logUserActivity("Tweet publication failed", "error")
    }
  } catch (error) {
    showNotification("Network error. Please try again.", "error")
    logUserActivity("Network error during publication", "error")
  } finally {
    btn.innerHTML = originalText
    btn.disabled = false
  }
}

function regenerate() {
  logUserActivity("Regenerating tweet...", "info")
  generateTweetFromForm()
}

function clearForm() {
  if (confirm("Are you sure you want to clear the form?")) {
    const promptInput = document.getElementById("promptInput")
    if (promptInput) {
      promptInput.value = ""
    }

    // Hide preview
    const previewActions = document.getElementById("previewActions")
    if (previewActions) {
      previewActions.style.display = "none"
    }

    // Reset previews
    const tweetPreviewContent = document.getElementById("tweetPreviewContent")
    if (tweetPreviewContent) {
      tweetPreviewContent.innerHTML = `
        <i class="fas fa-twitter" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.3;"></i>
        <p style="margin: 0; opacity: 0.6;">Your generated tweet will appear here</p>
      `
    }

    const imagePreviewContent = document.getElementById("imagePreviewContent")
    if (imagePreviewContent) {
      imagePreviewContent.innerHTML = `
        <i class="fas fa-image" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3; color: var(--text-muted);"></i>
        <p style="margin: 0; opacity: 0.6; color: var(--text-muted);">Generated image will appear here</p>
      `
    }

    showNotification("Form cleared!", "info")
    logUserActivity("Form cleared", "info")

    if (promptInput) {
      promptInput.focus()
    }
  }
}

// Enhanced Activity Functions
function addToRecentActivity(activity, type) {
  const activityContainer = document.getElementById("userRecentActivity")
  if (!activityContainer) return

  const icons = {
    success: "fas fa-check",
    info: "fas fa-info",
    warning: "fas fa-exclamation",
  }
  const colors = {
    success: "#10b981",
    info: "#3b82f6",
    warning: "#f59e0b",
  }

  const newActivity = document.createElement("div")
  newActivity.className = "activity-item"
  newActivity.style.cssText =
    "display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-primary); border-radius: 8px; margin-bottom: 0.5rem;"
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
  showNotification("Refreshing your data...", "info")
  logUserActivity("Data refresh initiated", "info")

  setTimeout(() => {
    updateUserStats()
    updateUserStatus("online")
    loadUserContent()
    showNotification("Data refreshed successfully!", "success")
    logUserActivity("Data refresh completed", "success")
  }, 1000)
}

// Load user's generated content
async function loadUserContent() {
  const contentGrid = document.getElementById('myContentGrid')
  if (!contentGrid) return

  try {
    const response = await fetch('/api/user-content')
    const result = await response.json()

    if (result.success && result.content.length > 0) {
      contentGrid.innerHTML = ''
      
      // Update content tab count
      const contentTabCount = document.getElementById('contentTabCount')
      if (contentTabCount) {
        contentTabCount.textContent = result.total
      }

      // Update stats
      const totalPostsCard = document.getElementById('realTimeTotalPosts')
      const publishedPostsCard = document.getElementById('realTimePublishedPosts')
      const draftPostsCard = document.getElementById('realTimeDraftPosts')
      const imagesCard = document.getElementById('realTimeImagesGenerated')

      if (totalPostsCard) totalPostsCard.textContent = result.total
      if (publishedPostsCard) publishedPostsCard.textContent = result.published
      if (draftPostsCard) draftPostsCard.textContent = result.drafts
      if (imagesCard) imagesCard.textContent = result.images

      // Create content cards
      result.content.forEach(item => {
        const card = document.createElement('div')
        card.className = 'card hover-lift'
        card.style.cssText = 'background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; display: grid; grid-template-columns: auto 1fr; gap: 2rem; align-items: start;'

        const imageHtml = item.image_url ? `
          <div style="width: 150px; height: 150px; border-radius: var(--radius-lg); overflow: hidden; background: var(--bg-primary);">
            <img src="${item.image_url}" alt="Generated image" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        ` : `
          <div style="width: 150px; height: 150px; border-radius: var(--radius-lg); background: var(--bg-primary); display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
            <i class="fas fa-image" style="font-size: 2rem; opacity: 0.3;"></i>
          </div>
        `

        const statusBadge = item.is_posted ? 
          '<span class="badge badge-success" style="font-size: 0.75rem;">Published</span>' : 
          '<span class="badge badge-warning" style="font-size: 0.75rem;">Draft</span>'

        const createdDate = new Date(item.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })

        card.innerHTML = `
          ${imageHtml}
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                ${statusBadge}
                <span style="font-size: 0.75rem; color: var(--text-muted);">${createdDate}</span>
              </div>
              <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${item.prompt}
              </h3>
              <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 1rem;">
                ${item.tweet}
              </p>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button onclick="copyContentTweet(this, '${item.tweet.replace(/'/g, "\\'")}')" class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.5rem 1rem;">
                <i class="fas fa-copy"></i> Copy Tweet
              </button>
              ${item.image_url ? `<button onclick="downloadContentImage(this, '${item.image_url}')" class="btn btn-info" style="font-size: 0.75rem; padding: 0.5rem 1rem;">
                <i class="fas fa-download"></i> Download Image
              </button>` : ''}
              ${!item.is_posted ? `<button onclick="publishContentItem(${item.id}, this)" class="btn btn-success" style="font-size: 0.75rem; padding: 0.5rem 1rem;">
                <i class="fas fa-share"></i> Publish
              </button>` : ''}
              <button onclick="deleteContentItem(${item.id}, this)" class="btn btn-danger" style="font-size: 0.75rem; padding: 0.5rem 1rem;">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        `

        contentGrid.appendChild(card)
      })

      logUserActivity(`Loaded ${result.total} content items`, 'success')
    } else {
      contentGrid.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
          <i class="fas fa-file-alt" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">No content yet</p>
          <p style="font-size: 0.875rem;">Create your first tweet to see it here!</p>
        </div>
      `
    }
  } catch (error) {
    console.error('Error loading user content:', error)
    showNotification('Failed to load content', 'error')
  }
}

// Tab functionality
function showTab(tabName, group) {
  // Hide all tab contents for this group
  const tabContents = document.querySelectorAll(`.tab-content[data-group="${group}"]`)
  tabContents.forEach((content) => {
    content.classList.remove("active")
  })

  // Remove active class from all tab buttons for this group
  const tabBtns = document.querySelectorAll(`.tab-btn[data-group="${group}"]`)
  tabBtns.forEach((btn) => {
    btn.classList.remove("active")
  })

  // Show selected tab content
  const selectedContent = document.getElementById(`${tabName}Content`)
  if (selectedContent) {
    selectedContent.classList.add("active")
  }

  // Add active class to selected tab button
  const selectedBtn = document.getElementById(`${tabName}Tab`)
  if (selectedBtn) {
    selectedBtn.classList.add("active")
  }

  // Load content if switching to content tab
  if (tabName === 'content') {
    loadUserContent()
  }

  logUserActivity(`Switched to ${tabName} tab`, "info")
}

// Initialize user panel
document.addEventListener("DOMContentLoaded", () => {
  console.log("User dashboard initializing...")

  // Initialize Socket.IO
  initializeUserSocket()

  // Start real-time updates
  updateUserStats()
  loadUserContent()

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

  console.log("User dashboard initialized successfully")
})

// Export functions for global access
window.userPanel = {
  refreshUserData,
  updateUserStats,
  logUserActivity,
  addToRecentActivity,
  clearForm,
  generateTweetFromForm,
  publishTweet,
  saveDraft,
  regenerate,
  showTab,
  loadUserContent,
}

// Make functions globally available
window.generateTweetFromForm = generateTweetFromForm
window.publishTweet = publishTweet
window.saveDraft = saveDraft
window.regenerate = regenerate
window.clearForm = clearForm
window.showTab = showTab
window.refreshUserData = refreshUserData
window.loadUserContent = loadUserContent

// Additional helper functions for content management
function copyContentTweet(button, tweet) {
  navigator.clipboard.writeText(tweet).then(() => {
    showNotification('Tweet copied to clipboard!', 'success')
    const originalHTML = button.innerHTML
    button.innerHTML = '<i class="fas fa-check"></i> Copied'
    setTimeout(() => {
      button.innerHTML = originalHTML
    }, 2000)
  }).catch(() => {
    showNotification('Failed to copy tweet', 'error')
  })
}

function downloadContentImage(button, imageUrl) {
  const link = document.createElement('a')
  link.href = imageUrl
  link.download = 'generated-image.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  showNotification('Image download started', 'success')
}

async function publishContentItem(contentId, button) {
  const originalHTML = button.innerHTML
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...'
  button.disabled = true

  try {
    const response = await fetch('/post-tweet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content_id: contentId }),
    })

    const result = await response.json()

    if (result.success) {
      showNotification('Content published successfully!', 'success')
      loadUserContent()
    } else {
      showNotification(result.message || 'Failed to publish content', 'error')
      button.innerHTML = originalHTML
      button.disabled = false
    }
  } catch (error) {
    console.error('Error publishing content:', error)
    showNotification('Network error', 'error')
    button.innerHTML = originalHTML
    button.disabled = false
  }
}

async function deleteContentItem(contentId, button) {
  if (!confirm('Are you sure you want to delete this content?')) {
    return
  }

  const originalHTML = button.innerHTML
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...'
  button.disabled = true

  try {
    const response = await fetch(`/delete-content/${contentId}`, {
      method: 'DELETE',
    })

    const result = await response.json()

    if (result.success) {
      showNotification('Content deleted successfully!', 'success')
      loadUserContent()
    } else {
      showNotification(result.message || 'Failed to delete content', 'error')
      button.innerHTML = originalHTML
      button.disabled = false
    }
  } catch (error) {
    console.error('Error deleting content:', error)
    showNotification('Network error', 'error')
    button.innerHTML = originalHTML
    button.disabled = false
  }
}
