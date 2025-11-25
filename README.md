# 🚀 TweetAI Pro – AI Tweet & Image Generator

TweetAI Pro is a full-stack AI-powered platform for generating high-quality tweets and AI images.  
It includes a secure user system, admin panel, analytics, and full content management — all powered by Flask, Socket.IO, Google Gemini, and **local Stable Diffusion (no external image API required).**

---

## ✨ Features

### 🧠 AI Generation
- **AI Tweet Generator** using Google Gemini API
- **Local AI Image Generation** using Stable Diffusion (no API required)
- Real-time generation updates via Socket.IO
- Simultaneous tweet + image generation
- Multiple tone options (Professional, Casual, Humorous, Inspirational, etc.)

### 👤 User Features
- User registration & login with secure authentication
- Generate tweets + images simultaneously
- Personal user dashboard with stats
- View **only your own generated content** (privacy-focused)
- Download images & copy tweets to clipboard
- Profile management with security settings
- Complete activity logs and history
- Full content library with search & filters
- Publish/draft content management
- Two-factor authentication support

### 🛠️ Admin Features
- **Admin Dashboard** with live system statistics
- **User Management**: view, edit, delete, reset passwords
- **Content Moderation**: review, flag, and delete user content
- **API Health Monitoring**: track Google Gemini & Image Generation status
- **Database Management**: backups, optimization, and performance monitoring
- **System Analytics**: real-time charts and performance metrics
- **Security Audits**: comprehensive system security checks
- **Activity Logging**: full audit trail of all system actions
- **System Configuration**: manage global settings and limits

### ⚙️ Technical Highlights
- Flask backend with modular blueprint structure
- Local Stable Diffusion image generation (diffusers + torch)
- SQLite database (persistent + automatically backed-up)
- Role-based access control (user/admin)
- Real-time WebSocket alerts via Socket.IO
- Glass-morphism UI design with smooth animations
- Responsive design (Desktop, Tablet, Mobile)
- Session management with security best practices

---

## 📦 Project Structure

```
.
├── app.py                           # Main Flask application & routes
├── image.py                         # Local Stable Diffusion image generator
├── requirements.txt                 # Python dependencies
├── .env                             # Environment variables (create locally)
├── .gitignore                       # Git ignore rules
│
├── templates/                       # HTML templates (frontend)
│   ├── base.html                   # Base template with styling & navigation
│   ├── index.html                  # Landing page
│   ├── dashboard.html              # User dashboard
│   ├── user-dashboard.html         # Alternative user dashboard
│   ├── profile.html                # User profile page
│   ├── admin.html                  # Admin panel
│   └── admin-dashboard.html        # Enhanced admin dashboard
│
├── static/                          # Global static assets
│   ├── css/
│   │   └── admin-styles.css        # Admin-specific styles
│   └── js/
│       ├── admin.js                # Admin utilities & functions
│       └── user.js                 # User dashboard functions
│
├── admin/                           # Admin module (blueprints)
│   ├── templates/
│   │   └── admin-dashboard.html    # Alternative admin interface
│   └── static/
│       └── js/
│           └── admin.js            # Admin panel JavaScript
│
├── user/                            # User module (blueprints)
│   ├── templates/
│   │   └── user-dashboard.html     # User dashboard template
│   └── static/
│       └── js/
│           └── user.js             # User dashboard functionality
│
├── utils/
│   └── decorators.py               # Role-based access control decorators
│
├── scripts/                         # Utility & maintenance scripts
│   ├── init_database.py            # Database initialization script
│   └── backup_database.py          # Backup management utilities
│
├── training_data/
│   └── generated_data.json         # Training/reference data
│
├── generated_images/               # Generated AI images storage
├── backups/                        # Automated database backups
└── database.db                     # SQLite database file
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Git
- 4GB+ RAM (for image generation)
- Optional: CUDA-capable GPU for faster image generation

### Step-by-Step Installation

#### 1️⃣ Clone Repository
```bash
git clone <repository-url>
cd "Tweet and image"
```

#### 2️⃣ Create Virtual Environment
```bash
# Windows:
python -m venv venv
venv\Scripts\activate

# macOS / Linux:
python3 -m venv venv
source venv/bin/activate
```

#### 3️⃣ Install Dependencies
```bash
pip install -r requirements.txt
```

#### 4️⃣ Configure Environment Variables

Create a `.env` file in the project root:

```env
# Flask Configuration
SECRET_KEY=your-secret-key-here-change-in-production
FLASK_ENV=development
FLASK_DEBUG=True

