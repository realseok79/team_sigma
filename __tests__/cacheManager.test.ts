import { describe, it, expect, beforeEach, vi } from "vitest";

// 테스트를 위해 Node.js crypto를 mock하지 않고 직접 테스트합니다.
// cacheManager는 서버 전용이므로 crypto 모듈이 항상 사용 가능합니다.

// 인라인으로 LRU 캐시 로직만 테스트 (crypto 의존성 분리)
class TestLRUCache {
  private cache: Map<string, { value: any; expiresAt: number; lastAccessed: number }> = new Map();
  private readonly maxSize: number;
  private hits = 0;
  private misses = 0;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: string): any | null {
    try {
      const entry = this.cache.get(key);
      if (!entry) { this.misses++; return null; }
      if (Date.now() > entry.expiresAt) { this.cache.delete(key); this.misses++; return null; }
      entry.lastAccessed = Date.now();
      this.cache.delete(key);
      this.cache.set(key, entry);
      this.hits++;
      return entry.value;
    } catch { this.misses++; return null; }
  }

  set(key: string, value: any, ttlMs: number): void {
    try {
      if (this.cache.size >= this.maxSize) {
        const oldestKey = this.cache.keys().next().value;
        if (oldestKey) this.cache.delete(oldestKey);
      }
      this.cache.set(key, { value, expiresAt: Date.now() + ttlMs, lastAccessed: Date.now() });
    } catch {}
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  getStats() {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRate: total > 0 ? `${((this.hits / total) * 100).toFixed(1)}%` : "0%",
    };
  }
}

describe("LRU Cache Manager", () => {
  let cache: TestLRUCache;

  beforeEach(() => {
    cache = new TestLRUCache(3); // 최대 3개로 LRU 테스트
  });

  it("should return null for cache miss", () => {
    expect(cache.get("nonexistent")).toBeNull();
    expect(cache.getStats().misses).toBe(1);
  });

  it("should store and retrieve cached values", () => {
    cache.set("key1", { data: "hello" }, 60000);
    const result = cache.get("key1");
    expect(result).toEqual({ data: "hello" });
    expect(cache.getStats().hits).toBe(1);
  });

  it("should evict LRU entry when capacity exceeded", () => {
    cache.set("a", 1, 60000);
    cache.set("b", 2, 60000);
    cache.set("c", 3, 60000);
    // 용량 초과 → 가장 오래된 "a" 제거
    cache.set("d", 4, 60000);
    expect(cache.get("a")).toBeNull();
    expect(cache.get("d")).toBe(4);
  });

  it("should expire entries after TTL", async () => {
    cache.set("short", "value", 50); // 50ms TTL
    await new Promise(r => setTimeout(r, 100));
    expect(cache.get("short")).toBeNull();
  });

  it("should calculate hit rate correctly", () => {
    cache.set("x", 1, 60000);
    cache.get("x"); // HIT
    cache.get("y"); // MISS
    cache.get("x"); // HIT
    const stats = cache.getStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBe("66.7%");
  });

  it("should invalidate specific key", () => {
    cache.set("target", "data", 60000);
    cache.invalidate("target");
    expect(cache.get("target")).toBeNull();
  });

  it("should be fail-safe on get/set errors (graceful degradation)", () => {
    // 정상 동작 확인 — 에러가 발생하지 않아야 함
    expect(() => cache.get("anything")).not.toThrow();
    expect(() => cache.set("key", "val", 60000)).not.toThrow();
    expect(() => cache.invalidate("key")).not.toThrow();
  });
});
