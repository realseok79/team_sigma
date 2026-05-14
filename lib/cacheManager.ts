/**
 * Team-Sigma: Cache Manager
 * CacheProvider 인터페이스 기반의 LRU 인메모리 캐시.
 * 향후 Redis/Upstash로 교체 가능하도록 인터페이스가 분리되어 있습니다.
 */

import crypto from "crypto";

// ================================
// Cache Provider Interface
// ================================

export interface CacheProvider {
  get(key: string): any | null;
  set(key: string, value: any, ttlMs: number): void;
  invalidate(key: string): void;
  getStats(): CacheStats;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: string; // "85.2%"
}

// ================================
// LRU In-Memory Cache Implementation
// ================================

interface CacheEntry {
  value: any;
  expiresAt: number;
  lastAccessed: number;
}

class InMemoryLRUCache implements CacheProvider {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly maxSize: number;
  private hits = 0;
  private misses = 0;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: string): any | null {
    try {
      const entry = this.cache.get(key);

      if (!entry) {
        this.misses++;
        return null;
      }

      // TTL 만료 체크
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(key);
        this.misses++;
        return null;
      }

      // LRU: 접근 시간 갱신 (Map 순서 재배치)
      entry.lastAccessed = Date.now();
      this.cache.delete(key);
      this.cache.set(key, entry);

      this.hits++;
      return entry.value;
    } catch {
      // [Fail-safe] 캐시 읽기 실패 시 null 반환 → API는 정상 진행
      this.misses++;
      return null;
    }
  }

  set(key: string, value: any, ttlMs: number): void {
    try {
      // LRU: 용량 초과 시 가장 오래된 항목 제거
      if (this.cache.size >= this.maxSize) {
        const oldestKey = this.cache.keys().next().value;
        if (oldestKey) this.cache.delete(oldestKey);
      }

      this.cache.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
        lastAccessed: Date.now(),
      });
    } catch {
      // [Fail-safe] 캐시 쓰기 실패 시 무시 → API는 정상 진행
    }
  }

  invalidate(key: string): void {
    try {
      this.cache.delete(key);
    } catch {
      // [Fail-safe] 무시
    }
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRate: total > 0 ? `${((this.hits / total) * 100).toFixed(1)}%` : "0%",
    };
  }
}

// ================================
// Cache Key Generator (버전 포함)
// ================================

/**
 * 캐시 키를 생성합니다.
 * promptVersion을 포함하여 시스템 프롬프트가 변경되었을 때
 * 이전 캐시가 의도치 않게 반환되는 것을 방지합니다.
 *
 * @param prompt - 사용자 입력 텍스트
 * @param promptVersion - 시스템 프롬프트의 버전 식별자
 * @param params - 추가 파라미터 (model명, history 등)
 */
export function generateCacheKey(
  prompt: string,
  promptVersion: string,
  params?: Record<string, any>
): string {
  const raw = JSON.stringify({ prompt, promptVersion, params: params || {} });
  return crypto.createHash("sha256").update(raw).digest("hex");
}

// ================================
// Singleton Export
// ================================

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5분

// parseCache: AI 파싱 결과 캐시
export const parseCache = new InMemoryLRUCache(100);

// splitCache: AI 분할 결과 캐시
export const splitCache = new InMemoryLRUCache(50);

export { DEFAULT_TTL_MS };
