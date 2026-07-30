# VirtualHospitalAdvisor — MVP (client-side)

## What this is

A fully client-side (HTML/CSS/JavaScript) decision-support MVP. No server, no build step,
no dependencies — open `index.html` in Chrome and it runs.

This intentionally diverges from the original Flask-based repo layout
(`app.py`, `routes.py`, `scoring.py`, `recommendation.py`, `report.py`) described earlier in
the project. That backend adds a server dependency, which conflicts with the
"double-click and it runs locally, no server required" requirement for the conference MVP.
Everything below implements the same logic (questionnaire → scoring → recommendation → report)
purely in the browser. A Flask/Python version can be layered in later for the
"future cloud deployment" phase without changing this flow's logic.

