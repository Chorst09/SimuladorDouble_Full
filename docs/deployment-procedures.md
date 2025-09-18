# Deployment Procedures for Proposals Firestore Index Fix

## Overview

This document outlines the deployment procedures for the Firestore index fix implementation, including pre-deployment checks, deployment steps, and post-deployment verification.

## Pre-Deployment Checklist

### 1. Environment Verification

- [ ] Firebase project configured correctly
- [ ] Service account credentials available
- [ ] Environment variables set in deployment environment
- [ ] Firestore database initialized

### 2. Code Review

- [ ] All code changes reviewed and approved
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Security review completed

### 3. Index Configuration

- [ ] `firestore.indexes.json` updated with required indexes
- [ ] Index configuration validated
- [ ] Backup of current index configuration created

### 4. Dependencies

- [ ] All npm dependencies updated
- [ ] Firebase CLI installed and configured
- [ ] Deployment tools available

## Deployment Steps

### Step 1: Backup Current State

```bash
# Backup current Firestore indexes
firebase firestore:indexes > backup-indexes-$(date +%Y%m%d-%H%M%S).json

# Backup current application code
git tag -a "pre-index-fix-$(date +%Y%m%d)" -m "Backup before index fix deployment"
git push origin --tags
```

### Step 2: Deploy Firestore Indexes

```bash
# Deploy indexes to staging first
firebase use staging
firebase deploy --only firestore:indexes

# Verify indexes in staging
firebase firestore:indexes

# Deploy indexes to production
firebase use production
firebase deploy --only firestore:indexes
```

### Step 3: Monitor Index Build Progress

```bash
# Check index build status
firebase firestore:indexes

# Monitor in Firebase Console
# Navigate to: Firestore > Indexes
# Wait for all indexes to show "Enabled" status
```

### Step 4: Deploy Application Code

```bash
# Deploy to staging environment
npm run build
npm run deploy:staging

# Run smoke tests
npm run test:smoke:staging

# Deploy to production
npm run deploy:production
```

### Step 5: Verify Deployment

```bash
# Run integration tests against production
npm run test:integration:production

# Check application health
curl -H "Authorization: Bearer $TEST_TOKEN" \
     https://your-app.com/api/proposals

# Monitor error rates
# Check application logs
# Verify monitoring dashboards
```

## Index Deployment Details

### Required Indexes

The following indexes must be deployed:

```json
{
  "indexes": [
    {
      "collectionGroup": "proposals",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdBy", "order": "ASCENDING" },
        { "fieldPath": "baseId", "order": "ASCENDING" },
        { "fieldPath": "__name__", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "proposals",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdBy", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "proposals",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "createdBy", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### Index Build Time Estimates

| Index Type | Estimated Build Time | Data Size Dependency |
|------------|---------------------|---------------------|
| Simple composite (2 fields) | 5-15 minutes | Low |
| Complex composite (3+ fields) | 15-45 minutes | Medium |
| Large dataset indexes | 1-4 hours | High |

### Monitoring Index Build

```bash
# Command line monitoring
while true; do
  echo "$(date): Checking index status..."
  firebase firestore:indexes | grep -E "(Building|Enabled|Error)"
  sleep 30
done

# Or use Firebase Console:
# https://console.firebase.google.com/project/[PROJECT_ID]/firestore/indexes
```

## Environment-Specific Procedures

### Staging Environment

```bash
# Set Firebase project
firebase use staging

# Deploy with staging configuration
export NODE_ENV=staging
export FIREBASE_PROJECT_ID=your-staging-project

# Deploy indexes
firebase deploy --only firestore:indexes

# Deploy application
npm run build:staging
npm run deploy:staging

# Run tests
npm run test:staging
```

### Production Environment

```bash
# Set Firebase project
firebase use production

# Deploy with production configuration
export NODE_ENV=production
export FIREBASE_PROJECT_ID=your-production-project

# Deploy indexes (with confirmation)
firebase deploy --only firestore:indexes --confirm

# Wait for index build completion
# Monitor Firebase Console

# Deploy application
npm run build:production
npm run deploy:production

# Run production health checks
npm run healthcheck:production
```

## Rollback Procedures

### If Index Deployment Fails

```bash
# Stop the deployment
# Check Firebase Console for error details

# If indexes are in error state:
firebase firestore:indexes:delete [INDEX_ID]

# Restore from backup
firebase deploy --only firestore:indexes --config backup-indexes-[DATE].json

# Investigate and fix configuration issues
# Retry deployment
```

### If Application Deployment Fails

```bash
# Rollback to previous version
git checkout [PREVIOUS_TAG]
npm run build
npm run deploy:production

# Or use deployment platform rollback
# (e.g., Vercel, Netlify, etc.)

# Verify rollback success
npm run healthcheck:production
```

### Emergency Rollback

```bash
# Complete rollback procedure
git checkout [STABLE_TAG]
firebase use production
firebase deploy --only firestore:indexes --config backup-indexes-[DATE].json
npm run deploy:production

