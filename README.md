# UNICC AI Safety Lab - Integration & UX Dashboard

![Python](https://img.shields.io/badge/Backend-Python%20%7C%20FastAPI-3776AB?logo=python&logoColor=white)
![LLM](https://img.shields.io/badge/Powered%20by-OpenAI-412991?logo=openai&logoColor=white)
![Compliance](https://img.shields.io/badge/Compliance-NIST%20RMF%20%7C%20OWASP-23B95B)

## Project Overview
The **UNICC AI Safety Lab** is an enterprise-grade evaluation dashboard developed for the United Nations International Computing Centre (UNICC) Sandbox. It provides a robust, visual, and automated way to assess the safety, compliance, and security of AI agents before they are deployed. This capstone project directly addresses a critical gap in AI governance: how can organizations ensure AI systems are safe, trustworthy, and aligned with institutional values before deployment? Rather than relying on external APIs or black-box systems, the AI Safety Lab will provide UNICC with an auditable, controllable, and governance-aligned testing environment. 

The main business problem is that many AI systems are like "black boxes," so organizations do not know if they are safe or trustworthy, which carries a big risk for international organizations like the UNICC. My project helps build an AI Safety Lab on a private platform, so the client does not have to rely on external APIs. The UNICC will benefit from a "Council of Experts" system that checks AI agents from different perspectives to ensure they cause no harm. By completing this project, the client can test their AI tools in a secure environment before using them in the real world. This will make AI adoption in the UN system more trustworthy and transparent.

Based on the **"Council of Experts"** architecture, this system integrates three distinct AI evaluation modules (Safety, Governance, and Contextual Risk) and aggregates their findings into actionable decisions (APPROVE / REVIEW / REJECT) based on **NIST AI RMF** and **OWASP LLM Top 10** standards.

## System Architecture & Integrated Components

The development of the AI Safety Lab is divided into three integrated capstone projects. Each student on the team focused on one component, and the three components are unified into this final ensemble system:

* **Research and Platform Preparation:** This component establishes the foundational infrastructure and knowledge base for the AI Safety Lab. This includes conducting research on multi-module inference ensembles, small language models, and AI governance frameworks, as well as preparing the technical platform on the NYU DGX Spark cluster.
* **Fine-Tuning the SLM and Building the Council of Experts:** This component aims to adapt and fine-tune the small language model to support the three expert modules from Fall 2025. It implements the orchestration mechanisms that enable these modules to function as a council of experts.
* **Testing, User Experience, and Integration:** This component integrates all developed components into a seamless, unified system with a user-friendly interface. It also involves conducting comprehensive testing to ensure the AI Safety Lab functions reliably and effectively for UNICC stakeholders.

## Key Features
* **Council-of-Experts Dashboard:** A centralized matrix UI displaying real-time feedback from multiple AI evaluators.
* **Automated Arbiter Logic:** Dynamically calculates the final deployment verdict based on weighted expert scores.
* **One-Click Audit Reports:** Generates and exports comprehensive, professional PDF testing reports for compliance officers.
* **Empirical Testing & Validation:** Includes real-world testing data using past UNICC AI projects. Please refer to the `UNICC_Testing_Validation_Report.pdf` document included in this repository for the comprehensive system audit and validation results.

###  Empirical Testing & Validation Results
To ensure the reliability of the AI Safety Lab, we conducted empirical testing using real-world AI models and agents from past UNICC projects (Fall 2024 and Spring 2025). 

**Key Findings & Relevance:**
* **Successful Vulnerability Detection:** The system successfully identified known vulnerabilities, effectively flagging critical safety risks (e.g., **prompt injections, jailbreak attempts, and bias**) aligned with the OWASP LLM Top 10 and NIST AI RMF standards.
* **Effective Council Arbitration:** The multi-module ensemble demonstrated its ability to synthesize differing expert opinions (Safety, Governance, Contextual Risk) into actionable deployment verdicts (e.g., successfully approving compliant agents while rejecting vulnerable models).
* **Actionable Reporting:** The platform successfully generated comprehensive compliance audit reports for both models and agents, proving its readiness for enterprise deployment.

*For the full technical audits and detailed metrics, please refer to the documents located in the `test/` folder of this repository:*
* `test/UNICC_Testing_Valuation_Report.pdf` *(Demonstrates a REJECT verdict with detailed vulnerability detection logs)*
* `test/UNICC_Testing_Agent_Report.pdf` *(Demonstrates an APPROVE verdict for a compliant support agent)*

---

## Setup Instructions (Getting Started)

Follow these instructions to run the AI Safety Lab locally or on Replit.

### Prerequisites
* **Node.js** (v16.x or higher)
* **npm** or **yarn**
* An active **OpenAI API Key** (for the AI expert models)

### Step-by-step Local Installation

**1. Clone the repository**
```bash
git clone [https://github.com/Xiao-nyu-2026/UNICC-Safety-Lab-Xiao.git](https://github.com/Xiao-nyu-2026/UNICC-Safety-Lab-Xiao.git)
cd UNICC-Safety-Lab-Xiao
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure Environment Variables**
Create a `.env` file in the root directory of the project and add your API keys:
```env
OPENAI_API_KEY="sk-your-openai-api-key-here"
```
*(Note: If you are running this on Replit, use the **Secrets** tool to add `OPENAI_API_KEY` instead of creating a `.env` file.)*

**4. Start the development server**
```bash
npm run dev
# or `npm start` depending on your specific package.json script
```
The application will now be running at `http://localhost:3000` (or the port specified by Replit).

---

## Usage Examples

Once the application is running, follow these steps to evaluate an AI agent:

1. **Access the Dashboard:** Open your browser and navigate to the application URL.
2. **Input Agent Data:** On the main screen, input the system prompt or behavioral logs of the AI agent you wish to test.
3. **Run Evaluation:** Click the **"Run Safety Audit"** button. The system will concurrently call the three expert modules (Safety, Governance, Security).
4. **View Matrix:** Scroll to the "Council of Experts" matrix to view detailed breakdown scores, risk flags, and the final Arbiter Verdict (APPROVE/REVIEW/REJECT).
5. **Export Report:** Click the **"Export PDF Report"** button in the top right corner to download the formal 6-page compliance audit document.

---

## Contribution Guidelines

We welcome contributions to improve the UNICC AI Safety Lab! If you wish to contribute, please follow these steps:

1. **Fork the Repository:** Click the "Fork" button at the top right of this page.
2. **Create a Branch:** `git checkout -b feature/your-feature-name`
3. **Make your changes:** Implement your feature or bug fix.
4. **Commit your changes:** `git commit -m "Add some feature"`
5. **Push to the Branch:** `git push origin feature/your-feature-name`
6. **Open a Pull Request:** Navigate to the original repository and click "Compare & pull request".

Please ensure your code adheres to the existing styling and includes comments for complex integration logic.

---

## Team & Acknowledgments

- Project 1: Nadzeya Matseichyk
- Project 2: Shulan Gan
- Project 3: Lingxiao Xu

**Acknowledgments:**
- **Dr. Andres Fortino** - Clinical Associate Professor, NYU SPS (Project Sponsor)
- **Ms. Anusha Dandapani** - Center Director, UNICC (UN Sponsoring Executive)
- Developed for the NYU SPS M&T x UNICC Capstone Project.
