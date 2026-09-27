export const runbooksRepository = [
  {
    id: 'RB-PAY-04',
    title: 'Payment Database Connection & Pool Recovery',
    description: 'Scales HikariCP database connection pool capacity, applies read timeouts on external payment gateway HTTP calls, and flushes deadlock locks.',
    applicableServices: ['payment-gateway', 'database'],
    safetyLevel: 'SAFE_SANDBOXED_SIMULATION',
    steps: [
      '1. Scale HikariCP maximumPoolSize from 20 to 150 via container environment override',
      '2. Apply 3000ms read timeout on downstream Stripe/PayPal payment gateway calls',
      '3. Issue graceful rolling restart across payment-gateway microservice pods',
      '4. Verify database connection pool drop & monitor P99 latency'
    ],
    expectedResult: 'Database connections drop from 100/100 to < 25/100; error rate drops to < 0.5%.'
  },
  {
    id: 'RB-AUTH-09',
    title: 'Auth Service LRU Cache Patch & Rolling Restart',
    description: 'Hot-reloads JWKS key cache with quick-lru bounded eviction map and issues rolling pod restart to reclaim RSS heap memory.',
    applicableServices: ['auth-service'],
    safetyLevel: 'SAFE_SANDBOXED_SIMULATION',
    steps: [
      '1. Replace unbounded JWKS key cache with capped quick-lru eviction cache (1000 entries max)',
      '2. Trigger rolling restart across auth-service deployment (`kubectl rollout restart`)',
      '3. Increase container memory limit to 1Gi temporary buffer',
      '4. Monitor RSS heap memory stability'
    ],
    expectedResult: 'Pod OOMKilled crash loop stops; RSS memory stabilizes at ~35%.'
  },
  {
    id: 'RB-REDIS-02',
    title: 'Redis Mutex Lock & Single-Flight Cache Repopulation',
    description: 'Applies single-flight request coalescing on cache miss fallbacks and repopulates expired hot keys with TTL jitter.',
    applicableServices: ['redis-cluster', 'database'],
    safetyLevel: 'SAFE_SANDBOXED_SIMULATION',
    steps: [
      '1. Enable mutex single-flight coalescing on catalog service DB queries',
      '2. Manually repopulate hot cache keys with background CLI script',
      '3. Apply ±300s randomized jitter to cache TTL expirations',
      '4. Verify PostgreSQL primary DB CPU utilization'
    ],
    expectedResult: 'Database CPU utilization drops from 99% to < 30%; latency drops to < 20ms.'
  },
  {
    id: 'RB-LAT-05',
    title: 'Upstream Circuit Breaker & Rate Throttling',
    description: 'Enforces ingress rate limiting and enables circuit breaking on degraded downstream dependencies.',
    applicableServices: ['payment-gateway', 'auth-service'],
    safetyLevel: 'SAFE_SANDBOXED_SIMULATION',
    steps: [
      '1. Enable Resilience4j circuit breaker on external HTTP integrations',
      '2. Configure rate limiting buffer of 1000 req/sec per IP segment',
      '3. Flush active connection queues',
      '4. Verify request throughput stabilization'
    ],
    expectedResult: 'P99 latency drops to < 100ms; gateway timeouts eliminated.'
  },
  {
    id: 'RB-DEP-01',
    title: 'Automated Deployment Rollback to Previous Stable Release',
    description: 'Rolls back active deployment to previous known-good image version tag.',
    applicableServices: ['payment-gateway', 'auth-service', 'database'],
    safetyLevel: 'SAFE_SANDBOXED_SIMULATION',
    steps: [
      '1. Identify previous healthy image digest from deployment history',
      '2. Execute deployment rollback (`kubectl rollout undo deployment`)',
      '3. Verify microservice pod readiness probes',
      '4. Validate error rate normalization'
    ],
    expectedResult: 'Deployment version restored to previous stable release; error rate drops to 0%.'
  }
];

export function getRunbookById(id) {
  return runbooksRepository.find(r => r.id === id) || runbooksRepository[0];
}

export function getAllRunbooks() {
  return runbooksRepository;
}