# API Keys
GOOGLE_API_KEY=your-google-gemini-api-key
HUGGINGFACE_API_KEY=your-huggingface-token

# Database
DATABASE_URL=sqlite:///database.db

# Application Settings
SESSION_TIMEOUT=3600
MAX_USERS_PER_HOUR=200
API_RATE_LIMIT=1000
IMAGE_GENERATION_LIMIT=500
```

**How to get API Keys:**
- **Google Gemini API**: https://ai.google.dev/
- **Hugging Face**: https://huggingface.co/settings/tokens

#### 5️⃣ Initialize Database
```bash
python scripts/init_database.py
```

#### 6️⃣ Run Application
```bash
python app.py
```

Your application will be available at: **👉 http://localhost:5000**

---

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Flask secret key for sessions | `your-random-key` |
| `GOOGLE_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `HUGGINGFACE_API_KEY` | Hugging Face API token | `hf_...` |
| `DATABASE_URL` | Database connection string | `sqlite:///database.db` |
| `FLASK_DEBUG` | Debug mode (True/False) | `True` |
| `SESSION_TIMEOUT` | Session timeout in seconds | `3600` |
| `MAX_USERS_PER_HOUR` | Rate limit for user creation | `200` |

---

## 🧠 AI Model Details

### Tweet Generation
- **Service**: Google Gemini API
- **Features**:
  - Generates creative, high-quality tweet content
  - Multiple tone options available
  - Customizable length (short, medium, long)
  - Content categorization support
- **Rate Limits**: Check your API plan

### Image Generation
- **Model**: Stable Diffusion v1.5 (Local)
- **Library**: Diffusers + PyTorch
- **Features**:
  - No external API required (runs locally)
  - Auto-detects GPU/CPU
  - Generates 512×512 PNG images
  - 15-step inference for fast generation
  - Saves to `/generated_images/` directory
- **Performance**:
  - GPU (CUDA): ~5-15 seconds per image
  - CPU: ~30-60 seconds per image

---

## 📊 Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | Integer | Primary Key |
| `username` | String (unique) | Username |
| `email` | String (unique) | Email address |
| `password` | String | Hashed password |
| `is_admin` | Boolean | Admin flag |
| `created_at` | DateTime | Registration timestamp |

### Content Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | Integer | Primary Key |
| `user_id` | Integer | Foreign Key (Users) |
| `prompt` | Text | Original user prompt |
| `generated_text` | Text | Generated tweet |
| `image_path` | String | Path to generated image |
| `title` | String | Content title |
| `published` | Boolean | Publication status |
| `created_at` | DateTime | Creation timestamp |

### Activity Logs Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | Integer | Primary Key |
| `user_id` | Integer | Foreign Key (Users) |
| `action` | Text | Action description |
| `type` | String | Log type (info/warning/error) |
| `timestamp` | DateTime | Action timestamp |

---

## 🔥 User Guide

### ⭐ For Regular Users

1. **Register/Login**
   - Create account with username & email
   - Set strong password

2. **Generate Content**
   - Navigate to Dashboard
   - Enter your prompt/topic
   - Select tone and preferences
   - Click "Generate"
   - AI generates tweet + image simultaneously

3. **Manage Content**
   - View all generated content in your library
   - **Copy** tweet to clipboard
   - **Download** images
   - **Publish** or keep as **Draft**
   - **Delete** content you don't want

4. **Profile & Settings**
   - Update profile information
   - Change password
   - View activity history
   - Download your data

### ⭐ For Administrators

1. **Access Admin Panel**
   - Navigate to `http://localhost:5000/admin-panel`
   - Login with admin credentials

2. **User Management**
   - View all registered users
   - View user credentials
   - Reset user passwords
   - Delete user accounts
   - Monitor user activity

3. **Content Moderation**
   - Review all user-generated content
   - Approve/reject content
   - Delete inappropriate content
   - Flag problematic users

4. **System Monitoring**
   - View live system statistics
   - Monitor API health status
   - Check database performance
   - View system logs

5. **Backups & Maintenance**
   - Create manual database backups
   - Schedule automatic backups
   - Run security audits
   - Optimize database

---

## 🔌 API Endpoints

### 🔐 Authentication Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | User registration |
| `POST` | `/login` | User login |
| `GET` | `/logout` | User logout |

### 👤 User Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard` | User dashboard |
| `GET` | `/user-panel` | User control panel |
| `GET` | `/profile` | User profile page |
| `POST` | `/generate-tweet` | Generate tweet + image |
| `GET` | `/api/user-content` | Fetch user's content |
| `DELETE` | `/delete-content/<id>` | Delete specific content |

