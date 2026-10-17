from google import genai
from dotenv import load_dotenv
from pydantic import BaseModel
import os

load_dotenv()
api_key = os.getenv("API_KEY")

class Project(BaseModel):
    title:str
    tags: list[str]
    description: str
    contact_info: str

def main():
    client = genai.Client(api_key=api_key)

    interaction = client.interactions.create(
        model="gemini-3.8-flash",
        input="Explain how AI works in a few words"
    )
    print(interaction.output_text)

if __name__ == "__main__":
    main()