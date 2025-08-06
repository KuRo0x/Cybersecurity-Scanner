import os
import re
import requests
import logging

logger = logging.getLogger(__name__)

class SecurityScanner:
    def __init__(self, virustotal_api_key, abuseipdb_api_key):
        self.virustotal_api_key = virustotal_api_key
        self.abuseipdb_api_key = abuseipdb_api_key
        self.vt_url = "https://www.virustotal.com/api/v3"
        self.abuseipdb_url = "https://api.abuseipdb.com/api/v2"
        self.session = requests.Session()

    def is_valid_ip(self, ip_string: str) -> bool:
        pattern = re.compile(r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$")
        return pattern.match(ip_string) is not None

    def is_valid_hash(self, hash_string: str) -> bool:
        pattern = re.compile(r"^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$")
        return pattern.match(hash_string) is not None

    def scan_ip(self, ip: str) -> dict:
        if not self.abuseipdb_api_key:
            return {'success': False, 'error': 'AbuseIPDB API key is not configured.'}
        endpoint = f"{self.abuseipdb_url}/check"
        headers = {'Accept': 'application/json', 'Key': self.abuseipdb_api_key}
        params = {'ipAddress': ip, 'maxAgeInDays': '90'}
        try:
            response = self.session.get(endpoint, headers=headers, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            if 'data' in data:
                return {'success': True, 'data': data['data']}
            else:
                error_detail = data.get('errors', [{}])[0].get('detail', 'Unknown API error')
                return {'success': False, 'error': error_detail}
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP Error for IP {ip}: {e.response.status_code} - {e.response.text}")
            try:
                error_details = e.response.json().get('errors', [{}])[0].get('detail', 'API returned an error.')
                return {'success': False, 'error': f"API Error: {error_details}"}
            except:
                return {'success': False, 'error': f"API Error: {e.response.status_code}"}
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error for IP {ip}: {e}")
            return {'success': False, 'error': "Network Error: Could not connect to AbuseIPDB."}

    def scan_hash(self, file_hash: str) -> dict:
        if not self.virustotal_api_key:
            return {'success': False, 'error': 'VirusTotal API key is not configured.'}
        endpoint = f"{self.vt_url}/files/{file_hash}"
        headers = {'x-apikey': self.virustotal_api_key}
        try:
            response = self.session.get(endpoint, headers=headers, timeout=10)
            if response.status_code == 404:
                return {'success': True, 'data': {'attributes': {'last_analysis_stats': 'Not Found'}}}
            response.raise_for_status()
            data = response.json()
            if 'data' in data:
                 return {'success': True, 'data': data['data']}
            else:
                return {'success': False, 'error': 'Received invalid data from VirusTotal.'}
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP Error for hash {file_hash}: {e.response.status_code}")
            if e.response.status_code == 401:
                return {'success': False, 'error': "API Error: Invalid VirusTotal API key."}
            return {'success': False, 'error': f"API Error: {e.response.status_code}"}
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error for hash {file_hash}: {e}")
            return {'success': False, 'error': 'Network Error: Could not connect to VirusTotal.'}
