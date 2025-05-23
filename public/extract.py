import requests
import json
import yaml
from urllib.parse import urljoin
from bs4 import BeautifulSoup

def discover_swagger_url(base_url):
    """Attempt to discover the Swagger/OpenAPI specification URL."""
    common_swagger_paths = [
        '/swagger.json',
        '/v2/api-docs',
        '/api-docs',
        '/swagger.yaml',
        '/openapi.json',
        '/openapi.yaml'
    ]
    
    # Try common Swagger paths
    for path in common_swagger_paths:
        url = urljoin(base_url, path.lstrip('/'))
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                if 'application/json' in content_type or 'text/yaml' in content_type or 'application/yaml' in content_type:
                    return url
        except requests.RequestException:
            continue
    
    # Try Swagger UI to extract JSON URL
    swagger_ui_url = urljoin(base_url, 'swagger-ui.html')
    try:
        response = requests.get(swagger_ui_url, timeout=5)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            # Look for script tags or links that might contain the Swagger JSON URL
            for script in soup.find_all('script'):
                if script.string and 'swagger.json' in script.string:
                    # Extract URL from script (simplified, may need regex for robustness)
                    return urljoin(base_url, 'swagger.json')
    except requests.RequestException:
        pass
    
    raise ValueError("Could not find Swagger/OpenAPI specification. Please provide the direct URL to the Swagger JSON/YAML file.")

def fetch_swagger_data(swagger_url):
    """Fetch and parse Swagger/OpenAPI specification from URL."""
    try:
        response = requests.get(swagger_url)
        response.raise_for_status()
        
        # Check content type
        content_type = response.headers.get('content-type', '')
        if 'application/json' not in content_type and 'text/yaml' not in content_type and 'application/yaml' not in content_type:
            raise ValueError(f"Invalid content type: {content_type}. Expected JSON or YAML.")
        
        # Try parsing as JSON
        try:
            return response.json()
        except ValueError:
            # Try YAML
            try:
                return yaml.safe_load(response.text)
            except yaml.YAMLError as e:
                raise ValueError(f"Failed to parse YAML: {e}")
                
    except requests.RequestException as e:
        raise Exception(f"Failed to fetch Swagger data: {e}")

def extract_endpoints(swagger_data, base_url):
    """Extract API endpoints, requests, and responses from Swagger data."""
    endpoints = []
    
    # Handle Swagger 2.0 or OpenAPI 3.0
    paths = swagger_data.get('paths', {})
    servers = swagger_data.get('servers', [{'url': base_url}])
    base_path = servers[0].get('url', base_url)
    
    for path, methods in paths.items():
        for method, details in methods.items():
            endpoint = {
                'path': path,
                'method': method.upper(),
                'full_url': urljoin(base_path, path.lstrip('/')),
                'summary': details.get('summary', ''),
                'description': details.get('description', ''),
                'parameters': [],
                'request_body': {},
                'responses': {}
            }
            
            # Extract parameters
            if 'parameters' in details:
                endpoint['parameters'] = [
                    {
                        'name': param.get('name'),
                        'in': param.get('in'),
                        'required': param.get('required', False),
                        'schema': param.get('schema', {})
                    } for param in details['parameters']
                ]
            
            # Extract request body
            if 'requestBody' in details:
                content = details['requestBody'].get('content', {})
                if 'application/json' in content:
                    endpoint['request_body'] = content['application/json'].get('schema', {})
            
            # Extract responses
            for status_code, response in details.get('responses', {}).items():
                endpoint['responses'][status_code] = {
                    'description': response.get('description', ''),
                    'content': response.get('content', {})
                }
            
            endpoints.append(endpoint)
    
    return endpoints

def save_to_json(data, output_file='api_endpoints.json'):
    """Save extracted endpoints to a JSON file."""
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

def main(base_url, output_file='api_endpoints.json'):
    """Main function to process Swagger URL and generate JSON output."""
    try:
        # Validate URL format
        if not base_url.startswith(('http://', 'https://')):
            raise ValueError("Invalid URL: Must start with http:// or https://")
        
        # Discover Swagger URL
        swagger_url = discover_swagger_url(base_url)
        print(f"Found Swagger specification at: {swagger_url}")
        
        # Fetch Swagger data
        swagger_data = fetch_swagger_data(swagger_url)
        
        # Extract endpoints
        endpoints = extract_endpoints(swagger_data, base_url)
        
        # Save to JSON
        save_to_json(endpoints, output_file)
        print(f"API endpoints saved to {output_file}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Example usage
    base_url = input("Enter base URL of the application (e.g., https://tawgeeh-v1-production.up.railway.app/): ")
    main(base_url)