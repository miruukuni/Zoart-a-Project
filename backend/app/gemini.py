from typing import List
import logging
import time
from google import genai
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
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
    description: str = Field(description = "Short description of tag, then how it matches query. 150 character limit")
    match_percent: int = Field(description = "How much the student query matches that tag, in percent.")
class TagsList(BaseModel):
    tags: List[Tag] = Field(description="A list of Tag objects")

app = FastAPI()
origins = [
     "https://localhost:3000",
     "http://localhost:3000",
     "http://127.0.0.1:8000",
]
app.add_middleware(
     CORSMiddleware,
     allow_origins=[
        "https://localhost:3000",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
     allow_credentials=True,
     allow_methods =["*"],
     allow_headers =["*"],
)
load_dotenv()

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
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/api/gemini_search")
def call_gemini(user_query: str= Body(embed=True)):
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    print("Processing Gemini...\n")
    start = time.time()
    try:
        interaction = client.interactions.create(
            model="gemini-3.8-flash",
            input=[
                {
                    "type": "text",
                    "text": (
                        "Recommend relevant project tags for a student. "
                        f"Available tags: {tags}. "
                        f"Student input: {user_query}. "
                        f"Only return tags with match_percent >= {percent}."
                    ),
                }
            ],
            response_format={
                "type": "text",
                "mime_type": "application/json",
                "schema": TagsList.model_json_schema(),
            },
        )

        logger.info("Gemini responded in %.2f seconds", time.time() - start)
        logger.info("Raw output: %s", interaction.output_text)

        result = TagsList.model_validate_json(interaction.output_text)

        logger.info("Finished processing")
        return result

    except Exception:
        logger.exception(
            "Gemini failed after %.2f seconds",
            time.time() - start,
        )
        raise
    return TagsList.model_validate_json(interaction.output_text)

if __name__ == "__main__":
    output = call_gemini(input())
    for tag in output.tags:
            print(f"Tag: {tag.tag}, description: {tag.description}, match percent: {tag.match_percent}")