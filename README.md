# Zoart-A-Project

## Things added since Zothacks:
+Search bar taking one input at a time to not overload Gemini
+No more tags duplication because of typo or abbreviation
+Tags have a limit of 7 per project
+Major selection(seperated from tags)
+Page proportion should scale with screen resolution, and slightly more polished distributions
+Button that redirects to home screen
+Updated home screen to look less empty(Zoart buttons, slight animations)
+Like button for projects
+Creation time

## Things to be added:
-Sign in
-More equal proportion for project cards
-Redirect button for projects
-Active status for projects
-Manual filtering(active projects, old projects, projects you created)
-Sorting projects(Oldest, most popular, etc)
-Text limits
-More styling to make the website look less empty

## End goal: Huge hub
^I think it's better to have a single universal website that contain all the goodies instead of having them all spread out
-Page for clubs(unrelated to projects)
-Page for news(like career fair, networking events, etc)






Zoart-A-Project is a hub designed to connect UCI students with each other as their collaborate on their next big project.

DEMO: https://youtu.be/RzxWzqZxtPM

## The Situation
We've noticed that to really stand out in today's hyper-competitive job market, students need projects that expand their skills and knowledge while demonstrating their qualifications to potential employers. But for many students who want to undergo such an undertaking, to create a project they can truly be proud of, they seek peers to collaborate with. But there really isn't much of a space to help connect them.

That's why we made Zoart-A-Project, to create a unified hub where UCI students can go to look for interesting projects that ignite their passion or as a place to find teammates who'll support each other to build something together.

## Tech Stack

**Front end**: Next.js, React, Tailwind CSS, Typescript\
**Back end**: Python, FastAPI, GeminiAPI \
**Database**: SupaBase\


## How to use (functionality)
When first entering the website, the user will be greeted with some introductory information. On the top right corner, are the two buttons that are the main functionality of the site. \
The left one brings the user to a page where they get to browse the projects available on the site. It has a search bar that takes in any input (since the input is fed into GeminiAPI) and filters out the projects via tags that don't relate well to what the user is looking for. \
On the very top right, is the button that lets users make new posts for projects, taking in project titles, description, author's name, thematic tags, and obviously an area for contact information to let people connect with the poster.\


