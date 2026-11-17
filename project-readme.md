# PROJECT BRIEF: MEDIGUARD
## AI-Powered Prescription Analysis & Medicine Verification Platform

I am planning to develop a software project called **MEDIGUARD**.

Before we begin development, I want you to understand the project thoroughly. This message is only for providing project context. **Do not start coding, generate files, create the application, install dependencies, or begin implementation yet.** For now, understand the concept, its requirements, and how its different components are intended to work together.

---

# 1. PROJECT OVERVIEW

MEDIGUARD is an AI-powered healthcare information and medicine verification platform.

The main idea is to help people understand handwritten medical prescriptions, learn about the medicines prescribed to them, and check whether the medicine they have purchased matches the information written in their doctor's prescription.

The project combines multiple technologies:

- Artificial Intelligence
- Computer Vision
- OCR and handwriting recognition
- Medicine information retrieval
- Image analysis
- QR code recognition
- Cryptographic hashing
- Blockchain-based record verification

We want to create a lightweight but functional prototype demonstrating how these technologies can work together in a single application.

This is not intended to be a complete healthcare infrastructure system or a commercial pharmaceutical verification network.

---

# 2. MAIN FEATURES

The application will have two primary features.

## FEATURE 1: AI PRESCRIPTION READER & MEDICINE INFORMATION

The user uploads an image of a handwritten prescription provided by their doctor.

The system should:

1. Accept an uploaded prescription image.
2. Process the image using computer vision techniques where useful.
3. Use an OCR or handwriting recognition model to extract the written text.
4. Identify possible medicine names from the extracted text.
5. Retrieve relevant information about the identified medicines.
6. Present the results in a structured and understandable format.

### Medicine information to display

For each identified medicine, the application should try to retrieve:

- Medicine name
- Generic name or active ingredient
- General medical uses
- Common side effects
- Important warnings and precautions
- Available strengths and dosage forms
- Available regulatory safety information
- Official safety alerts, recalls or test-lab findings, when reliable sources provide them

The information should be presented in a clean report format.

### Important AI behaviour

Handwritten prescriptions can be difficult to interpret.

The AI should:
- Show the medicine names it believes it has identified.
- Clearly indicate uncertain or unreadable text.
- Avoid inventing medicine names when recognition confidence is low.
- Distinguish extracted prescription text from information retrieved from external sources.

The system must not independently prescribe medicines, recommend dosage changes, diagnose illnesses, or declare a medicine safe for a particular person.

If the handwriting is unclear, the application should display an uncertainty warning. Users must not rely on uncertain AI recognition to select or take medication.

---

## FEATURE 2: PRESCRIPTION VS PURCHASED MEDICINE VERIFICATION

This is one of the most important features of MEDIGUARD.

The user should be able to upload two images:

1. The doctor's handwritten prescription.
2. A photograph of the medicine they purchased.

The AI will analyse both images and compare the available information.

### Comparison process

The system should attempt to identify and compare:

- Medicine name
- Generic name or active ingredient
- Medicine strength
- Dosage form, such as tablet, capsule or syrup
- Brand information
- Manufacturer information, when available

The system should then generate a comparison report.

### Possible results

**MATCH**

The available product information matches the extracted prescription details.

**PARTIAL MATCH**

Some information matches, but other information is missing, unclear or different.

**MISMATCH DETECTED**

An important medicine detail appears to differ.

**UNABLE TO VERIFY**

The uploaded images do not contain enough readable information to perform a meaningful comparison.

A brand-name difference alone should not automatically be classified as a mismatch. The active ingredient, strength and formulation are important comparison fields.

The application must not independently approve medicine substitutions or recommend that users take a different product.

---

# 3. MEDICINE AUTHENTICITY VERIFICATION

This feature will work alongside the second feature.

When a user uploads a medicine package, the application should attempt to extract:

- Product name
- Manufacturer
- Batch number
- Manufacturing date
- Expiry date
- QR code or product identifier

The extracted information can then be checked against a small sample medicine registry maintained by our application.

### Possible verification results

- Recognised product record
- Unknown product identifier
- Expired according to the printed expiry date
- Batch information mismatch
- Insufficient information

We do not intend to build a massive medicine database.

For the prototype, a small collection of approximately 10–20 fictional demonstration medicine records will be sufficient.

Use clearly labelled fictional data for demonstration purposes.

### Important limitation

An AI model cannot reliably prove that a physical medicine is genuine simply by looking at its packaging or tablet photograph.

The application should distinguish between:

- Visual information extracted from packaging.
- Information found in our sample database.
- Records registered by a manufacturer or supply-chain participant.
- Actual physical medicine authenticity, which this prototype cannot independently establish.

Never claim that a product has passed laboratory testing unless an actual, traceable laboratory report is available.

---

# 4. BLOCKCHAIN INTEGRATION

Blockchain will be an additional technical component supporting medicine batch traceability and record integrity.

We do not need to create a large public blockchain network or implement cryptocurrency.

Instead, we intend to develop a lightweight blockchain demonstration.

### Intended workflow

A sample pharmaceutical supply chain will contain three participants:

