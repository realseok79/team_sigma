/**
 * Team-Sigma: Cache Performance Benchmark
 * 캐싱 적용 전후의 응답 속도 차이를 수치로 기록합니다.
 * 
 * 사용법: npx tsx scripts/benchmark.ts
 * (서버가 localhost:3000에서 실행 중이어야 합니다)
 */

const BASE_URL = "http://localhost:3000";

interface BenchmarkResult {
  scenario: string;
  totalRequests: number;
  avgResponseMs: number;
  minResponseMs: number;
  maxResponseMs: number;
  p95ResponseMs: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: string;
}

async function measureRequest(url: string, body: any): Promise<{ durationMs: number; cacheStatus: string }> {
  const start = performance.now();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const durationMs = performance.now() - start;
    const cacheStatus = res.headers.get("X-Cache") || "N/A";
    await res.json(); // consume body
    return { durationMs, cacheStatus };
  } catch (error) {
    return { durationMs: performance.now() - start, cacheStatus: "ERROR" };
  }
}

function calcP95(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil(sorted.length * 0.95) - 1;
  return sorted[Math.max(0, idx)];
}

async function runScenario(
  name: string,
  url: string,
  bodies: any[],
  repeat: number = 1
): Promise<BenchmarkResult> {
  const durations: number[] = [];
  let hits = 0;
  let misses = 0;

  for (let r = 0; r < repeat; r++) {
    for (const body of bodies) {
      const result = await measureRequest(url, body);
      durations.push(result.durationMs);
      if (result.cacheStatus === "HIT") hits++;
      else if (result.cacheStatus === "MISS") misses++;
    }
  }

  const total = durations.length;
  const avg = durations.reduce((a, b) => a + b, 0) / total;
  const hitRate = total > 0 ? ((hits / total) * 100).toFixed(1) : "0";

  return {
    scenario: name,
    totalRequests: total,
    avgResponseMs: Math.round(avg),
    minResponseMs: Math.round(Math.min(...durations)),
    maxResponseMs: Math.round(Math.max(...durations)),
    p95ResponseMs: Math.round(calcP95(durations)),
    cacheHits: hits,
    cacheMisses: misses,
    hitRate: `${hitRate}%`,
  };
}

function printReport(results: BenchmarkResult[]) {
  console.log("\n" + "=".repeat(80));
  console.log("  📊 Team-Sigma Cache Performance Benchmark Report");
  console.log("=".repeat(80));
  console.log(`  시각: ${new Date().toISOString()}`);
  console.log(`  서버: ${BASE_URL}`);
  console.log("=".repeat(80) + "\n");

  // 테이블 헤더
  console.log(
    "┌─────────────────────────────────────┬────────┬─────────┬─────────┬─────────┬──────────┬──────────┐"
  );
  console.log(
    "│ Scenario                            │ Reqs   │ Avg(ms) │ Min(ms) │ P95(ms) │ Hit Rate │ Savings  │"
  );
  console.log(
    "├─────────────────────────────────────┼────────┼─────────┼─────────┼─────────┼──────────┼──────────┤"
  );

  for (const r of results) {
    // 자원 절감 예상: HIT 시 API 호출이 제거되므로 Gemini API 비용 및 서버 시간을 절약
    // 1 HIT = ~8초 서버 시간 절약 + 1 Gemini API 호출 절약
    const savedApiCalls = r.cacheHits;
    const savedTimeSeconds = Math.round(savedApiCalls * 8);
    const savingsLabel = savedApiCalls > 0 ? `~${savedTimeSeconds}s` : "-";

    console.log(
      `│ ${r.scenario.padEnd(35)} │ ${String(r.totalRequests).padStart(6)} │ ${String(r.avgResponseMs).padStart(7)} │ ${String(r.minResponseMs).padStart(7)} │ ${String(r.p95ResponseMs).padStart(7)} │ ${r.hitRate.padStart(8)} │ ${savingsLabel.padStart(8)} │`
    );
  }

  console.log(
    "└─────────────────────────────────────┴────────┴─────────┴─────────┴─────────┴──────────┴──────────┘"
  );

  // 요약
  const totalHits = results.reduce((a, r) => a + r.cacheHits, 0);
  const totalMisses = results.reduce((a, r) => a + r.cacheMisses, 0);
  const totalSavedSec = totalHits * 8;

  console.log("\n📋 요약:");
  console.log(`  • 전체 캐시 적중: ${totalHits}회 / 전체 요청: ${totalHits + totalMisses}회`);
  console.log(`  • 전체 적중률: ${totalHits + totalMisses > 0 ? ((totalHits / (totalHits + totalMisses)) * 100).toFixed(1) : 0}%`);
  console.log(`  • 예상 서버 자원 절감: ~${totalSavedSec}초 (Gemini API 호출 ${totalHits}건 생략)`);
  console.log(`  • 예상 비용 절감: 캐시 HIT당 Gemini API 1회 호출 비용 절약\n`);
}

async function main() {
  console.log("🚀 벤치마크 시작...\n");

  const results: BenchmarkResult[] = [];

  // 시나리오 1: 동일 프롬프트 반복 (캐시 적중 테스트)
  console.log("  [1/3] 동일 프롬프트 10회 반복 호출...");
  results.push(
    await runScenario(
      "동일 프롬프트 반복 (HIT 기대)",
      `${BASE_URL}/api/parse`,
      [{ prompt: "내일 오후 2시 팀 미팅" }],
      10
    )
  );

  // 시나리오 2: 서로 다른 프롬프트 (캐시 미스 테스트)
  console.log("  [2/3] 서로 다른 프롬프트 5개 호출...");
  results.push(
    await runScenario(
      "서로 다른 프롬프트 (MISS 기대)",
      `${BASE_URL}/api/parse`,
      [
        { prompt: "발표 자료 준비" },
        { prompt: "운동 30분" },
        { prompt: "코드 리뷰" },
        { prompt: "디자인 피드백" },
        { prompt: "장보기" },
      ],
      1
    )
  );

  // 시나리오 3: Split Task 동일 요청 반복
  console.log("  [3/3] Split Task 동일 요청 5회 반복...");
  results.push(
    await runScenario(
      "Split Task 반복 (HIT 기대)",
      `${BASE_URL}/api/split-task`,
      [{ taskTitle: "졸업 논문 작성", taskCategory: "문서", difficulty: 5 }],
      5
    )
  );

  printReport(results);
}

main().catch(console.error);
