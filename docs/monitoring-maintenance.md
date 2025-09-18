# Monitoring and Maintenance Guide for Firestore Indexes

## Overview

This guide provides comprehensive monitoring and maintenance procedures for the Firestore index implementation in the proposals system. It covers performance monitoring, preventive maintenance, and operational procedures.

## Monitoring Strategy

### Key Performance Indicators (KPIs)

#### 1. Query Performance Metrics

```javascript
// Target performance metrics
const PERFORMANCE_TARGETS = {
  apiResponseTime: {
    p50: '< 500ms',
    p95: '< 1500ms',
    p99: '< 3000ms'
  },
  databaseQueryTime: {
    p50: '< 200ms',
    p95: '< 800ms',
    p99: '< 2000ms'
  },
  errorRate: '< 0.1%',
  fallbackUsage: '< 5%'
};
```

#### 2. Index Health Metrics

- Index build status and completion time
- Index usage patterns and frequency
- Index size and storage consumption
- Query optimization effectiveness

#### 3. User Experience Metrics

- Proposal creation success rate
- Proposal retrieval latency
- User-specific query performance
- Authentication success rate

### Monitoring Tools and Dashboards

#### 1. Application Monitoring

```typescript
// Example monitoring configuration
interface MonitoringConfig {
  metrics: {
    // API endpoint monitoring
    '/api/proposals': {
      responseTime: { threshold: 2000, unit: 'ms' };
      errorRate: { threshold: 0.01, unit: 'percentage' };
      throughput: { threshold: 100, unit: 'requests/min' };
    };
    
    // Database operation monitoring
    'firestore.query': {
      latency: { threshold: 1000, unit: 'ms' };
      indexUsage: { threshold: 0.95, unit: 'percentage' };
      fallbackRate: { threshold: 0.05, unit: 'percentage' };
    };
  };
  
  alerts: {
    highLatency: { channels: ['email', 'slack'], severity: 'warning' };
    indexError: { channels: ['email', 'slack', 'pager'], severity: 'critical' };
    errorSpike: { channels: ['email', 'slack'], severity: 'warning' };
  };
}
```

#### 2. Firebase Console Monitoring

**Key Areas to Monitor:**
- Firestore > Usage tab: Query performance and costs
- Firestore > Indexes tab: Index status and build progress
- Authentication > Users tab: Authentication patterns
- Project Settings > Usage and billing: Resource consumption

#### 3. Custom Monitoring Dashboard

```javascript
// Example dashboard configuration
const DASHBOARD_CONFIG = {
  panels: [
    {
      title: 'API Response Times',
      type: 'timeseries',
      metrics: ['api.proposals.response_time.p50', 'api.proposals.response_time.p95'],
      timeRange: '24h'
    },
    {
      title: 'Index Usage',
      type: 'gauge',
      metrics: ['firestore.index.usage_rate'],
      threshold: { warning: 0.8, critical: 0.95 }
    },
    {
      title: 'Error Rates',
      type: 'stat',
      metrics: ['api.proposals.error_rate'],
      unit: 'percentage'
    },
    {
      title: 'Fallback Strategy Usage',
      type: 'timeseries',
      metrics: ['api.proposals.fallback.client_sort', 'api.proposals.fallback.simplified_query'],
      timeRange: '7d'
    }
  ]
};
```

### Alert Configuration

#### 1. Critical Alerts

```yaml
# Critical alerts requiring immediate attention
alerts:
  - name: "Index Missing Error"
    condition: "firestore.index.missing > 0"
    severity: "critical"
    channels: ["pager", "slack", "email"]
    description: "Required Firestore index is missing"
    runbook: "docs/firestore-index-troubleshooting.md#missing-index"
    
  - name: "High Error Rate"
    condition: "api.proposals.error_rate > 0.05"
    duration: "5m"
    severity: "critical"
    channels: ["pager", "slack"]
    description: "Proposals API error rate exceeds 5%"
    
  - name: "Database Connection Failure"
    condition: "firestore.connection.failed > 0"
    severity: "critical"
    channels: ["pager", "slack", "email"]
    description: "Unable to connect to Firestore database"
```

