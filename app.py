from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash, send_from_directory
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_socketio import SocketIO, emit, join_room
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import json
import os
from datetime import datetime
import uuid
from dotenv import load_dotenv
import requests
import time
import threading
from utils.decorators import admin_required
from diffusers import StableDiffusionPipeline
import torch

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

# User class for Flask-Login
class User(UserMixin):
    def __init__(self, id, username, email, is_admin=False):
        self.id = id
        self.username = username
        self.email = email
        self.is_admin = is_admin

@login_manager.user_loader
def load_user(user_id):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    user_data = cursor.fetchone()
    conn.close()
    
    if user_data:
        return User(user_data[0], user_data[1], user_data[2], user_data[4])
    return None

# Initialize database
def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_admin BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Generated content table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS generated_content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            prompt TEXT NOT NULL,
            generated_tweet TEXT NOT NULL,
            image_url TEXT,
            is_posted BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create admin user if not exists
    cursor.execute('SELECT * FROM users WHERE username = ?', ('admin',))
    if not cursor.fetchone():
        admin_hash = generate_password_hash('admin123')
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, is_admin)
            VALUES (?, ?, ?, ?)
        ''', ('admin', 'admin@example.com', admin_hash, True))
    
    conn.commit()
    conn.close()

# AI API functions
from tenacity import retry, stop_after_attempt, wait_fixed
import logging
logging.basicConfig(level=logging.ERROR, format='[%(levelname)s] %(message)s')

@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
def generate_tweet_with_ai(prompt):
    """
    Generate a short, creative tweet using the Gemini 2.0 Flash API.
    Falls back to mock tweets on failure.
    """
    api_key = os.getenv('TWEET_API_KEY')
    if not api_key:
        print("[ERROR] TWEET_API_KEY not found in environment.")
        return "❌ API key missing! Please check your environment setup."

    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    headers = {
        'Content-Type': 'application/json',
        'X-goog-api-key': api_key
    }

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": (
                            f"Write a professional, engaging tweet (max 120 characters) "
                            f"about: '{prompt}'. Use emojis, relevant hashtags, and keep it concise and catchy."
                        )
                    }
                ]
            }
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        result = response.json()

        logging.debug("Gemini API response: %s", result)

        text = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '').strip()

        if text:
            return text
        else:
            print("[WARNING] Gemini API returned empty or invalid text.")

    except Exception as e:
        logging.exception("[Gemini fallback] Error during tweet generation")
        print("[ERROR] Gemini exception:", e)

    # Fallback mock tweets
    import random
    mock_tweets = [
        f"🚀 Just discovered something amazing about {prompt}! The future is here and it's incredible. #AI #Innovation #Tech",
        f"💡 Here's a thought about {prompt}: Sometimes the best solutions come from the most unexpected places. #Inspiration #Ideas",
        f"🌟 {prompt} is changing the game! Can't wait to see where this leads us. #Future #Technology #Progress",
        f"🔥 Breaking: {prompt} just got a whole lot more interesting! Stay tuned for more updates. #News #Updates"
    ]
    return random.choice(mock_tweets)

def generate_title_from_prompt(prompt):
    """Generate a title from the user's prompt for image generation"""
    import re
    # Clean the prompt and limit to 50 characters for filename
    clean_title = re.sub(r'[^\w\s]', '', prompt)[:50].replace(' ', '_')
    if not clean_title:
        clean_title = "generated_image"
    return clean_title

def generate_local_image(prompt):
    """Generate image locally using Stable Diffusion Pipeline (from image.py logic)"""
    try:
        print(f"[DEBUG] Starting local image generation with prompt: {prompt}")
        
        # Initialize pipeline on CUDA if available, else CPU
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"[DEBUG] Using device: {device}")
        
        pipe = StableDiffusionPipeline.from_pretrained(
            "SG161222/Realistic_Vision_V5.1_noVAE",
            dtype=torch.float16 if device == "cuda" else torch.float32,
            low_cpu_mem_usage=True
        ).to(device)
        
        pipe.enable_attention_slicing()
        pipe.enable_vae_slicing()
        
        if device == "cuda":
            pipe.vae.to(dtype=torch.float32)
        
        # Generate image
        image = pipe(
            prompt,
            height=512,
            width=512,
            num_inference_steps=15,  # Faster generation
            guidance_scale=6.0
        ).images[0]
        
        # Create filename and save
        title = generate_title_from_prompt(prompt)
        filename = f"{title}_{uuid.uuid4().hex[:8]}.png"
        image_path = os.path.join("generated_images", filename)
        os.makedirs("generated_images", exist_ok=True)
        image.save(image_path)
        
        print(f"[DEBUG] Image saved to: {image_path}")
        return f"/images/{filename}"
        
    except Exception as e:
        print(f"[ERROR] Local image generation failed: {e}")
        import traceback
        traceback.print_exc()
        return None

def generate_image_with_ai(tweet_content):
    """Generate image using Hugging Face API with better error handling"""
    api_key = os.getenv("IMAGE_API_KEY")

    if not api_key:
        print("[ERROR] IMAGE_API_KEY not found in environment variables.")
        return None

    try:
        # Create a simple prompt from tweet content
        # Remove emojis and hashtags for better image generation
        import re
        clean_prompt = re.sub(r'[^\w\s]', '', tweet_content)
        clean_prompt = clean_prompt.strip()[:100]  # Limit length
        
        if not clean_prompt:
            clean_prompt = "abstract digital art"
        
        print(f"[DEBUG] Image generation prompt: {clean_prompt}")
        
        from huggingface_hub import InferenceClient

        client = InferenceClient(
            model="stabilityai/stable-diffusion-3.5-large",
            token=api_key
        )

        image = client.text_to_image(
            prompt=clean_prompt,
            guidance_scale=7.5,
            num_inference_steps=20,  # Reduced for faster generation
        )

        # Create filename and save
        filename = f"{clean_prompt[:20].replace(' ', '_')}_{uuid.uuid4().hex[:8]}.png"
        image_path = os.path.join("generated_images", filename)
        os.makedirs("generated_images", exist_ok=True)
        image.save(image_path)

        return f"/images/{filename}"
        
    except Exception as e:
        print(f"[ERROR] Image generation failed: {e}")
        import traceback
        traceback.print_exc()
        return None

@app.route("/generate-tweet", methods=["POST"])
def generate_tweet_route():
    try:
        data = request.get_json()
        prompt = data.get("prompt", "").strip()
        
        if not prompt:
            return jsonify({"success": False, "message": "Prompt is required"}), 400

        print(f"[DEBUG] Generating tweet for prompt: {prompt}")
        
        # Generate tweet text
        generated_tweet = generate_tweet_with_ai(prompt)
        print(f"[DEBUG] Generated tweet: {generated_tweet}")
        
        # Generate image (only for authenticated users)
        image_url = None
        if current_user.is_authenticated:
            try:
                print("[DEBUG] Generating local image...")
                image_url = generate_local_image(prompt)
                print(f"[DEBUG] Generated image URL: {image_url}")
            except Exception as e:
                print(f"[ERROR] Local image generation failed: {e}")
                image_url = None

        # Save to database if user is authenticated
        content_id = None
        if current_user.is_authenticated:
            try:
                conn = sqlite3.connect('database.db')
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO generated_content (user_id, prompt, generated_tweet, image_url)
                    VALUES (?, ?, ?, ?)
                ''', (current_user.id, prompt, generated_tweet, image_url))
                content_id = cursor.lastrowid
                conn.commit()
                conn.close()
                print(f"[DEBUG] Saved to database with ID: {content_id}")
                
                # Emit real-time content update
                socketio.emit('content_update', {
                    'action': 'new_content',
                    'user_id': current_user.id,
                    'username': current_user.username,
                    'content_id': content_id
                })
            except Exception as e:
                print(f"[ERROR] Database save failed: {e}")
        
        # Save training data
        try:
            save_training_data(
                current_user.id if current_user.is_authenticated else None,
                prompt, 
                generated_tweet, 
                image_url
            )
        except Exception as e:
            print(f"[ERROR] Training data save failed: {e}")

        return jsonify({
            'success': True,
            'tweet': generated_tweet,
            'image_url': image_url,
            'content_id': content_id,
            'can_post': current_user.is_authenticated
        })

    except Exception as e:
        print(f"[ERROR] Generate tweet route error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

def save_training_data(user_id, prompt, tweet, image_url):
    """Save generated data for model training"""
    training_data = {
        'user_id': user_id,
        'prompt': prompt,
        'generated_tweet': tweet,
        'image_url': image_url,
        'timestamp': datetime.now().isoformat()
    }
    
    # Ensure training_data directory exists
    os.makedirs('training_data', exist_ok=True)
    
    # Append to training data file
    try:
        with open('training_data/generated_data.json', 'r') as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = []
    
    data.append(training_data)
    
    with open('training_data/generated_data.json', 'w') as f:
        json.dump(data, f, indent=2)

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not username or not email or not password:
            return jsonify({'success': False, 'message': 'All fields are required'})
        
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute('SELECT * FROM users WHERE username = ? OR email = ?', (username, email))
        if cursor.fetchone():
            conn.close()
            return jsonify({'success': False, 'message': 'User already exists'})
        
        # Create new user
        password_hash = generate_password_hash(password)
        cursor.execute('''
            INSERT INTO users (username, email, password_hash)
            VALUES (?, ?, ?)
        ''', (username, email, password_hash))
        
        conn.commit()
        conn.close()
        
        # Emit real-time update
        socketio.emit('user_update', {'action': 'new_user', 'username': username})
        
        return jsonify({'success': True, 'message': 'Registration successful'})
    
    return render_template('auth.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        user_data = cursor.fetchone()
        conn.close()
        
        if user_data and check_password_hash(user_data[3], password):
            user = User(user_data[0], user_data[1], user_data[2], user_data[4])
            login_user(user)
            
            # Emit real-time login activity
            socketio.emit('user_activity', {
                'user_id': user.id,
                'activity': f'User {username} logged in',
                'type': 'success'
            })
            
            return jsonify({
                'success': True, 
                'message': 'Login successful',
                'is_admin': user_data[4]
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid credentials'})
    
    return render_template('auth.html')

@app.route('/logout')
@login_required
def logout():
    username = current_user.username
    logout_user()
    
    # Emit logout activity
    socketio.emit('user_activity', {
        'activity': f'User {username} logged out',
        'type': 'info'
    })
    
    return redirect(url_for('index'))

# Dashboard routes
@app.route('/dashboard')
@login_required
def dashboard():
    if current_user.is_admin:
        return redirect(url_for('admin_dashboard'))
    else:
        return redirect(url_for('user_dashboard'))

@app.route('/user-dashboard')
@app.route('/user-panel')
@login_required
def user_dashboard():
    if current_user.is_admin:
        return redirect(url_for('admin_dashboard'))
    return render_template('user-dashboard.html')

@app.route('/admin-dashboard')
@app.route('/admin-panel')
@admin_required
def admin_dashboard():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    # Get all users (excluding password hashes for security)
    cursor.execute('SELECT id, username, email, created_at FROM users')
    users = cursor.fetchall()
    
    # Get all generated content
    cursor.execute('''
        SELECT gc.id, u.username, gc.prompt, gc.generated_tweet, gc.image_url, gc.is_posted, gc.created_at
        FROM generated_content gc
        LEFT JOIN users u ON gc.user_id = u.id
        ORDER BY gc.created_at DESC
    ''')
    content = cursor.fetchall()
    
    conn.close()
    
    return render_template('admin-dashboard.html', users=users, content=content)

# Legacy routes for backward compatibility
@app.route('/admin')
@login_required
def admin():
    return redirect(url_for('admin_dashboard'))

@app.route('/profile')
@login_required
def profile():
    # Get user's generated content
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT prompt, generated_tweet, image_url, is_posted, created_at
        FROM generated_content
        WHERE user_id = ?
        ORDER BY created_at DESC
    ''', (current_user.id,))
    content = cursor.fetchall()
    conn.close()
    
    return render_template('profile.html', content=content)

# Static file serving
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

@app.route('/images/<filename>')
def serve_generated_image(filename):
    return send_from_directory("generated_images", filename)

@app.route('/generated_images/<filename>')
def serve_image(filename):
    return send_from_directory("generated_images", filename)

# API Routes

@app.route('/api/user-content', methods=['GET'])
@login_required
def get_user_content():
    """Fetch all content generated by the current user"""
    try:
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, prompt, generated_tweet, image_url, is_posted, created_at
            FROM generated_content
            WHERE user_id = ?
            ORDER BY created_at DESC
        ''', (current_user.id,))
        
        content = cursor.fetchall()
        conn.close()
        
        # Convert to list of dictionaries
        content_list = []
        for item in content:
            content_list.append({
                'id': item[0],
                'prompt': item[1],
                'tweet': item[2],
                'image_url': item[3],
                'is_posted': item[4],
                'created_at': item[5]
            })
        
        return jsonify({
            'success': True,
            'content': content_list,
            'total': len(content_list),
            'published': sum(1 for c in content_list if c['is_posted']),
            'drafts': sum(1 for c in content_list if not c['is_posted']),
            'images': sum(1 for c in content_list if c['image_url'])
        })
    
    except Exception as e:
        print(f"[ERROR] Failed to fetch user content: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/post-tweet', methods=['POST'])
@login_required
def post_tweet():
    data = request.get_json()
    content_id = data.get('content_id')
    
    if not content_id:
        return jsonify({'success': False, 'message': 'Content ID is required'})
    
    try:
        # Update database to mark as posted
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE generated_content 
            SET is_posted = TRUE 
            WHERE id = ? AND user_id = ?
        ''', (content_id, current_user.id))
        conn.commit()
        conn.close()
        
        # Emit real-time publication update
        socketio.emit('content_update', {
            'action': 'content_published',
            'user_id': current_user.id,
            'username': current_user.username,
            'content_id': content_id
        })
        
        return jsonify({'success': True, 'message': 'Tweet posted successfully!'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/delete-content/<int:content_id>', methods=['DELETE'])
@admin_required
def delete_content(content_id):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM generated_content WHERE id = ?', (content_id,))
    conn.commit()
    conn.close()
    
    # Emit real-time deletion update
    socketio.emit('content_update', {
        'action': 'content_deleted',
        'content_id': content_id,
        'admin_user': current_user.username
    })
    
    return jsonify({'success': True, 'message': 'Content deleted successfully'})

# SocketIO events for real-time updates
@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')
    emit('system_status', {'status': 'connected', 'timestamp': datetime.now().isoformat()})

@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')

@socketio.on('join_admin')
def handle_join_admin():
    if current_user.is_authenticated and current_user.is_admin:
        join_room('admin')
        emit('admin_joined', {'message': 'Connected to admin real-time updates'})

@socketio.on('join_user')
def handle_join_user(data):
    if current_user.is_authenticated:
        user_room = f'user_{current_user.id}'
        join_room(user_room)
        emit('user_joined', {'message': 'Connected to user real-time updates'})

# Periodic system health updates
def emit_system_health():
    """Emit system health updates periodically"""
    import random
    health_data = {
        'database': {
            'responseTime': f'{random.randint(8, 25)}ms',
            'connections': f'{random.randint(30, 80)}/100',
            'storage': f'{random.uniform(2.0, 3.5):.1f}GB used'
        },
        'ai': {
            'apiCalls': f'{random.uniform(1.0, 2.0):.1f}K/hour',
            'successRate': f'{random.uniform(98.5, 99.9):.1f}%',
            'queue': f'{random.randint(0, 5)} pending',
            'latency': f'{random.randint(700, 1200)}ms',
            'errorRate': f'{random.uniform(0.1, 0.5):.1f}%'
        },
        'server': {
            'cpu': f'{random.randint(15, 35)}%',
            'memory': f'{random.uniform(1.5, 2.5):.1f}GB/4GB',
            'disk': f'{random.randint(40, 60)}% used',
            'network': f'{random.randint(100, 200)} Mbps',
            'load': f'{random.uniform(0.5, 1.2):.1f}'
        }
    }
    socketio.emit('system_health_update', health_data, room='admin')

# Start background task for system health updates
def background_health_updates():
    while True:
        time.sleep(30)  # Update every 30 seconds
        emit_system_health()

if __name__ == '__main__':
    init_db()
    
    # Start background health monitoring
    health_thread = threading.Thread(target=background_health_updates, daemon=True)
    health_thread.start()
    
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
