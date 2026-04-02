# Avatar AI

A self-service platform where anyone can upload their documents and get a personalized AI avatar — delivered as an embeddable `<script>` tag they paste into their own website.

This is a **learning-focused Generative AI project** built to explore:
- Prompt engineering with LLMs
- Retrieval-Augmented Generation (RAG) with Pinecone
- OpenAI Embeddings + GPT-4o-mini
- FastAPI backend deployed on AWS App Runner
- Embeddable JS widget (Vite) served via S3 + CloudFront
- React dashboard on AWS Amplify

The current version loads personal documents (PDF + text) and responds as a conversational persona. Future phases will add multi-user support, ingestion pipelines, and the embeddable widget.
