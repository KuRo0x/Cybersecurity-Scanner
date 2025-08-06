// Scanner form validation and UI enhancements

document.addEventListener('DOMContentLoaded', function() {
    initializeFormValidation();
    initializeUIEnhancements();
});
function initializeFormValidation() {
    const scanForm = document.getElementById('scanForm');
    const scanInput = document.getElementById('scan_input');
    const scanButton = document.getElementById('scanButton');
    
    if (!scanForm || !scanInput || !scanButton) return;
    
    // Real-time input validation
    scanInput.addEventListener('input', function() {
        const value = this.value.trim();
        validateInput(value);
    });
    
    // Form submission handling
    scanForm.addEventListener('submit', function(e) {
        const value = scanInput.value.trim();
        
        if (!value) {
            e.preventDefault();
            showInputError('Please enter a file hash or IP address.');
            return;
        }
        
        // Show loading state but allow form to submit normally
        showLoadingState();
        
        // Let the form submit naturally to the server
        // Don't prevent submission - let Flask handle validation
    });
}

/**
 * Validate input format and provide visual feedback
 */
function validateInput(value) {
    const scanInput = document.getElementById('scan_input');
    const feedbackDiv = document.querySelector('.input-feedback');
    
    // Remove existing feedback
    if (feedbackDiv) {
        feedbackDiv.remove();
    }
    
    // Clear previous validation classes
    scanInput.classList.remove('is-valid', 'is-invalid');
    
    if (!value) return;
    
    if (isValidInput(value)) {
        scanInput.classList.add('is-valid');
        showInputFeedback('Valid format detected', 'success');
    } else {
        scanInput.classList.add('is-invalid');
        showInputFeedback('Invalid format', 'error');
    }
}

/**
 * Check if input is a valid IP address or file hash
 */
function isValidInput(input) {
    return isValidIP(input) || isValidHash(input);
}

/**
 * Validate IP address format
 */
function isValidIP(ip) {
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    
    if (!ipPattern.test(ip)) return false;
    
    // Check if each octet is within valid range (0-255)
    const octets = ip.split('.');
    return octets.every(octet => {
        const num = parseInt(octet, 10);
        return num >= 0 && num <= 255;
    });
}

/**
 * Validate file hash format (MD5, SHA1, SHA256)
 */
function isValidHash(hash) {
    // Remove whitespace and convert to lowercase
    hash = hash.trim().toLowerCase();
    
    // Check for hexadecimal characters only
    if (!/^[a-f0-9]+$/.test(hash)) return false;
    
    // Check length for common hash types
    const validLengths = [32, 40, 64]; // MD5, SHA1, SHA256
    return validLengths.includes(hash.length);
}

/**
 * Show input validation feedback
 */
function showInputFeedback(message, type) {
    const scanInput = document.getElementById('scan_input');
    const feedbackDiv = document.createElement('div');
    
    feedbackDiv.className = `form-text input-feedback text-${type === 'success' ? 'success' : 'danger'}`;
    feedbackDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-1"></i>
        ${message}
    `;
    
    scanInput.parentNode.appendChild(feedbackDiv);
}

/**
 * Show input error message
 */
function showInputError(message) {
    const scanInput = document.getElementById('scan_input');
    scanInput.classList.add('is-invalid');
    
    // Remove existing error message
    const existingError = document.querySelector('.input-error');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback input-error';
    errorDiv.textContent = message;
    
    scanInput.parentNode.appendChild(errorDiv);
    
    // Focus on the input field
    scanInput.focus();
}

/**
 * Show loading state during form submission
 */
function showLoadingState() {
    const scanButton = document.getElementById('scanButton');
    const scanInput = document.getElementById('scan_input');
    
    if (scanButton) {
        scanButton.disabled = true;
        scanButton.classList.add('loading');
        
        // Store original text and show loading text
        scanButton.dataset.originalText = scanButton.innerHTML;
        scanButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Analyzing...';
    }
    
    if (scanInput) {
        scanInput.disabled = true;
    }
}

/**
 * Initialize UI enhancements
 */
function initializeUIEnhancements() {
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add tooltip functionality for informational elements
    initializeTooltips();
    
    // Add keyboard navigation enhancements
    addKeyboardNavigation();
    
    // Initialize copy-to-clipboard functionality
    initializeCopyToClipboard();
}

/**
 * Initialize Bootstrap tooltips if available
 */
function initializeTooltips() {
    // Check if Bootstrap tooltip is available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => 
            new bootstrap.Tooltip(tooltipTriggerEl)
        );
    }
}

/**
 * Add keyboard navigation enhancements
 */
function addKeyboardNavigation() {
    // Allow Ctrl+Enter to submit the form
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const scanForm = document.getElementById('scanForm');
            if (scanForm) {
                scanForm.submit();
            }
        }
    });
}

/**
 * Initialize copy-to-clipboard functionality
 */
function initializeCopyToClipboard() {
    // Add click handler for copy buttons
    document.addEventListener('click', function(e) {
        if (e.target.matches('.btn-copy') || e.target.closest('.btn-copy')) {
            e.preventDefault();
            
            const button = e.target.closest('.btn-copy') || e.target;
            const textToCopy = button.dataset.copy;
            
            if (textToCopy && navigator.clipboard) {
                copyToClipboard(textToCopy, button);
            }
        }
    });
}

/**
 * Copy text to clipboard with visual feedback
 */
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(function() {
        // Show success feedback
        const originalContent = button.innerHTML;
        const originalClasses = button.className;
        
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.className = button.className.replace('btn-outline-secondary', 'btn-success');
        
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.className = originalClasses;
        }, 2000);
    }).catch(function(err) {
        console.error('Failed to copy text: ', err);
        
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        } catch (err) {
            console.error('Fallback copy failed: ', err);
        }
        
        document.body.removeChild(textArea);
    });
}

/**
 * Format threat level display with appropriate styling
 */
function formatThreatLevel(level) {
    const threatLevels = {
        'Clean': { icon: 'check-circle', class: 'success' },
        'Low Risk': { icon: 'exclamation-triangle', class: 'warning' },
        'Medium Risk': { icon: 'exclamation-triangle', class: 'warning' },
        'High Risk': { icon: 'times-circle', class: 'danger' },
        'Unknown': { icon: 'question-circle', class: 'secondary' }
    };
    
    const config = threatLevels[level] || threatLevels['Unknown'];
    
    return `
        <span class="badge bg-${config.class}">
            <i class="fas fa-${config.icon} me-1"></i>
            ${level}
        </span>
    `;
}

/**
 * Utility function to show toast notifications (if implemented)
 */
function showNotification(message, type = 'info') {
    // This could be extended to show toast notifications
    console.log(`${type.toUpperCase()}: ${message}`);
}

/**
 * Handle page visibility changes to pause/resume any ongoing operations
 */
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden - could pause operations
        console.log('Page hidden');
    } else {
        // Page is visible - could resume operations
        console.log('Page visible');
    }
});
