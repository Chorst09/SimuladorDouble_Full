# Firestore Index Troubleshooting Guide

## Overview

This guide provides comprehensive troubleshooting steps for Firestore index-related errors in the proposals system. It covers common error scenarios, resolution steps, and preventive measures.

## Common Index Errors

### 1. Missing Composite Index Error

**Error Message:**
```
The query requires an index. You can create it here: https://console.firebase.google.com/project/[PROJECT_ID]/firestore/indexes?create_composite=...
```

**Cause:** The query uses multiple fields for filtering or combines filtering with ordering, requiring a composite index.

**Resolution:**
1. Click the provided link in the error message to create the index automatically
2. Or manually create the index using the Firebase Console
3. Or deploy the index using the Firebase CLI

### 2. Index Build In Progress

**Error Message:**
```
The index is currently building and cannot be used yet.
```

**Cause:** The index exists but is still being built by Firestore.

**Resolution:**
1. Wait for the index build to complete (can take several minutes to hours)
2. Monitor index status in Firebase Console
3. Use fallback query strategies while waiting

### 3. Index Not Found

**Error Message:**
```
Index not found for query: ...
```

**Cause:** The required index was deleted or never created.

**Resolution:**
1. Check the `firestore.indexes.json` file for the required index definition
2. Deploy indexes using `firebase deploy --only firestore:indexes`
3. Verify index creation in Firebase Console

## Required Indexes for Proposals

### Current Index Configuration

The following indexes are required for the proposals collection:

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

### Index Usage Patterns

1. **User Proposals by Base ID**: `createdBy == userId && baseId == baseId`
2. **User Proposals Chronological**: `createdBy == userId ORDER BY createdAt DESC`
3. **User Proposals by Type**: `type == proposalType && createdBy == userId ORDER BY createdAt DESC`

## Troubleshooting Steps

### Step 1: Identify the Error

1. Check the application logs for Firestore errors
2. Look for error messages containing "index" or "composite"
3. Note the collection and fields mentioned in the error

### Step 2: Verify Index Configuration

1. Check `firestore.indexes.json` in your project root
2. Ensure all required indexes are defined
3. Verify field names and ordering match your queries

### Step 3: Deploy Indexes

```bash
# Deploy only Firestore indexes
firebase deploy --only firestore:indexes

# Deploy all Firestore rules and indexes
firebase deploy --only firestore
```

### Step 4: Monitor Index Status

1. Open Firebase Console
2. Navigate to Firestore > Indexes
3. Check the status of your indexes:
   - **Building**: Index is being created (wait)
   - **Enabled**: Index is ready to use
   - **Error**: Index creation failed (check configuration)

### Step 5: Test Queries

1. Use the Firebase Console to test queries manually
2. Run your application to verify the fix
3. Monitor application logs for any remaining errors

## Fallback Strategies

The application includes automatic fallback strategies when indexes are missing:

### 1. Simplified Queries
- Remove ordering constraints
- Use fewer filter fields
- Perform client-side filtering

### 2. Client-Side Sorting
- Fetch unordered results
- Sort data in the application
- Apply pagination client-side

### 3. Cached Results
- Use previously cached data
- Display stale data with warnings
- Refresh when indexes are available

## Prevention Best Practices

### 1. Index Management

- Always test queries in development before production
- Use Firebase Emulator for local development
- Keep `firestore.indexes.json` in version control
- Document query patterns and required indexes

### 2. Query Design

- Minimize the number of fields in composite indexes
- Use single-field indexes when possible
- Consider query performance implications
- Plan for data growth and scaling

### 3. Monitoring

- Set up alerts for index errors
- Monitor query performance metrics
- Track index usage patterns
- Regular index maintenance and cleanup

## Emergency Procedures

### Production Index Errors

1. **Immediate Response:**
   - Check if fallback strategies are working
   - Monitor error rates and user impact
   - Communicate status to stakeholders

2. **Quick Fix:**
   - Create missing indexes via Firebase Console
   - Use provided error message links
   - Monitor index build progress

3. **Long-term Fix:**
   - Update `firestore.indexes.json`
   - Deploy via CI/CD pipeline
   - Test thoroughly in staging

### Index Build Failures

1. **Check Quotas:**
   - Verify Firestore quotas and limits
   - Check for concurrent index builds
   - Review project billing status

2. **Retry Strategy:**
   - Delete failed index
   - Wait 5-10 minutes
   - Recreate index with same configuration

3. **Alternative Approaches:**
   - Use Firebase CLI instead of Console
   - Break complex indexes into simpler ones
   - Contact Firebase Support if needed

## Monitoring and Alerts

### Key Metrics to Monitor

- Index error rates
- Query performance (latency)
- Fallback strategy usage
- Index build status

### Recommended Alerts

```javascript
// Example alert configuration
{
  "indexErrors": {
    "threshold": 5,
    "timeWindow": "5m",
    "action": "notify_team"
  },
  "queryLatency": {
    "threshold": "2s",
    "percentile": 95,
    "action": "investigate"
  },
  "fallbackUsage": {
    "threshold": "10%",
    "timeWindow": "1h",
    "action": "review_indexes"
  }
}
```

## Support and Resources

### Internal Resources
- Development team documentation
- Staging environment for testing
- CI/CD pipeline for deployments

### External Resources
- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Index Management](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firebase Support](https://firebase.google.com/support)

### Contact Information
- Development Team: dev-team@company.com
- DevOps Team: devops@company.com
- Firebase Support: Use Firebase Console support chat

## Appendix

### Common Query Patterns

```javascript
// User-specific proposals
db.collection('proposals')
  .where('createdBy', '==', userId)
  .orderBy('createdAt', 'desc')

// Proposals by type and user
db.collection('proposals')
  .where('type', '==', 'FIBER')
  .where('createdBy', '==', userId)
  .orderBy('createdAt', 'desc')

// Specific proposal by baseId
db.collection('proposals')
  .where('createdBy', '==', userId)
  .where('baseId', '==', baseId)
```

### Index Creation Commands

```bash
# Create index via Firebase CLI
firebase firestore:indexes

# Deploy specific index file
firebase deploy --only firestore:indexes --project production

# Validate index configuration
firebase firestore:indexes --dry-run
```