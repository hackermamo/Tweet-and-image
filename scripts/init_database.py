#!/usr/bin/env python3
"""
Database initialization script for AI Tweet Generator
Run this script to set up the database with sample data
"""

import sqlite3
import os
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import json
import random

def create_database():
    """Create database tables and initial data"""
    
    # Remove existing database
    if os.path.exists('database.db'):
        os.remove('database.db')
        print("Removed existing database")
    
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_admin BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create generated_content table
    cursor.execute('''
        CREATE TABLE generated_content (
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
    
    print("Created database tables")
    
    # Create admin user
    admin_hash = generate_password_hash('admin123')
    cursor.execute('''
        INSERT INTO users (username, email, password_hash, is_admin)
        VALUES (?, ?, ?, ?)
    ''', ('admin', 'admin@example.com', admin_hash, True))
    
    # Create sample users
    sample_users = [
        ('john_doe', 'john@example.com', 'password123'),
        ('jane_smith', 'jane@example.com', 'password123'),
        ('ai_enthusiast', 'ai@example.com', 'password123'),
        ('tech_blogger', 'blogger@example.com', 'password123'),
    ]
    
    for username, email, password in sample_users:
        password_hash = generate_password_hash(password)
        cursor.execute('''
            INSERT INTO users (username, email, password_hash)
            VALUES (?, ?, ?)
        ''', (username, email, password_hash))
    
    print(f"Created {len(sample_users) + 1} users (including admin)")
    
    # Create sample generated content
    sample_prompts = [
        "artificial intelligence in healthcare",
        "sustainable technology solutions",
        "future of remote work",
        "blockchain and cryptocurrency",
        "machine learning applications",
        "climate change technology",
        "space exploration updates",
        "cybersecurity best practices",
        "renewable energy innovations",
        "social media trends"
    ]
    
    sample_tweets = [
        "🚀 The future of AI in healthcare is here! From diagnostic tools to personalized treatment plans, we're witnessing a revolution that will save countless lives. #AI #Healthcare #Innovation",
        "🌱 Sustainable tech isn't just a trend—it's our responsibility. Every green innovation brings us closer to a healthier planet. #Sustainability #GreenTech #ClimateAction",
        "💼 Remote work has transformed how we think about productivity and work-life balance. The future workplace is flexible, inclusive, and borderless. #RemoteWork #FutureOfWork",
        "⛓️ Blockchain technology is reshaping industries beyond cryptocurrency. From supply chain transparency to digital identity, the possibilities are endless. #Blockchain #Innovation",
        "🤖 Machine learning is no longer science fiction—it's powering everything from recommendation systems to autonomous vehicles. The AI revolution is here! #MachineLearning #AI",
        "🌍 Climate tech innovations are our best hope for a sustainable future. From carbon capture to renewable energy storage, innovation is leading the way. #ClimateChange #Innovation",
        "🚀 Space exploration continues to push the boundaries of human knowledge. Every mission brings us closer to understanding our place in the universe. #Space #Exploration",
        "🔒 In our digital age, cybersecurity isn't optional—it's essential. Protecting our data and privacy requires constant vigilance and innovation. #Cybersecurity #Privacy",
        "⚡ Renewable energy is becoming more efficient and affordable every day. Solar, wind, and battery technologies are transforming our energy landscape. #RenewableEnergy #CleanTech",
        "📱 Social media trends come and go, but authentic connection and meaningful content always win. Focus on value, not vanity metrics. #SocialMedia #ContentStrategy"
    ]
    
    # Generate sample content for users
    for i, (prompt, tweet) in enumerate(zip(sample_prompts, sample_tweets)):
        user_id = (i % 4) + 2  # Assign to sample users (not admin)
        is_posted = random.choice([True, False])
        image_url = f"/placeholder.svg?height=400&width=600" if random.choice([True, False]) else None
        
        # Create timestamp in the past few days
        days_ago = random.randint(1, 7)
        created_at = datetime.now() - timedelta(days=days_ago)
        
        cursor.execute('''
            INSERT INTO generated_content (user_id, prompt, generated_tweet, image_url, is_posted, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (user_id, prompt, tweet, image_url, is_posted, created_at))
    
    print(f"Created {len(sample_prompts)} sample generated content entries")
    
    conn.commit()
    conn.close()
    
    # Create training data directory and sample file
    os.makedirs('training_data', exist_ok=True)
    
    training_data = []
    for i, (prompt, tweet) in enumerate(zip(sample_prompts, sample_tweets)):
        training_data.append({
            'user_id': (i % 4) + 2,
            'prompt': prompt,
            'generated_tweet': tweet,
            'image_url': f"/placeholder.svg?height=400&width=600" if random.choice([True, False]) else None,
            'timestamp': (datetime.now() - timedelta(days=random.randint(1, 7))).isoformat()
        })
    
    with open('training_data/generated_data.json', 'w') as f:
        json.dump(training_data, f, indent=2)
    
    print("Created sample training data file")
    print("\nDatabase initialization complete!")
    print("\nLogin credentials:")
    print("Admin: username='admin', password='admin123'")
    print("Sample users: username='john_doe', password='password123' (and similar for other users)")

if __name__ == '__main__':
    create_database()
