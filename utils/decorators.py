from functools import wraps
from flask import redirect, url_for, flash
from flask_login import current_user

def admin_required(f):
    """Decorator to require admin privileges for a route"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            flash('Please log in to access this page.')
            return redirect(url_for('index'))
        
        if not current_user.is_admin:
            flash('Access denied. Administrator privileges required.')
            return redirect(url_for('index'))
        
        return f(*args, **kwargs)
    return decorated_function
