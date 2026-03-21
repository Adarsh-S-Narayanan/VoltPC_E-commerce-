
# ⚡ VoltPC Engineering

# VoltPC_E-commerce-
VoltPC Engineering is a specialized e-commerce platform architected to solve the complexities of high-end PC assembly and professional hardware procurement. By integrating a modern MERN-like stack with Google Gemini AI and a unique hybrid rendering engine


**Engineer Power. Precision-tuned workstations and high-octane gaming rigs.**

VoltPC Engineering is a premium, full-stack e-commerce platform and custom PC building ecosystem. Designed for enthusiasts who demand perfection, it offers a seamless experience from configuration to checkout, backed by an AI-driven support assistant and a robust administrative backend.

---

## 🚀 Key Features

- **🛠️ Build Lab**: A state-of-the-art interactive PC configurator that validates component compatibility (sockets, wattage, dimensions).
- **📦 Pre-built Models**: Curated high-performance systems ready for immediate deployment.
- **🖱️ Peripherals & Accessories**: A comprehensive catalog of elite gaming and productivity hardware.
- **🤖 VoltAI Assistant**: A Gemini-powered intelligent chat interface for technical advice and system recommendations.
- **🔐 Secure Checkout & Auth**: Firebase-integrated authentication and secure payment processing via UroPay.
- **📊 Admin Command Center**: Real-time management of product inventory, order tracking, and system telemetry.

---

## 🛠️ Tech Stack

### Frontend
- **React 19**: Modern UI component architecture.
- **Vite**: Ultra-fast build tool and dev server.
- **Tailwind CSS Patterns**: Utility-first styling for a premium, responsive design.
- **Framer Motion**: Fluid animations and micro-interactions.
- **Material Symbols**: Precision iconography for a technical aesthetic.

### Backend & Database
- **Node.js & Express**: High-performance API layer.
- **MongoDB & Mongoose**: Scalable document-based data storage.
- **Firebase Auth**: Industry-standard identity management.
- **Google Generative AI**: LLM integration for the interactive assistant.

---

## 🏗️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or local instance.

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd voltpc-engineering
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add the following (refer to `.env.example` if available):
   ```env
   # Gemini API Key
   API_KEY=your_gemini_api_key

   # MongoDB URI
   MONGODB_URI=your_mongodb_connection_string

   # UroPay Credentials
   MASTER_KEY=your_master_key
   UROPAY_API_KEY=your_uropay_key
   UROPAY_SECRET=your_uropay_secret
   ```

### Running the Application

- **Run Frontend and Backend (Concurrent):**
  ```bash
  npm run dev:all
  ```
- **Run Frontend only:**
  ```bash
  npm run dev
  ```
- **Run Backend only:**
  ```bash
  npm run server
  ```

---

## 📁 Project Structure

```text
voltpc-engineering/
├── components/      # Reusable UI components (Navbar, BuildLab, etc.)
├── pages/           # Main view components (BuildLab, Admin, Auth, etc.)
├── server/          # Express server and API routes
├── services/        # API and Firebase service configurations
├── public/          # Static assets
├── App.jsx          # Root application component & Routing
└── index.jsx        # Entry point
```

---

## 📜 License
© 2024 VoltPC Engineering Corp. All configurations subject to stress testing.

