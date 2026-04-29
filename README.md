SalesAgent: AI-Driven Meta Commerce Engine
SalesAgent is a production-grade automation system designed to handle the end-to-end sales lifecycle on Meta platforms (Messenger and Instagram). Moving beyond simple chatbots, this project implements complex state management and multimodal AI to transform social media interactions into a structured sales funnel.

The Core Challenge
---------------------------
Most "AI assistants" fail because they lose context or can't handle real-world inventory logic. I built SalesAgent to solve the "intent-to-transaction" gap by integrating real-time database state transitions with conversational LLM intelligence.

Technical Architecture
----------------------------
Built as a solo developer, the system prioritizes high-performance backend logic and seamless frontend deployment:

Framework: Next.js (Deployed on Vercel for optimal serverless scaling).

Database & Auth: Supabase (PostgreSQL) for real-time inventory tracking and secure user sessions.

AI Intelligence: Integration of Gemini & Anthropic APIs for multimodal analysis (processing customer images/screenshots) and intelligent lead ranking.

State Machine: Custom logic to manage complex conversation flows, ensuring the AI never "loops" and always pushes toward a conversion.

Key Features
----------------------------------
Multimodal Input: Automatically identifies products from customer-uploaded photos using vision models.

Real-time Inventory Sync: Direct integration with Supabase to ensure the AI only sells what is actually in stock.

Automated Lead Scoring: Ranks conversations based on "buying intent" to highlight high-value interactions for human oversight.
