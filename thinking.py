import requests
import json


url = "https://api.github.com/users/abhinayjangde/repos" 

result = requests.get(url, timeout=10)
data = result.json()

print(json.dumps(data[0], indent=4, sort_keys=True))