#### 2. Warning Alerts

```yaml
  - name: "High Response Time"
    condition: "api.proposals.response_time.p95 > 2000"
    duration: "10m"
    severity: "warning"
    channels: ["slack", "email"]
    description: "API response time is degraded"
    
  - name: "Fallback Strategy Usage"
    condition: "api.proposals.fallback.usage > 0.1"
    duration: "15m"
    severity: "warning"
    channels: ["slack"]
    description: "High usage of fallback query strategies"
    
  - name: "Index Build In Progress"
    condition: "firestore.index.building > 0"
    severity: "info"
    channels: ["slack"]
    description: "Firestore index build in progress"
```

## Maintenance Procedures

### Daily Maintenance

#### 1. Health Check Script

```bash
#!/bin/bash
# daily-health-check.sh

echo "=== Daily Proposals API Health Check ==="
echo "Date: $(date)"

# Check API endpoint health
echo "Checking API health..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $HEALTH_CHECK_TOKEN" \
  "$API_BASE_URL/api/proposals")

if [ "$HEALTH_STATUS" = "200" ]; then
  echo "✓ API endpoint healthy"
else
  echo "✗ API endpoint unhealthy (HTTP $HEALTH_STATUS)"
  exit 1
fi

# Check Firestore indexes
echo "Checking Firestore indexes..."
INDEX_STATUS=$(firebase firestore:indexes --json | jq -r '.[] | select(.state != "READY") | .state')

if [ -z "$INDEX_STATUS" ]; then
  echo "✓ All indexes ready"
else
  echo "⚠ Some indexes not ready: $INDEX_STATUS"
fi

# Check error rates
echo "Checking error rates..."
ERROR_RATE=$(curl -s "$MONITORING_API/error-rate/24h" | jq -r '.rate')

if (( $(echo "$ERROR_RATE < 0.01" | bc -l) )); then
  echo "✓ Error rate acceptable ($ERROR_RATE)"
else
  echo "⚠ High error rate: $ERROR_RATE"
fi

echo "=== Health check complete ==="
```

#### 2. Performance Review

```bash
#!/bin/bash
# daily-performance-review.sh

echo "=== Daily Performance Review ==="

# Get response time metrics
P50=$(curl -s "$MONITORING_API/response-time/p50/24h")
P95=$(curl -s "$MONITORING_API/response-time/p95/24h")
P99=$(curl -s "$MONITORING_API/response-time/p99/24h")

echo "Response Times (24h):"
echo "  P50: ${P50}ms"
echo "  P95: ${P95}ms"
echo "  P99: ${P99}ms"

# Check for performance degradation
if (( $(echo "$P95 > 2000" | bc -l) )); then
  echo "⚠ Performance degradation detected"
  echo "  Recommended actions:"
  echo "  - Check index usage"
  echo "  - Review query patterns"
  echo "  - Monitor fallback strategy usage"
fi

# Get fallback usage
FALLBACK_RATE=$(curl -s "$MONITORING_API/fallback-rate/24h")
echo "Fallback Strategy Usage: $FALLBACK_RATE"

if (( $(echo "$FALLBACK_RATE > 0.05" | bc -l) )); then
  echo "⚠ High fallback usage detected"
  echo "  Check for missing or building indexes"
fi
```

### Weekly Maintenance

#### 1. Index Performance Analysis

```bash
#!/bin/bash
# weekly-index-analysis.sh

echo "=== Weekly Index Performance Analysis ==="

# Get index usage statistics
firebase firestore:indexes --json > current-indexes.json

# Analyze index usage patterns
echo "Index Usage Analysis:"
jq -r '.[] | "\(.collectionGroup).\(.fields | map(.fieldPath) | join("_")): \(.state)"' current-indexes.json

# Check for unused indexes
echo "Checking for unused indexes..."
# This would require custom analytics to determine actual usage

# Review query patterns
echo "Query Pattern Analysis:"
echo "  Most common queries (last 7 days):"
# This would pull from application logs or monitoring system

# Performance trends
echo "Performance Trends (7 days):"
curl -s "$MONITORING_API/trends/7d" | jq -r '.response_time_trend'
```