### 🛠️ Admin Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin-panel` | Admin dashboard |
| `GET` | `/admin-dashboard` | Enhanced admin view |
| `GET` | `/api/users` | Get all users |
| `GET` | `/api/content` | Get all content |
| `DELETE` | `/api/users/<id>` | Delete user |
| `POST` | `/api/backup-database` | Create backup |

### 📡 WebSocket Events
| Event | Emitted By | Data |
|-------|-----------|------|
| `connect` | Client | Connection established |
| `disconnect` | Client | Connection closed |
| `update_stats` | Server | Real-time statistics |
| `activity_log` | Server | New activity logged |
| `system_health` | Server | System health status |

---

## 🐛 Troubleshooting

### ❌ Image Generation is Slow

**Solution:**
- Install PyTorch with CUDA for GPU acceleration:
  ```bash
  pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
  ```
- Close heavy applications
- Reduce image resolution in settings

### ❌ Database Locked Error

**Solution:**
```bash
# Delete corrupted database
rm database.db

# Reinitialize
python scripts/init_database.py
```

### ❌ API Not Working

**Solution:**
1. Check `.env` file exists and is configured
2. Verify API keys are correct:
   - Google Gemini API: Check quota and permissions
   - Hugging Face: Verify token is valid
3. Test API connectivity:
   ```bash
   python -c "import google.generativeai as genai; print('OK')"
   ```

### ❌ Port Already in Use

**Solution:**
```bash
# Kill process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

### ❌ Module Import Errors

**Solution:**
```bash
# Reinstall dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 📈 Performance Tips

1. **GPU Acceleration**
   - Install CUDA toolkit for 3-4x faster image generation
   - Requires NVIDIA GPU

2. **Database Optimization**
   - Run `backup_database.py` regularly
   - Clear old generated images periodically
   - Index frequently searched columns

3. **API Optimization**
   - Cache frequently generated prompts
   - Implement rate limiting per user
   - Monitor API quota usage

4. **UI Performance**
   - Clear browser cache
   - Use Chrome/Firefox for best compatibility
   - Enable hardware acceleration

---

## 🔒 Security Features

- ✅ **Password Hashing**: Bcrypt with salt
- ✅ **Session Management**: Secure Flask sessions
- ✅ **CSRF Protection**: Token validation
- ✅ **SQL Injection Prevention**: ORM usage
- ✅ **XSS Protection**: HTML escaping
- ✅ **Environment Variables**: Secret management
- ✅ **Admin Decorators**: Role-based access control
- ✅ **Activity Logging**: Audit trail
- ✅ **Two-Factor Authentication**: Optional 2FA

**Best Practices:**
- Change `SECRET_KEY` in production
- Use HTTPS in production
- Keep dependencies updated
- Regular security audits
- Monitor activity logs

---

## 🚀 Deployment

### Deploying to Production

1. **Update Settings**
   ```env
   FLASK_ENV=production
   FLASK_DEBUG=False
   ```

2. **Use Production WSGI Server**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

3. **Setup Reverse Proxy** (Nginx/Apache)
4. **Enable HTTPS** (Let's Encrypt)
5. **Database Backup** (Schedule backups)
6. **Monitor Performance** (Add monitoring tools)

---

## 📝 Default Credentials

After initial setup:
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change admin password immediately after first login!

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git
   cd YOUR-REPO
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Make changes and commit**
   ```bash
   git add .
   git commit -m "Added amazing feature"
   ```

4. **Push to branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open Pull Request**
   - Describe changes clearly
   - Reference any related issues
   - Follow code style guidelines

---

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

You are free to use, modify, and distribute this software.

---

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Content scheduling
- [ ] Social media publishing integration (Twitter, LinkedIn)
- [ ] Advanced user roles and permissions
- [ ] Machine learning-based recommendations
- [ ] Mobile application
- [ ] Webhook integrations
- [ ] API for third-party integrations
- [ ] Advanced content templates

---

## 📞 Support & Contact

- 📧 **Email**: support@tweetaipro.com
- 🐛 **Issues**: Report bugs on GitHub Issues
- 💬 **Discussions**: Join community discussions
- 📚 **Documentation**: Full docs available

---

## 🙏 Acknowledgments

- Google Gemini for tweet generation API
- Hugging Face for Stable Diffusion models
- Flask community for amazing framework
- Socket.IO for real-time features

---

**Made with ❤️ by TweetAI Pro Team**

*Last Updated: November 25, 2025*
