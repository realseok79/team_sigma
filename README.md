# Team-Sigma (planner + To do list)

Flow To-Do is a premium, advanced productivity timer and task management application built with Next.js and Tailwind CSS. It features a sleek, modern UI with integrated deep work timers, task history, and native dark mode support.

## 🚀 Features

- **LLM-Powered Intelligence**: Uses Gemini AI to understand natural language and extract complex task metadata.
- **Dynamic Action Dispatching**:
  - **CREATE_TASK**: Automatically classifies into **TO-DO** or **PLAN** with full parameter extraction (Difficulty, Priority, Time blocks).
  - **CHANGE_THEME**: Responds to system commands like "어둡게 해줘" or "라이트 모드로 변경" to control the UI.
- **Real-time AI Analysis**: Visual feedback with loading states while the AI analyzes user input.
- **Global State & Theme Management**: Persistent task state and system-wide dark mode support.
- **Modern UI/UX**: Premium aesthetics with status-specific badges and smooth transitions.

## 💡 Example Commands

- *"중요! 내일 오후 2시 발표 준비하기"* → 프레젠테이션 카테고리, 중요도 '상', TO-DO 추가.
- *"오후 3시부터 5시까지 미팅"* → PLAN 모드, 시작/종료 시간 자동 설정.
- *"눈부셔 다크모드"* → 시스템 테마 즉시 변경.

## 🛠 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/flow-todo.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📸 Design Inspiration

The UI design is based on the "Flow To-Do" design system, focusing on minimalist aesthetics and high-contrast typography.

## 📄 License

This project is licensed under the MIT License.
