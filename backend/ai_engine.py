import requests
import sys

subject = sys.argv[1]
topic = sys.argv[2]
difficulty = sys.argv[3]
type_q = sys.argv[4]

prompt = f"""
Generate 14 university-level questions for subject: {subject}, topic: {topic}.

Rules:
- First 8 questions should be SHORT (5 marks)
- Next 6 questions should be LONG (10 marks)
- Output ONLY numbered questions
- No explanations
"""

response = requests.post(
    "http://localhost:11434/api/generate",
    json={
        "model": "mistral",
        "prompt": prompt,
        "stream": False
    }
)

data = response.json()

print(data["response"])