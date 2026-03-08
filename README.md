<div align="center">
  <img src="https://via.placeholder.com/150/1e293b/10b981?text=Krishi+Mitra" alt="Krishi Mitra Logo" width="150" height="150" style="border-radius: 20%;" />

  # 🌾 Krishi Mitra (कृषि मित्र)
  
  **An Elite, Scalable, AI-Driven Full-Stack Agronomic Ecosystem**
  
  [📱 **Download Android APK**](#) • [🎥 **Watch Demo Video**](#) • [🚀 **Live Backend API**](#)
  
  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)](https://expo.dev/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Firebase](https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
  [![Gemini 1.5 Flash](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google%20gemini&logoColor=white)](https://ai.google.dev/)
</div>

---

## 🌍 The Executive Summary
Smallholder farmers are the backbone of global food systems, yet they are systematically disconnected from the modern data and agronomic intelligence needed to thrive. **The result?** Decades of poor crop rotation causing severe soil degradation, rampant unmanaged plant diseases leading to catastrophic yield losses, and a reliance on fragmented, outdated advice.

**Krishi Mitra is our technical response to this crisis.** We have engineered a highly scalable, serverless ecosystem that democratizes access to elite, computational agriculture. By combining deterministic mathematical soil modeling with cutting-edge real-time Generative AI, we deliver actionable intelligence directly to the farmer's smartphone.

---

## ⚡ Deep Dive: Core Features & Architecture

### 1. 🧬 The Crop Rotation Engine (Python / FastAPI)
*The Problem: Continuous monoculture (planting the same crop repeatedly) exhausts specific macronutrients and guarantees the survival of crop-specific pathogens in the soil.*

**The Solution:** We built a custom **deterministic, rule-based agronomic inference engine** running on a lightning-fast FastAPI microservice.
*   **Dynamic Soil Modeling:** It ingests the farmer’s historical crop vectors (e.g., "Soybean -> Wheat") and mathematically calculates the compound accretion or depletion of Nitrogen, Phosphorus, and Potassium (N-P-K).
*   **Pathogenic Truncation Algorithms:** It scores thousands of crop permutations, actively applying severe heuristic penalties to crops from the same botanical family to instantly break disease carryover cycles.
*   **Mathematical Optimization:** It ranks and outputs a scientifically precise, two-season (Kharif and Rabi) rotation strategy designed to maximize yield velocity while actively regenerating the soil's biochemical integrity.

### 2. 👁️ The AI Crop Scanner (Gemini 1.5 Flash Vision)
*The Problem: When a crop gets sick, a farmer realistically has hours or days to react before the entire yield is compromised, but expert agronomists are rare and expensive.*

**The Solution:** We instantiated **edge-inference AI directly into our React Native rendering pipeline.**
*   A farmer captures a high-resolution image of the affected plant tissue.
*   The raw image tensor is securely transmitted to Google's **Gemini 1.5 Flash Vision API**.
*   The Multimodal Large Language Model performs instant visual pathogen classification. It returns structured, highly constrained JSON payloads containing exact disease identification, immediate chemical/organic remediation protocols, and long-term prophylactic measures directly to the mobile UI.

### 3. 🧠 Deep Knowledge Graph UI (Offline / Immutable)
*The Problem: Farmers often operate in highly degraded network topologies where calling massive LLM APIs for basic questions is unfeasible and expensive.*

**The Solution:** We engineered a **multi-level, drill-down Knowledge Graph interface** that operates entirely disconnected from the backend.
*   **Hierarchical Agronomy Data:** A beautifully designed "Dark Mode Dashboard" allows farmers to navigate through domains like *Precision Soil Diagnostics*, *Hydrological Optimization*, and *Phytopathology*.
*   **On-Device Data Visualization:** We built a custom, lightweight rendering engine for Bar Charts and Progress indicators natively in the frontend code. This allows farmers to instantly visualize complex data—like *Standardized N-P-K Uptake Trajectories* or *Disease Progression Curves*—without ever requiring a network request.

### 4. 🌐 Decentralized Mentorship Matrix (Firebase Firestore)
*The Problem: Agricultural knowledge is deeply localized and often trapped in silos.*

**The Solution:** A peer-to-peer telemetry module built on top of **Firebase's persistent WebSocket connections.**
*   Provides a highly concurrent, low-latency communication layer.
*   Connects rural farmers directly with elite agronomists, institutional experts, and peers to exchange localized heuristic methodologies and optimize farming protocols synchronously.

---

## 🛠️ Why We Chose This Tech Stack

| Domain | Technology | The Engineering Justification |
| :--- | :--- | :--- |
| **Client Edge** | **React Native / Expo** | Offers near-native performance with a single JavaScript codebase, allowing rapid cross-platform deployment. Expo ensures seamless OTA updates and robust build pipelines. |
| **Backend Service** | **Python / FastAPI** | Selected for its extreme performance metrics and native asynchronous capabilities (`asyncio`), critical for handling simultaneous concurrent crop matrix calculations. |
| **Database & Auth** | **Firebase MBaaS** | Firestore NoSQL handles real-time telemetry syncing flawlessly. Firebase Auth provides guaranteed, secure OAuth/Phone session management out of the box. |
| **AI Layer** | **Gemini 1.5 Flash API** | The only multimodal model capable of combining hyper-fast visual inference with massive context windows necessary for highly constrained agronomic system prompts. |

---

## 📐 System Data Flow

1.  **Ingestion & Geofencing:** Client authenticates via Firebase and dispatches localized physiological payloads (crop history, climate parameters).
2.  **Deterministic Routing:** FastAPI layer intercepts and routes to the required mathematical modeling endpoints, executing the N-P-K scoring matrix.
3.  **Heuristic Processing:** Secondary threads handle Gemini API handshakes for asynchronous image-tensor disease diagnostics.
4.  **Edge Delivery:** Optimized JSON payloads are pushed back and rendered via React Native's Virtual DOM, translating complex mathematics into actionable, visual UI components for the farmer.

---

## 🏆 Hackathon Impact & Scalability
**Krishi Mitra** is designed to scale exponentially. By decoupling the logic into a stateless microservice architecture (FastAPI) and a lightweight client (React Native), the application can easily handle millions of concurrent users. 

We are not just solving a localized software problem; we are deploying a structurally robust, technically sophisticated ecosystem engineered to stabilize agrarian economies and guarantee long-term global food security. 

<br>

<div align="center">
  <i>Built with extreme precision for modern agriculture.</i>
</div>