# Notify team and stakeholders
# Document issues for post-mortem
```

## Post-Deployment Verification

### 1. Functional Testing

```bash
# Test proposal creation
curl -X POST https://your-app.com/api/proposals \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Proposal",
    "client": "Test Client",
    "type": "FIBER"
  }'

# Test proposal retrieval
curl -H "Authorization: Bearer $TEST_TOKEN" \
     https://your-app.com/api/proposals

# Test filtered queries
curl -H "Authorization: Bearer $TEST_TOKEN" \
     "https://your-app.com/api/proposals?type=FIBER"
```

### 2. Performance Verification

```bash
# Run performance tests
npm run test:performance

# Check response times
# Monitor database query performance
# Verify no fallback strategies are being used
```

### 3. Error Rate Monitoring

- Check application error logs
- Monitor error rates in dashboards
- Verify no index-related errors
- Confirm fallback strategies work if needed

### 4. User Acceptance Testing

- Test with real user accounts
- Verify user-specific data isolation
- Test all proposal types and filters
- Confirm UI functionality

## Monitoring and Alerting

### Key Metrics to Monitor

```javascript
// Example monitoring configuration
{
  "metrics": {
    "api_response_time": {
      "threshold": "2s",
      "alert": "high_latency"
    },
    "error_rate": {
      "threshold": "1%",
      "alert": "error_spike"
    },
    "index_errors": {
      "threshold": 1,
      "alert": "index_missing"
    },
    "fallback_usage": {
      "threshold": "5%",
      "alert": "performance_degradation"
    }
  }
}
```

### Alert Configuration

```bash
# Set up alerts for:
# - Index build failures
# - High error rates
# - Performance degradation
# - Fallback strategy usage

# Example alert script
#!/bin/bash
ERROR_RATE=$(curl -s "https://your-monitoring.com/api/error-rate")
if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
  echo "High error rate detected: $ERROR_RATE"
  # Send notification
fi
```

## Maintenance Procedures

### Regular Index Maintenance

```bash
# Monthly index review
firebase firestore:indexes > current-indexes-$(date +%Y%m).json

# Compare with expected configuration
diff expected-indexes.json current-indexes-$(date +%Y%m).json

# Clean up unused indexes
# firebase firestore:indexes:delete [UNUSED_INDEX_ID]
```

### Performance Monitoring

```bash
# Weekly performance review
npm run test:performance:weekly

# Check for slow queries
# Review fallback strategy usage
# Optimize indexes if needed
```

### Backup Procedures

```bash
# Weekly backup of index configuration
firebase firestore:indexes > backups/indexes-$(date +%Y%m%d).json

# Monthly backup of application state
git tag -a "monthly-backup-$(date +%Y%m)" -m "Monthly backup"
git push origin --tags
```

## Troubleshooting

### Common Issues

1. **Index Build Stuck**
   - Check Firebase Console for errors
   - Verify project quotas
   - Contact Firebase Support if needed

2. **Application Errors After Deployment**
   - Check application logs
   - Verify environment variables
   - Test authentication flow

3. **Performance Issues**
   - Monitor query performance
   - Check if fallback strategies are being used
   - Review index usage patterns

### Support Contacts

- **Development Team**: dev-team@company.com
- **DevOps Team**: devops@company.com
- **Firebase Support**: Use Firebase Console support
- **Emergency Contact**: on-call@company.com

## Documentation Updates

After successful deployment:

- [ ] Update API documentation
- [ ] Update troubleshooting guide
- [ ] Document any issues encountered
- [ ] Update deployment procedures if needed
- [ ] Share lessons learned with team

## Compliance and Security

### Security Checklist

- [ ] User authentication verified
- [ ] Data isolation confirmed
- [ ] Input validation working
- [ ] No sensitive data exposed in logs

### Compliance Requirements

- [ ] Data privacy requirements met
- [ ] Audit logs enabled
- [ ] Backup procedures documented
- [ ] Incident response plan updated

## Success Criteria

Deployment is considered successful when:

- [ ] All Firestore indexes are built and enabled
- [ ] Application deploys without errors
- [ ] All tests pass
- [ ] No increase in error rates
- [ ] Performance metrics within acceptable ranges
- [ ] User functionality works as expected
- [ ] Monitoring and alerts are functioning

## Post-Deployment Tasks

1. **Documentation**
   - Update deployment log
   - Document any issues or deviations
   - Update runbooks if needed

2. **Communication**
   - Notify stakeholders of successful deployment
   - Update status pages
   - Share metrics and performance data

3. **Monitoring**
   - Continue monitoring for 24-48 hours
   - Review metrics and logs
   - Address any issues promptly

4. **Cleanup**
   - Remove temporary files
   - Clean up old backups
   - Update deployment scripts if needed