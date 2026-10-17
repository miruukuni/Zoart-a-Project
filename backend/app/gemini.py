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
    description: str = Field(description = "First, A short description of that tag, then how it matches the student's query. Limit character count to 150")
    match_percent: int = Field(description = "How much the student query matches that tag, in percent.")
class TagsList(BaseModel):
    tags: List[Tag] = Field(description="A list of Tag objects")

app = FastAPI()
load_dotenv()

api_key = os.getenv("API_KEY")

tags = [
    "Psychology",
    "Game Design and Interactive Media",
    "Informatics",
    "Computer Science and Engineering",
    "Classics",
    "Biomedical Engineering",
    "Anthropology",
    "English",
    "Exercise Sciences",
    "International Studies",
    "Sociology",
    "Biochemistry and Molecular Biology",
    "Ecology and Evolutionary Biology",
    "Computer Engineering",
    "Chinese Studies",
    "Materials Science and Engineering",
    "Spanish",
    "Criminology, Law and Society",
    "Software Engineering",
    "Civil Engineering",
    "Pharmaceutical Sciences",
    "Chemistry",
    "Computer Science",
    "Dance Performance",
    "German Studies",
    "European Studies",
    "Korean Literature and Culture",
    "Data Science",
    "Social Policy & Public Service",
    "Biology/Education",
    "Social Ecology",
    "Applied and Computational Mathematics",
    "Neurobiology",
    "East Asian Cultures",
    "Nursing Science",
    "Film and Media Studies",
    "Comparative Literature",
    "Business Economics",
    "Mechanical Engineering",
    "Japanese Language and Literature",
    "Biomedical Engineering: Premedical",
    "Language Science",
    "Genetics",
    "Economics",
    "Drama",
    "Urban Studies, Planning, and Policy",
    "Business Administration",
    "Microbiology and Immunology",
    "Aerospace Engineering",
    "Public Health Policy",
    "Quantitative Economics",
    "Dance Choreography",
    "Psychology",
    "Environmental and Earth System Science",
    "French",
    "Mathematics",
    "Literary Journalism",
    "Environmental Engineering",
    "Political Science",
    "Global Cultures"
]

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