1. Manufacturer
2. Distributor
3. Pharmacy

The manufacturer registers a sample medicine batch.

The distributor records receiving the batch.

The pharmacy records receiving the batch.

Each event becomes part of a tamper-evident record history.

### Blockchain block structure

Each block should contain:

- Block index
- Timestamp
- Batch identifier
- Transaction information
- Previous block hash
- Current block hash

SHA-256 can be used to generate block hashes.

The application should provide a blockchain explorer where users can inspect the sample blocks and transactions.

### Integrity demonstration

The application should be able to demonstrate that modifying an earlier blockchain record causes subsequent hash validation to fail.

The blockchain component is intended to demonstrate:

- Distributed-ledger concepts
- Transaction recording
- Cryptographic hashing
- Chain integrity
- Medicine batch traceability

We will use a local demonstration blockchain rather than claiming integration with real pharmaceutical manufacturers.

Do not simply label ordinary database records as blockchain. The prototype should contain an actual hash-linked block structure with validation.

---

# 5. APPLICATION PAGES

The planned application will have the following pages:

### 1. Dashboard
An overview of the platform, its features and recent analysis activity.

### 2. Prescription Analysis
Allows users to upload handwritten prescriptions and receive AI-generated extraction results.

### 3. Medicine Information
Displays detailed information retrieved for identified medicines.

### 4. Prescription & Medicine Comparison
Allows users to upload a prescription and a purchased medicine image for comparison.

### 5. Medicine Authenticity Check
Displays extracted product and batch information and checks it against the sample registry.

### 6. Blockchain Explorer
Displays blocks, transactions, batch history and integrity validation results.

### 7. Analysis History
Displays previous analyses performed within the application.

These are the intended application sections, not a requirement to implement a complicated account-management system.

---

# 6. PROPOSED TECHNOLOGY STACK

The following technologies are preferred:

**Frontend**
- React
- Tailwind CSS

**Backend**
- Python
- FastAPI

**AI and image processing**
- Existing OCR or handwriting recognition models
- Computer vision models or services
- OpenCV for image preprocessing
- An AI model for organising and interpreting extracted text

**Database**
- SQLite initially, or PostgreSQL if necessary

**Blockchain and security**
- Python-based local blockchain implementation
- SHA-256 hashing
- QR code generation and recognition

Use existing models, APIs and libraries wherever practical. We do not intend to train an AI model from scratch.

The final technology choices can be evaluated later based on implementation complexity, availability and reliability.

---

# 7. PROJECT LIMITATIONS AND SCOPE

This is a school IT exhibition project.

We want a functional, visually impressive and technically meaningful prototype without building an entire commercial healthcare platform.

The following are explicitly outside the initial scope:

- A complete pharmaceutical medicine database.
- Training our own handwriting recognition model.
- Real hospital integrations.
- Real pharmacy integrations.
- A real pharmaceutical supply-chain network.
- Real-world manufacturer verification.
- A human doctor review workflow.
- Automatic medical diagnosis.
- Automatic prescription generation.
- Medication recommendations.
- Cryptocurrency or mining.
- A complicated public blockchain deployment.

Do not add unnecessary features that make the application significantly more complicated without improving its demonstration.

The priority is to make the core workflows functional.

---

# 8. EXPECTED PROJECT DEMONSTRATION

The final application should support this exhibition demonstration:

1. Upload a handwritten doctor's prescription.
2. Show the AI extracting possible medicine names.
3. Display medicine information, uses, side effects and available safety alerts.
4. Upload a photograph of a purchased medicine alongside the prescription.
5. Show a comparison of the prescribed and purchased medicine information.
6. Display the medicine's extracted batch information and sample registry result.
7. Open the blockchain explorer and show the corresponding batch records.
8. Demonstrate blockchain integrity validation and tampering detection using sample data.

The complete demonstration should take approximately 2–3 minutes.

---

# 9. DEVELOPMENT PHILOSOPHY

When development begins, follow these principles:

- Prioritise working functionality over unnecessary complexity.
- Keep the architecture modular.
- Use existing AI models instead of building everything from scratch.
- Keep the application responsive and visually polished.
- Make AI-generated information distinguishable from database-verified information.
- Use fictional demonstration records where real integrations are unavailable.
- Do not fabricate real-world verification or laboratory results.
- Make sure every major feature can be demonstrated reliably.
- Avoid building features that are not part of the agreed project scope.

The finished application should feel like one integrated product, not several unrelated technology demonstrations.

---

# 10. YOUR CURRENT TASK

For now, your only task is to understand and analyse the MEDIGUARD project.

Do not begin implementation.

After understanding this brief, respond with:

1. Your understanding of the project's overall purpose.
2. A summary of its two main features.
3. How the medicine authenticity and blockchain components fit into the application.
4. Your suggested technical architecture.
5. Any potential technical challenges you anticipate.
6. A suggested development order.

Wait for my approval before making any code changes or starting development.

**Project name: MEDIGUARD**

**Project category: AI, Computer Vision, Healthcare Technology and Blockchain**

**Primary objective: Build a lightweight AI-powered prescription analysis and medicine verification platform.**
