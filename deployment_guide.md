# JanSetu Deployment Guide

This guide provides step-by-step instructions for deploying the **JanSetu** platform. The project is split into a **Next.js Frontend** and a **Node.js Express Backend**.

## Prerequisites

- A [GitHub](https://github.com/) account with the project repository pushed.
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account for the database.
- A [Render](https://render.com/) account for backend hosting.
- A [Vercel](https://vercel.com/) account for frontend hosting.
- A [Google AI Studio](https://aistudio.google.com/) API key for Gemini AI features.

---

## 1. Backend Deployment (Render)

The backend is configured to be deployed on Render using the `render.yaml` file provided in the repository.

### Steps:
1.  **Connect GitHub**: Log in to Render and click **New +** > **Blueprint**.
2.  **Select Repository**: Connect your GitHub repository.
3.  **Deploy**: Render will detect `render.yaml` and set up the `jansetu-backend` service.
4.  **Environment Variables**: Go to the **Environment** tab in your Render dashboard for `jansetu-backend` and ensure the following variables are set:
    -   `NODE_VERSION`: `20`
    -   `MONGODB_URI`: Your MongoDB Atlas connection string.
    -   `JWT_SECRET`: A secure random string for authentication.
    -   `GEMINI_API_KEY`: Your Google Gemini API key.
    -   `FRONTEND_URL`: The URL of your deployed frontend (e.g., `https://jansetu.vercel.app`). *You can update this after deploying the frontend.*

---

## 2. Frontend Deployment (Vercel)

Vercel is the recommended platform for Next.js applications.

### Steps:
1.  **New Project**: Log in to Vercel and click **Add New** > **Project**.
2.  **Import Repository**: Select your GitHub repository.
3.  **Configure Project**:
    -   **Root Directory**: Set this to `frontend`.
    -   **Framework Preset**: Next.js (detected automatically).
    -   **Build Command**: `npm run build`
    -   **Install Command**: `npm install`
4.  **Environment Variables**: Add the following:
    -   `NEXT_PUBLIC_API_URL`: Your deployed backend URL + `/api` (e.g., `https://jansetu-backend.onrender.com/api`).
5.  **Deploy**: Click **Deploy**.

---

## 3. Post-Deployment Configuration

### Update Backend CORS
Once your frontend is deployed (e.g., `https://jansetu-xyz.vercel.app`), go back to your **Render Backend Dashboard** and update the `FRONTEND_URL` environment variable to match your Vercel URL. This ensures the backend allows requests from your frontend.

### Database Access
Ensure that your MongoDB Atlas cluster has **Network Access** configured to allow connections from Render's IP addresses (or "Allow Access from Anywhere" `0.0.0.0/0` for testing).

---

## Environment Variables Summary

| Variable | Location | Description |
| :--- | :--- | :--- |
| `MONGODB_URI` | Backend | MongoDB connection string |
| `JWT_SECRET` | Backend | Secret for signing tokens |
| `GEMINI_API_KEY` | Backend | API Key for Gemini AI |
| `FRONTEND_URL` | Backend | URL of the deployed frontend (for CORS) |
| `NEXT_PUBLIC_API_URL` | Frontend | URL of the deployed backend API |

---

## Verification
Once both are deployed:
1.  Visit your Vercel URL.
2.  Try to sign up or log in.
3.  Check the "Network" tab in your browser's Developer Tools to ensure requests to the backend are succeeding.
