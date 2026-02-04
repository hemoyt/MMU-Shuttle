# 🌍 How to Deploy Your Project to Netlify

To make your project accessible on the internet (not just your computer), you need to host it. We will host the **Frontend on Netlify** and the **Backend on Render** (since Netlify is for static sites and Render is good for Node.js servers).

---

## Part 1: Host the Backend (Node.js Server) on Render
*You need the backend online first so the frontend has something to talk to.*

1.  **Push your code to GitHub**: Make sure your project is in a GitHub repository.
2.  **Sign up/Login to [Render.com](https://render.com)**.
3.  Click **"New +"** -> **"Web Service"**.
4.  Connect your GitHub repository.
5.  **Settings**:
    *   **Root Directory**: `backend` (Important! Your server is in this folder).
    *   **Build Command**: `npm install`
    *   **Start Command**: `node index.js`
    *   **Free Instance**: Select "Free".
6.  Click **Create Web Service**.
7.  Wait for it to deploy. Render will give you a URL (e.g., `https://mmu-shuttle.onrender.com`). **Copy this URL.**

---

## Part 2: Connect Frontend to the Online Backend

1.  Open `frontend/app.js` in your code editor.
2.  Change the top lines to point to your new Render URL instead of `localhost`.

```javascript
// REPLACE THESE LINES
// const API_URL = 'http://localhost:3000/api';
// const SOCKET_URL = 'http://localhost:3000';

// WITH YOUR RENDER URL (Example)
const API_URL = 'https://your-app-name.onrender.com/api'; 
const SOCKET_URL = 'https://your-app-name.onrender.com';
```
3.  Save the file.

---

## Part 3: Host the Frontend on Netlify (The Easy Way)

1.  **Go to [Netlify.com](https://www.netlify.com)** and log in.
2.  Go to the **"Sites"** tab.
3.  **Drag and Drop**: Open your file explorer on your computer. Find the `frontend` folder. Drag the entire `frontend` folder and drop it into the specific "Drag and drop your site folder here" area on the Netlify dashboard.
4.  Netlify will upload and deploy it instantly.
5.  It will give you a random URL (e.g., `https://peaceful-tiger-123.netlify.app`).

**🎉 Done! Your website is now online.**
You can send the Netlify link to your lecturer or open it on your phone.

---

## ⚡ Quick Checklist for Presentation
If you are asked "How did you host it?":
*   "I hosted the **Frontend** on **Netlify** because it's fast and uses a CDN."
*   "I hosted the **Backend** on **Render** to run the Node.js server and Socket.IO."
*   "They communicate via API requests."
