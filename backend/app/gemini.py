from typing import List
from google import genai
from fastapi import FastAPI
from dotenv import load_dotenv
import os
# Code for project json handling
from pydantic import BaseModel, Field
# class Project(BaseModel):
#     title:str
#     tags: list[str]
#     description: str
#     contact_info: str

class Tag(BaseModel):
    tag: str = Field(description="A tag in the given tag list.")
    description: str = Field(description = "A description of that tag, and how it matches the student's query. Limit character count to 150")
    match_percent: int = Field(description = "How much the student query matches that tag, in percent.")
class TagsList(BaseModel):
    tags: List[Tag] = Field(description="A list of Tag objects")

app = FastAPI()
load_dotenv()

api_key = os.getenv("API_KEY")
tags = ["Computer Science", "AI", "Robots", "Egg"]
percent = 50

@app.post("/api/gemini_search")
def call_gemini(user_query: str):
    print("Processing Gemini...")
    client = genai.Client(api_key=api_key)

    interaction = client.interactions.create(
        model="gemini-3.8-flash",
        input=[
            {"type": "text", "text": "You are helping college students figure out what type of collaborative project fits them best."
            "Given a student input on the type of the project that they are interested in, and a list of tags that are available, "
            f"give the student a list of recommended tags from the tag list, where recommended is defined as tags with a match percent >= {percent}"},
            {"type": "text", "text": f"Tags: {tags}"},
            {"type": "text", "text": f"Student input: {user_query}"}
        ],
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": TagsList.model_json_schema()
        },
    )
    return TagsList.model_validate_json(interaction.output_text)

if __name__ == "__main__":
    output = call_gemini(input())
    for tag in output.tags:
            print(f"Tag: {tag.tag}, description: {tag.description}, match percent: {tag.match_percent}")