#### 2. Capacity Planning

```bash
#!/bin/bash
# weekly-capacity-planning.sh

echo "=== Weekly Capacity Planning ==="

# Get storage usage
STORAGE_USAGE=$(firebase firestore:usage --json | jq -r '.storage.used')
STORAGE_LIMIT=$(firebase firestore:usage --json | jq -r '.storage.limit')

echo "Storage Usage: $STORAGE_USAGE / $STORAGE_LIMIT"

# Get query usage
QUERY_COUNT=$(firebase firestore:usage --json | jq -r '.queries.count')
echo "Query Count (last 7 days): $QUERY_COUNT"

# Predict growth
echo "Growth Analysis:"
echo "  Storage growth rate: [calculate from historical data]"
echo "  Query growth rate: [calculate from historical data]"
echo "  Projected capacity needs: [calculate projections]"
```

### Monthly Maintenance

#### 1. Comprehensive Index Review

```bash
#!/bin/bash
# monthly-index-review.sh

echo "=== Monthly Index Review ==="

# Backup current index configuration
firebase firestore:indexes > "backups/indexes-$(date +%Y%m).json"

# Compare with expected configuration
echo "Comparing current vs expected indexes..."
diff expected-indexes.json "backups/indexes-$(date +%Y%m).json" > index-diff.txt

if [ -s index-diff.txt ]; then
  echo "⚠ Index configuration differences found:"
  cat index-diff.txt
else
  echo "✓ Index configuration matches expected"
fi

# Analyze index efficiency
echo "Index Efficiency Analysis:"
echo "  Query performance improvements: [analyze metrics]"
echo "  Storage overhead: [calculate index storage costs]"
echo "  Maintenance overhead: [review build times and failures]"

# Recommendations
echo "Recommendations:"
echo "  - Indexes to optimize: [list based on analysis]"
echo "  - Indexes to remove: [list unused indexes]"
echo "  - New indexes needed: [based on query patterns]"
```

#### 2. Security and Compliance Review

```bash
#!/bin/bash
# monthly-security-review.sh

echo "=== Monthly Security Review ==="

# Check authentication patterns
echo "Authentication Analysis:"
echo "  Failed authentication attempts: [get from logs]"
echo "  Unusual access patterns: [analyze user behavior]"
echo "  Token expiration issues: [check auth errors]"

# Data access patterns
echo "Data Access Analysis:"
echo "  Cross-user data access attempts: [security violations]"
echo "  Bulk data access patterns: [potential data scraping]"
echo "  API abuse patterns: [rate limiting triggers]"

# Compliance check
echo "Compliance Status:"
echo "  Data retention policies: [check old data cleanup]"
echo "  Audit log completeness: [verify logging coverage]"
echo "  Privacy controls: [verify user data isolation]"
```

## Operational Procedures

### Index Management

#### 1. Adding New Indexes

```bash
#!/bin/bash
# add-new-index.sh

INDEX_DEFINITION=$1

if [ -z "$INDEX_DEFINITION" ]; then
  echo "Usage: $0 '<index-definition-json>'"
  exit 1
fi

echo "Adding new index..."
echo "Definition: $INDEX_DEFINITION"

# Add to index configuration
echo "$INDEX_DEFINITION" | jq '.' >> firestore.indexes.json

# Deploy to staging first
firebase use staging
firebase deploy --only firestore:indexes

echo "Index deployed to staging. Monitor build progress:"
echo "https://console.firebase.google.com/project/staging/firestore/indexes"

# Wait for confirmation before production deployment
read -p "Deploy to production? (y/N): " confirm
if [ "$confirm" = "y" ]; then
  firebase use production
  firebase deploy --only firestore:indexes
  echo "Index deployed to production"
fi
```

#### 2. Removing Unused Indexes

