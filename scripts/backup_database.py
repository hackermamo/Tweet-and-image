#!/usr/bin/env python3
"""
Database backup script for AI Tweet Generator
Creates a backup of the current database
"""

import sqlite3
import json
import os
from datetime import datetime

def backup_database():
    """Create a backup of the database"""
    
    if not os.path.exists('database.db'):
        print("No database found to backup")
        return
    
    # Create backups directory
    os.makedirs('backups', exist_ok=True)
    
    # Generate backup filename with timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_filename = f'backups/database_backup_{timestamp}.json'
    
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    backup_data = {}
    
    # Backup users table
    cursor.execute('SELECT * FROM users')
    users = cursor.fetchall()
    cursor.execute('PRAGMA table_info(users)')
    user_columns = [column[1] for column in cursor.fetchall()]
    
    backup_data['users'] = {
        'columns': user_columns,
        'data': users
    }
    
    # Backup generated_content table
    cursor.execute('SELECT * FROM generated_content')
    content = cursor.fetchall()
    cursor.execute('PRAGMA table_info(generated_content)')
    content_columns = [column[1] for column in cursor.fetchall()]
    
    backup_data['generated_content'] = {
        'columns': content_columns,
        'data': content
    }
    
    # Add metadata
    backup_data['metadata'] = {
        'backup_date': datetime.now().isoformat(),
        'total_users': len(users),
        'total_content': len(content)
    }
    
    conn.close()
    
    # Save backup
    with open(backup_filename, 'w') as f:
        json.dump(backup_data, f, indent=2, default=str)
    
    print(f"Database backup created: {backup_filename}")
    print(f"Backed up {len(users)} users and {len(content)} content entries")

if __name__ == '__main__':
    backup_database()
