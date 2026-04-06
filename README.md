# Avatar AI

A self-service platform where anyone can upload their documents and get a personalized AI avatar — delivered as an embeddable `<script>` tag they paste into their own website.

> This is a **learning-focused Generative AI project** built to explore prompt engineering, RAG, agentic workflows, and full-stack AWS deployment.

---

## What it does

- Users sign up, upload their documents, and get an embed token
- Visitors on their site chat with their AI avatar via an embeddable widget
- The avatar responds using a knowledge base built from the user's own content

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | FastAPI, Python |
| AI / Agents | OpenAI Agents SDK, GPT-4o-mini |
| Embeddings & RAG | OpenAI Embeddings, Pinecone |
| Auth | JWT + embed tokens |
| Widget | Vite (IIFE build) |
| Infra (planned) | AWS App Runner, S3, CloudFront, Amplify |

---

## Features

- **Agentic chat** — avatar is an agent with tools: `search_knowledge_base`, `fetch_live_github_stats`, `record_user_details`, `record_unknown_question`
- **Ingestion pipeline** — PDF, GitHub profile URL, and raw text → chunk → embed → Pinecone (per-user namespace)
- **Auth** — JWT-based login + embed token generation for widget access
- **REST API** — routers for auth, chat, and document management
- **Embeddable widget** — Vite scaffold for the `<script>` tag drop-in

---

## Coming Up

- React dashboard — manage knowledge sources, persona settings, live preview, and embed snippet
- Widget production build — hosted on S3 + CloudFront
- Full AWS deployment — App Runner (backend), Amplify (dashboard)
- End-to-end multi-user flow
