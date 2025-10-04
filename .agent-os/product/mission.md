# Product Mission

## Pitch

Saxarok is an AI-powered Telegram bot tutor that helps salon depilation specialists master their craft by providing instant, contextual training and answers through conversational AI with customizable prompts managed via a web dashboard.

## Users

### Primary Customers

- **Salon Owners/Managers**: Need to train staff efficiently without constant supervisor presence
- **Depilation Specialists**: Seeking to improve techniques, learn protocols, and get instant answers during work

### User Personas

**Marina, Depilation Specialist** (25-35 years old)
- **Role:** Junior/Mid-level Depilation Specialist
- **Context:** Works in a busy salon, handles 5-8 clients daily, needs to stay updated on techniques and products
- **Pain Points:** 
  - Supervisor not always available for questions
  - Difficulty remembering all protocols and safety procedures
  - Needs quick answers during work hours
  - Limited time for formal training sessions
- **Goals:** 
  - Improve technique quality
  - Provide better client consultations
  - Build confidence in handling complex cases
  - Learn about new products and methods

**Anna, Salon Owner** (35-50 years old)
- **Role:** Salon Owner/Manager
- **Context:** Manages 3-7 specialists, responsible for training quality and service standards
- **Pain Points:**
  - Time-consuming to answer repetitive questions from staff
  - Inconsistent knowledge across team members
  - Difficult to scale training as salon grows
  - Need to maintain service quality standards
- **Goals:**
  - Reduce training time overhead
  - Ensure consistent knowledge across all specialists
  - Track what questions staff are asking
  - Maintain high service quality standards

## The Problem

### Inefficient Knowledge Transfer

Traditional salon training relies on shadowing experienced specialists and periodic group sessions. This results in inconsistent knowledge, frequent interruptions to supervisors for basic questions, and difficulty scaling as the business grows. Staff spend ~30-45 minutes daily asking questions or searching for information.

**Our Solution:** AI tutor available 24/7 in Telegram provides instant, accurate answers based on salon's specific protocols and training materials.

### Limited Personalized Training

Generic depilation courses don't address salon-specific protocols, products, or client handling approaches. New specialists take 2-3 months to reach full productivity, and experienced staff struggle to stay updated on new techniques.

**Our Solution:** Customizable AI prompts allow salon owners to train the bot on their specific methods, products, and standards, providing personalized guidance.

### No Training Analytics

Salon owners have no visibility into what knowledge gaps exist across their team or which topics require additional training focus.

**Our Solution:** Web dashboard with conversation history allows managers to identify common questions and knowledge gaps, informing targeted training efforts.

## Differentiators

### Telegram-Native Experience

Unlike web-based training platforms that require logging in and navigating complex interfaces, our bot lives in Telegram where specialists already spend time. This results in 5x higher engagement and instant access without app switching.

### Customizable Training Prompts

Unlike generic AI chatbots (ChatGPT, Claude), salon owners can create and switch between specialized training prompts for different topics (waxing techniques, laser procedures, client consultations, safety protocols), ensuring responses align with salon's specific methods.

### File-Based Simplicity

Unlike enterprise solutions requiring database setup and IT infrastructure, our system uses simple file storage deployed on Railway. Setup takes 15 minutes versus days/weeks for traditional solutions, with zero maintenance overhead.

## Key Features

### Core Features

- **AI-Powered Conversations:** Contextual responses using Google Gemini AI that remembers conversation history for natural back-and-forth learning
- **Telegram Bot Interface:** Native Telegram integration for instant access where specialists already communicate
- **Conversation Memory:** Maintains context across sessions with last 20 messages automatically included for coherent discussions
- **File-Based Storage:** Simple JSON file persistence for conversation history and prompts without database complexity

### Training Management Features

- **Custom Prompt Creation:** Web dashboard to create topic-specific training prompts (waxing, laser, consultations, safety)
- **Active Prompt Switching:** Instantly change bot's training focus by activating different prompts
- **Prompt Editing:** Update training content as techniques, products, or protocols evolve
- **Multi-Prompt Management:** Organize multiple specialized prompts for different training scenarios

### Analytics & Oversight Features

- **Conversation History Viewer:** Web dashboard showing all employee-bot conversations with timestamps
- **User Activity Overview:** See which employees are using the tutor and how frequently
- **Knowledge Gap Identification:** Review common questions to identify training needs
- **Quality Assurance:** Verify bot is providing accurate, helpful responses aligned with salon standards