```bash
#!/bin/bash
# remove-unused-index.sh

INDEX_ID=$1

if [ -z "$INDEX_ID" ]; then
  echo "Usage: $0 <index-id>"
  exit 1
fi

echo "Removing index: $INDEX_ID"

# Confirm removal
read -p "Are you sure you want to remove this index? (y/N): " confirm
if [ "$confirm" != "y" ]; then
  echo "Cancelled"
  exit 0
fi

# Remove from staging first
firebase use staging
firebase firestore:indexes:delete "$INDEX_ID"

# Wait and then remove from production
read -p "Remove from production? (y/N): " confirm
if [ "$confirm" = "y" ]; then
  firebase use production
  firebase firestore:indexes:delete "$INDEX_ID"
  echo "Index removed from production"
fi
```

### Performance Optimization

#### 1. Query Optimization

```javascript
// Query optimization analysis
const analyzeQueryPerformance = async () => {
  const queries = await getSlowQueries();
  
  for (const query of queries) {
    console.log(`Analyzing query: ${query.pattern}`);
    
    // Check if proper indexes exist
    const requiredIndexes = analyzeRequiredIndexes(query);
    const existingIndexes = await getExistingIndexes();
    
    const missingIndexes = requiredIndexes.filter(
      required => !existingIndexes.some(existing => 
        indexMatches(existing, required)
      )
    );
    
    if (missingIndexes.length > 0) {
      console.log(`Missing indexes for query ${query.pattern}:`);
      missingIndexes.forEach(index => console.log(`  - ${index}`));
    }
    
    // Suggest optimizations
    const optimizations = suggestOptimizations(query);
    if (optimizations.length > 0) {
      console.log(`Optimization suggestions:`);
      optimizations.forEach(opt => console.log(`  - ${opt}`));
    }
  }
};
```

#### 2. Fallback Strategy Optimization

```javascript
// Optimize fallback strategies based on usage patterns
const optimizeFallbackStrategies = async () => {
  const fallbackUsage = await getFallbackUsageStats();
  
  // Identify frequently used fallbacks
  const frequentFallbacks = fallbackUsage.filter(
    usage => usage.frequency > 0.1 // More than 10% of queries
  );
  
  for (const fallback of frequentFallbacks) {
    console.log(`High fallback usage: ${fallback.type}`);
    console.log(`Frequency: ${fallback.frequency * 100}%`);
    console.log(`Performance impact: ${fallback.performanceImpact}`);
    
    // Suggest creating proper indexes
    if (fallback.type === 'CLIENT_SORT') {
      console.log('Recommendation: Create composite index for sorting');
    } else if (fallback.type === 'SIMPLIFIED_QUERY') {
      console.log('Recommendation: Create index for complex filters');
    }
  }
};
```

### Incident Response

#### 1. Index Error Response

```bash
#!/bin/bash
# index-error-response.sh

echo "=== Index Error Incident Response ==="

# Step 1: Assess impact
echo "1. Assessing impact..."
ERROR_RATE=$(curl -s "$MONITORING_API/error-rate/1h")
AFFECTED_USERS=$(curl -s "$MONITORING_API/affected-users/1h")

echo "Current error rate: $ERROR_RATE"
echo "Affected users: $AFFECTED_USERS"

# Step 2: Check index status
echo "2. Checking index status..."
firebase firestore:indexes | grep -E "(Building|Error|Failed)"

# Step 3: Implement immediate mitigation
echo "3. Implementing mitigation..."
echo "Fallback strategies should be active automatically"
echo "Monitor fallback usage: $MONITORING_API/fallback-rate/realtime"

# Step 4: Create missing indexes
echo "4. Creating missing indexes..."
echo "Check error logs for specific index requirements"
echo "Use Firebase Console quick-create links from error messages"

# Step 5: Monitor recovery
echo "5. Monitoring recovery..."
echo "Watch for error rate decrease and index build completion"
```

#### 2. Performance Degradation Response

