<div align="center">

# 🧠 Team-Sigma: Adaptive Task Manager

**"할 일을 기록하는 것이 아니라, 행동을 바꾸는 도구."**

사용자의 지연·회피 패턴을 학습하고, 수학적 모델과 AI가 협력하여<br/>
정말로 지금 해야 할 일을 스스로 떠올려 주는 적응형 태스크 매니저.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=google)](https://ai.google.dev/)
[![TDD](https://img.shields.io/badge/Tests-14_passed-brightgreen?logo=vitest)](https://vitest.dev/)

</div>

---

## 📌 문제 인식: 왜 To-Do List는 실패하는가

우리는 하루 평균 **35,000번의 결정**을 내립니다. 그 속에서 "무엇을 먼저 해야 하는가"라는 질문은 가장 에너지를 많이 소모하는 결정 중 하나입니다. 기존의 To-Do 앱은 이 문제를 해결하지 못합니다. 할 일을 **기록**할 수는 있지만, **결정**을 도와주지는 않기 때문입니다.

### 기존 도구의 한계

| 현상 | 심리학적 원인 | 기존 앱의 대응 |
|------|-------------|--------------|
| 가장 중요한 일을 계속 미룬다 | **심리적 회피** — 난이도가 높을수록 시작 자체를 꺼린다 | ❌ 없음 |
| 할 일이 많을수록 아무것도 못 한다 | **결정 장애(Decision Paralysis)** — 선택지 과부하 | ❌ 수동 정렬뿐 |
| 매일 같은 항목이 남아 있다 | **완벽주의 루프** — "제대로 할 수 있을 때" 기다림 | ❌ 감지 불가 |

### 우리의 해결책

> **Team-Sigma**는 단순한 기록 도구가 아니라, 사용자의 **행동 데이터**를 실시간으로 분석하여 뇌의 결정 부하를 줄여주는 **'적응형 태스크 매니저(Adaptive Task Manager)'** 입니다.

- 📊 사용자가 어떤 작업을 **몇 번 미뤘는지**, **얼마나 오래 들여다봤는지** 추적합니다.
- 🧮 이 데이터를 수학적 공식에 넣어 **지금 해야 할 일의 순서**를 자동으로 재배치합니다.
- 🤖 계속 미루는 '악성 태스크'를 AI가 감지하고, **작은 단위로 쪼개는 제안**을 합니다.

---

## 🏗 아키텍처: 전략 패턴 (Strategy Pattern)

정렬 알고리즘을 하나의 클래스에 고정하지 않고, **전략 패턴(Strategy Pattern)** 으로 분리하여 런타임에 동적으로 교체할 수 있도록 설계했습니다.

```
┌──────────────────────────────────────────┐
│            SortingStrategy               │  ◀── 인터페이스
│  + sort(tasks: Task[]): Task[]           │
└──────────────┬───────────────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌──────────────┐  ┌──────────────────────┐
│   Default    │  │     Adaptive         │
│  (마감일 순)  │  │ (데이터 기반 $S(t)$) │
└──────────────┘  └──────────────────────┘
```

사용자는 UI 토글 한 번으로 기본 정렬 ↔ AI 적응형 정렬을 전환할 수 있으며, 시스템은 어떤 전략이든 동일한 인터페이스로 처리합니다.

---

## 📐 핵심 알고리즘: 우선순위 산출 공식

### 공식 정의

임의의 태스크 $t$에 대해 우선순위 점수를 다음과 같이 산출합니다:

$$S(t) = \alpha \cdot D(t) + \beta \cdot \frac{C(t)}{T(t) + \epsilon} + \gamma \cdot A(t)$$

### 각 변수의 의미 (실생활 연결)

| 변수 | 수학적 의미 | 실생활 해석 | 예시 |
|------|-----------|-----------|------|
| $D(t)$ | 지연 횟수 (deferCount) | "이 일을 몇 번이나 내일로 미뤘는가" | 5번 미룬 운동 → 점수 급상승 |
| $C(t)$ | 난이도 (difficulty, 1~5) | "이 일이 얼마나 어렵게 느껴지는가" | 논문 작성 = 5점 |
| $T(t)$ | 체류 시간 (detailPageStayTime) | "이 일을 얼마나 오래 들여다봤는가" | 30초 보고 닫음 = 심리적 장벽 |
| $A(t)$ | AI 우선순위 점수 (priority → 수치) | "AI가 판단한 긴급도" | high=3, medium=2, low=1 |
| $\epsilon$ | 분모 보정값 (0.001) | 체류 시간이 0일 때 분모가 0이 되는 것을 방지 | — |

### 가중치 ($\alpha$, $\beta$, $\gamma$)

| 가중치 | 기본값 | 역할 |
|--------|--------|------|
| $\alpha$ | 10 | 미룬 횟수를 가장 무겁게 반영 — "자꾸 미루는 일이 곧 급한 일" |
| $\beta$ | 5 | 어렵지만 안 보는 작업을 끌어올림 — "회피하는 일일수록 먼저" |
| $\gamma$ | 2 | AI 판단을 보조적으로 활용 |

### 왜 이 공식이 효과적인가

> **핵심 통찰**: 사람들은 어려운 일을 피할수록 그 일을 **더 짧게** 들여다봅니다.
> 난이도($C$)가 높은데 체류 시간($T$)이 0에 가까우면, $\frac{C}{T+\epsilon}$ 값이 폭발적으로 커집니다.
> 즉, **"어렵고 + 안 보는 일"이 자동으로 최상단에 올라옵니다.** 이것이 '개구리를 먼저 먹어라(Eat the Frog)' 원칙의 수학적 구현입니다.

### 데이터 흐름도

```mermaid
flowchart LR
    A["👤 사용자 행동"] --> B["📊 데이터 수집"]
    B --> C["🧮 Scoring Engine<br/>S(t) = αD + β(C/T+ε) + γA"]
    C --> D["📋 동적 순위 재배치"]
    D --> E["🖥 UI 실시간 반영"]
    
    B --> |"지연 횟수 (D)"| C
    B --> |"체류 시간 (T)"| C
    B --> |"난이도 (C)"| C
    
    style C fill:#f59e0b,stroke:#d97706,color:#000
```

---

## 🐸 악성 태스크 감지 & AI 분할

### 감지 기준

시스템은 다음 조건 중 하나라도 충족하면 해당 태스크를 **'Stuck(악성)'** 상태로 분류합니다:

| 조건 | 기준 | 심리학적 근거 |
|------|------|-------------|
| 과도한 지연 | `deferCount ≥ 5` | 5번 이상 미룬 일은 의지의 문제가 아닌 **구조의 문제** |
| 장기 방치 | 생성 후 `7일` 경과 | 일주일간 손대지 않은 일은 현재 형태로는 실행 불가능 |
| 조기 감지 | 난이도 `≥ 4` + 체류 시간 `0` + `3일` 경과 | 어렵고 쳐다보지도 않는 일 = **심리적 장벽** |

### AI 생산성 코치

Stuck 태스크가 감지되면, AI가 **'생산성 코치'** 역할로 개입합니다:

```
⚠️ 이 작업이 계속 미뤄지고 있네요. 작은 단위로 쪼개볼까요?

    [나중에]  [태스크 분할하기]
```

AI 코치는 냉소적으로 재촉하는 것이 아니라, 사용자의 회피 심리에 **공감하면서도 구체적인 해결책을 제시하는 파트너**의 톤을 유지합니다.

- ❌ ~~"이 일을 왜 아직도 안 했나요?"~~
- ✅ **"이 작업이 계속 미뤄지고 있네요. 혹시 시작이 어려운 건 아닐까요? 작은 단위로 쪼개면 첫 발을 내딛기 훨씬 수월해집니다."**

분할 시, AI는 다음 원칙을 준수합니다:
- 각 하위 태스크는 **30분 이내**에 완료 가능한 단위
- **구체적인 행동 동사**로 시작 (예: "조사하다", "작성하다")
- 모든 하위 태스크의 합이 **원본 범위를 벗어나지 않도록** 구성

### 거절 방어 (Cool-off)

사용자가 "나중에"를 선택하면, **24시간 동안** 해당 태스크에 대한 알림이 억제됩니다.
끊임없이 재촉하는 앱은 오히려 사용자의 이탈을 유발하기 때문입니다.

---

## ⚡ 성능 최적화: 캐싱 아키텍처

### 서버: AI 응답 캐시 (Fail-safe LRU)

```
[요청] → Cache 조회 ─── HIT ──→ 즉시 반환 (~5ms)
                    │
                    └── MISS ──→ Gemini API 호출 (~8s) → 결과 캐싱 → 반환
```

| 설계 원칙 | 구현 |
|----------|------|
| **버전 관리** | `PROMPT_VERSION`을 캐시 키에 포함 → 프롬프트 수정 시 과거 캐시 자동 무효화 |
| **Fail-safe** | 캐시 읽기/쓰기 실패 시에도 API 응답은 정상 진행 (서버리스 대비) |
| **확장성** | `CacheProvider` 인터페이스 → 향후 Redis/Upstash 교체 용이 |

### 클라이언트: 정렬 메모이제이션

태스크 배열의 **실질적 변경 여부**를 핑거프린트로 감지하여, 불필요한 고비용 정렬 연산을 제거합니다.

```typescript
// 정렬에 영향을 주는 필드만으로 서명 생성
const taskFingerprint = useMemo(() =>
  tasks.map(t => `${t.id}:${t.status}:${t.deferCount}:${t.difficulty}:...`).join('|'),
  [state.tasks]
);

// 핑거프린트가 동일하면 이전 정렬 결과를 재사용
const sortedTasks = useMemo(() => strategy.sort(tasks), [taskFingerprint, ...]);
```

---

## 🔮 미래 확장: Adaptive Planner로의 진화

현재의 Team-Sigma는 **To-Do 매니저**이지만, 데이터 구조는 이미 **Planner로의 확장**을 염두에 두고 설계되었습니다.

### 의도된 구조 (Planned Architecture)

| 현재 필드 | 현재 용도 | 미래 확장 |
|----------|----------|----------|
| `startTime` / `endTime` | PLAN 모드 시간 표시 | → **Time-Blocking** 캘린더 뷰 |
| `difficulty` (1~5) | 우선순위 공식 변수 | → **에너지 레벨 매칭** (고난도 = 오전, 저난도 = 오후) |
| `estimatedTime` | 예상 소요 시간 표시 | → **자동 일정 배치** (빈 시간 슬롯에 삽입) |
| `detailPageStayTime` | 회피 감지용 | → **집중도 분석** 및 포모도로 연동 |
| `deferCount` | Stuck 판별 | → **주간 생산성 리포트** 소스 데이터 |

### 로드맵

```mermaid
graph LR
    A["📋 Phase 1<br/>Adaptive To-Do<br/>(현재)"] --> B["📅 Phase 2<br/>Time-Blocking<br/>Planner"]
    B --> C["🔋 Phase 3<br/>에너지 기반<br/>스케줄링"]
    C --> D["📆 Phase 4<br/>캘린더 동기화<br/>(Google/Apple)"]
    
    style A fill:#10b981,stroke:#059669,color:#fff
    style B fill:#6366f1,stroke:#4f46e5,color:#fff
    style C fill:#f59e0b,stroke:#d97706,color:#fff
    style D fill:#ec4899,stroke:#db2777,color:#fff
```

**Phase 2 — Time-Blocking Planner**
- PLAN 모드의 `startTime`/`endTime`을 활용한 드래그 앤 드롭 캘린더 뷰
- 예상 소요 시간(`estimatedTime`)으로 빈 시간 슬롯에 자동 배치 제안

**Phase 3 — 에너지 기반 스케줄링**
- 시간대별 사용자의 작업 완료율을 분석하여 '집중력 피크 타임'을 학습
- 고난도 작업은 피크 타임에, 저난도 루틴은 에너지 저하 시간대에 자동 배치

**Phase 4 — 캘린더 동기화**
- Google Calendar / Apple Calendar 양방향 동기화
- 외부 일정과 Team-Sigma 태스크의 충돌 감지 및 자동 리스케줄링

---

## 🛠 기술 스택

| 영역 | 기술 |
|------|------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **AI Engine** | Google Gemini 2.5 Flash |
| **Testing** | Vitest + Testing Library |
| **Icons** | Lucide React |
| **State** | React Context + useReducer |
| **Caching** | In-Memory LRU (CacheProvider Interface) |

---

## 🏁 시작하기

### Prerequisites

- Node.js 18+
- Gemini API Key ([발급하기](https://ai.google.dev/))

### Installation

```bash
# 1. 저장소 클론
git clone https://github.com/realseok79/team_sigma.git

# 2. 의존성 설치
cd team_sigma && npm install

# 3. 환경 변수 설정
echo "GEMINI_API_KEY=your_api_key_here" > .env

# 4. 개발 서버 실행
npm run dev
```

### 테스트 실행

```bash
# 전체 테스트 실행 (14개)
npx vitest run

# 캐시 성능 벤치마크 (서버 실행 필요)
npx tsx scripts/benchmark.ts
```

---

## 💡 사용 예시

| 입력 | 결과 |
|------|------|
| `"중요! 내일 오후 2시 발표 준비하기"` | 📌 프레젠테이션 카테고리, 우선순위 HIGH, TO-DO |
| `"오후 3시부터 5시까지 미팅"` | 📅 PLAN 모드, 시작/종료 시간 자동 설정 |
| `"어둡게 해줘"` | 🌙 다크 모드 즉시 전환 |

---

## 📂 프로젝트 구조

```
team_sigma/
├── app/
│   ├── api/
│   │   ├── parse/          # AI 자연어 파싱 API (캐싱 적용)
│   │   └── split-task/     # AI 태스크 분할 API (캐싱 적용)
│   ├── layout.tsx
│   └── page.tsx            # 메인 화면
├── lib/
│   ├── sorting/
│   │   ├── SortingStrategy.ts        # 전략 패턴 인터페이스
│   │   ├── DefaultSortingStrategy.ts # 마감일 기반 정렬
│   │   └── AdaptiveSortingStrategy.ts # S(t) 공식 기반 정렬
│   ├── cacheManager.ts     # CacheProvider + LRU 캐시
│   ├── stuckTaskEngine.ts  # 악성 태스크 감지 엔진
│   ├── categoryEngine.ts   # 한국어 키워드 기반 분류
│   └── userHistory.ts      # 난이도 학습 이력 관리
├── context/
│   └── TaskContext.tsx      # 전역 상태 관리 (useReducer)
├── components/
│   ├── TaskCard.tsx         # 태스크 카드 (Stuck UI 포함)
│   └── NotificationManager.tsx # 알림 및 Stuck 감지
├── __tests__/               # TDD 테스트 (14개)
├── scripts/
│   └── benchmark.ts         # 캐시 성능 벤치마크
└── types.ts                 # 핵심 타입 정의
```

---

## 📄 License

This project is licensed under the MIT License.
