import requests
from bs4 import BeautifulSoup

# Replace this URL with the URL of the webpage you want to scrape
url = 'https://devfolio.co/google-genaiexchange/challenges'

# Send a GET request to the webpage
response = requests.get(url)

# Check if the request was successful (HTTP Status Code 200)
if response.status_code == 200:
    # Parse the HTML content using BeautifulSoup
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Find the div with the specified class
    target_div = soup.find('div', class_='sc-hKMtZM')
    
    if target_div:
        # Extract the raw HTML content of the div
        raw_html = target_div.prettify()
        print(raw_html)
    else:
        print("Div with the specified class not found.")
else:
    print(f"Failed to retrieve the webpage. Status code: {response.status_code}")