```bash
#!/bin/bash
# performance-degradation-response.sh

echo "=== Performance Degradation Response ==="

# Identify root cause
echo "1. Identifying root cause..."
CURRENT_P95=$(curl -s "$MONITORING_API/response-time/p95/1h")
BASELINE_P95=$(curl -s "$MONITORING_API/response-time/p95/24h")

echo "Current P95: ${CURRENT_P95}ms"
echo "24h baseline P95: ${BASELINE_P95}ms"

# Check for index issues
echo "2. Checking for index issues..."
FALLBACK_RATE=$(curl -s "$MONITORING_API/fallback-rate/1h")
echo "Current fallback rate: $FALLBACK_RATE"

if (( $(echo "$FALLBACK_RATE > 0.1" | bc -l) )); then
  echo "⚠ High fallback usage detected - likely index issue"
  firebase firestore:indexes | grep -v "Enabled"
fi

# Check for load issues
echo "3. Checking load patterns..."
REQUEST_RATE=$(curl -s "$MONITORING_API/request-rate/1h")
echo "Current request rate: $REQUEST_RATE req/min"

# Implement mitigation
echo "4. Implementing mitigation..."
echo "- Monitor fallback strategies"
echo "- Consider temporary rate limiting if needed"
echo "- Scale infrastructure if load-related"
```

## Reporting and Documentation

### Daily Reports

```bash
#!/bin/bash
# generate-daily-report.sh

cat << EOF > "reports/daily-$(date +%Y%m%d).md"
# Daily Proposals API Report - $(date +%Y-%m-%d)

## Summary
- API Health: $(curl -s "$MONITORING_API/health")
- Error Rate: $(curl -s "$MONITORING_API/error-rate/24h")
- Average Response Time: $(curl -s "$MONITORING_API/response-time/avg/24h")ms

## Index Status
$(firebase firestore:indexes | grep -E "(Building|Error|Failed)" || echo "All indexes healthy")

## Performance Metrics
- P50 Response Time: $(curl -s "$MONITORING_API/response-time/p50/24h")ms
- P95 Response Time: $(curl -s "$MONITORING_API/response-time/p95/24h")ms
- Fallback Usage: $(curl -s "$MONITORING_API/fallback-rate/24h")

## Issues
$(curl -s "$MONITORING_API/issues/24h" || echo "No issues reported")

## Actions Taken
- Routine health checks completed
- Performance metrics reviewed
- No manual interventions required
EOF
```

### Weekly Reports

```bash
#!/bin/bash
# generate-weekly-report.sh

cat << EOF > "reports/weekly-$(date +%Y%W).md"
# Weekly Proposals API Report - Week $(date +%W), $(date +%Y)

## Performance Summary
- Average Response Time: $(curl -s "$MONITORING_API/response-time/avg/7d")ms
- Error Rate: $(curl -s "$MONITORING_API/error-rate/7d")
- Uptime: $(curl -s "$MONITORING_API/uptime/7d")

## Index Performance
- Index Usage Efficiency: $(curl -s "$MONITORING_API/index-efficiency/7d")
- Fallback Strategy Usage: $(curl -s "$MONITORING_API/fallback-rate/7d")
- Query Optimization Opportunities: [Manual analysis required]

## Capacity Metrics
- Storage Usage Growth: [Calculate from metrics]
- Query Volume Growth: [Calculate from metrics]
- Projected Capacity Needs: [Analysis required]

## Maintenance Activities
- Indexes reviewed: $(date +%Y-%m-%d)
- Performance optimization: [List activities]
- Security review: [List findings]

## Recommendations
- [List optimization recommendations]
- [List capacity planning recommendations]
- [List security recommendations]
EOF
```

## Best Practices

### 1. Proactive Monitoring

- Set up comprehensive alerting before issues occur
- Monitor trends, not just current values
- Use multiple monitoring tools for redundancy
- Regular review of monitoring effectiveness

### 2. Preventive Maintenance

- Regular index performance reviews
- Proactive capacity planning
- Security audits and compliance checks
- Documentation updates and team training

### 3. Incident Management

- Clear escalation procedures
- Documented response playbooks
- Post-incident reviews and improvements
- Communication plans for stakeholders

### 4. Continuous Improvement

- Regular review of monitoring and alerting
- Performance optimization based on data
- Process improvements from lessons learned
- Team knowledge sharing and training