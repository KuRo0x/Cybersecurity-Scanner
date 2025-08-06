# CyberSec Scanner - A Threat Intelligence Tool

![CyberSec Scanner Screenshot](<Screenshot 2025-08-06 180501.png>)

A professional, Flask-based web application to analyze file hashes and IP addresses for potential security threats using industry-standard threat intelligence APIs. This project demonstrates a security-first mindset, robust back-end engineering, and a clean, modern front-end.

---

## ✨ Features

*   **Dual Analysis Modes:**
    *   **File Hash Analysis:** Scans file hashes (MD5, SHA1, SHA256) against VirusTotal's database of over 60 antivirus engines.
    *   **IP Reputation Check:** Checks IPv4 addresses against AbuseIPDB for malicious activity reports and abuse confidence scores.
*   **Modern & Responsive UI:** A clean, dark-mode user interface designed for ease of use and clear presentation of results.
*   **User Guidance:** Provides clear instructions, supported format hints, and helpful tooltips.
*   **Responsible Use Disclaimer:** Includes an educational purpose disclaimer to promote ethical use of security tools.

## 🛡️ Security Considerations

This application was built with security as a primary concern.

*   **Proactive SSRF Mitigation:** The application uses Python's `ipaddress` library to validate all IP inputs. It ensures that only `is_global` (public) addresses are processed, explicitly blocking requests for private, loopback (e.g., `127.0.0.1`), and other reserved IP ranges *before* they are sent to any external API.
*   **Secret Management:** API keys and session secrets are loaded from a `.env` file, which is explicitly excluded from the repository via `.gitignore` to prevent secret leakage.
*   **Robust Error Handling:** The application gracefully handles API failures, network timeouts, and invalid user input, providing clear feedback to the user and logging events on the back-end.

## 🛠️ Tech Stack

*   **Back-End:** Python, Flask
*   **Front-End:** HTML, CSS, JavaScript
*   **APIs:** VirusTotal, AbuseIPDB

## 🚀 Setup and Local Installation

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/KuRo0x/Cybersecurity-Scanner.git
    cd Cybersecurity-Scanner
    ```

2.  **Set up a virtual environment and install dependencies:**
    ```bash
    # Create and activate a virtual environment
    python3 -m venv venv
    source venv/bin/activate

    # Install packages
    pip install -r requirements.txt
    ```

3.  **Create a `.env` file:**
    Create a `.env` file in the root of the project and add your API keys:
    ```
    VIRUSTOTAL_API_KEY=your_virustotal_api_key
    ABUSEIPDB_API_KEY=your_abuseipdb_api_key
    SESSION_SECRET=a_long_random_and_secure_string
    ```

4.  **Run the application:**
    ```bash
    python app.py
    ```
    The application will be available at `http://127.0.0.1:5000`.



