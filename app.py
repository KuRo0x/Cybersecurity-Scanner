import os
import logging
from flask import Flask, render_template, request, flash, redirect, url_for
from scanner import SecurityScanner

def load_env_file():
    """Load environment variables from .env file"""
    try:
        with open('.env', 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    os.environ[key] = value
    except FileNotFoundError:
        pass
    except Exception:
        pass

load_env_file()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

scanner = SecurityScanner(
    virustotal_api_key=os.getenv("VIRUSTOTAL_API_KEY", ""),
    abuseipdb_api_key=os.getenv("ABUSEIPDB_API_KEY", "")
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/scan', methods=['POST'])
def scan():
    try:
        scan_input = request.form.get('scan_input', '').strip()
        
        if not scan_input:
            flash('Please enter a file hash or IP address to scan.', 'warning')
            return redirect(url_for('index'))
        
        if scanner.is_valid_ip(scan_input):
            result = scanner.scan_ip(scan_input)
            scan_type = 'ip'
        elif scanner.is_valid_hash(scan_input):
            result = scanner.scan_hash(scan_input)
            scan_type = 'hash'
        else:
            flash('Invalid input format. Please enter a valid IP address or file hash.', 'error')
            return redirect(url_for('index'))
        
        if result['success']:
            return render_template('results.html', 
                                 result=result, 
                                 scan_type=scan_type, 
                                 scan_input=scan_input)
        else:
            flash(f"Scan failed: {result.get('error', 'Unknown error')}", 'error')
            return redirect(url_for('index'))
            
    except Exception as e:
        logger.error(f"Error in scan: {str(e)}")
        flash('An unexpected error occurred. Please try again.', 'error')
        return redirect(url_for('index'))

@app.errorhandler(404)
def not_found_error(error):
    flash('Page not found.', 'error')
    return redirect(url_for('index'))

@app.errorhandler(500)
def internal_error(error):
    flash('Internal server error. Please try again.', 'error')
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
