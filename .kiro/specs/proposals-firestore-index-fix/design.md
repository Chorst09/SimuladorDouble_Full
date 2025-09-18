# Design Document

## Overview

The Firebase Firestore index error occurs when the application attempts to query the `proposals` collection using multiple fields (`userId`/`createdBy`, `baseId`, and potentially ordering by `__name__`). Firestore requires composite indexes for queries that filter on multiple fields or combine filtering with ordering.

Based on the error message, the specific query pattern causing the issue is:
- Collection: `proposals`
- Filters: `userId` (likely mapped to `createdBy` field) and `baseId`
- Ordering: `__name__` (document ID)

## Architecture

### Current State Analysis

1. **Proposal Data Model**: Uses `createdBy` field to store user ID and `baseId` for proposal identification
2. **API Implementation**: Currently queries proposals without user-specific filtering in the main API
3. **Index Configuration**: Empty `firestore.indexes.json` with no composite indexes defined
4. **Query Patterns**: The error suggests there's a query filtering by user and base ID that's not visible in the current API code

### Target Architecture

1. **Firestore Index Configuration**: Define composite indexes for all required query patterns
2. **Query Optimization**: Ensure queries are structured to use available indexes efficiently
3. **Error Handling**: Implement graceful fallbacks when indexes are missing
4. **Index Management**: Automated index deployment and validation

## Components and Interfaces

### 1. Firestore Index Configuration

**File**: `firestore.indexes.json`

The composite index configuration will include:
- Index for `createdBy` + `baseId` + `__name__` (ascending)
- Index for `createdBy` + `createdAt` (descending) for user-specific proposal listing
- Index for `type` + `createdBy` + `createdAt` (descending) for filtered user proposals

### 2. Enhanced API Query Logic

**File**: `src/app/api/proposals/route.ts`

Modifications needed:
- Add user-specific filtering capability
- Implement query pattern detection and index validation
- Add fallback mechanisms for missing indexes
- Enhanced error handling for index-related errors

### 3. Client-Side Query Management

**File**: `src/hooks/use-proposals-api.ts`

Enhancements:
- Add user context to API calls
- Implement retry logic for index errors
- Better error messaging for users

### 4. Index Deployment Utilities

**New Component**: Index validation and deployment helpers
- Validate required indexes exist
- Provide clear instructions for missing indexes
- Automated index creation scripts

## Data Models

### Firestore Index Structure

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

### Query Pattern Mapping

1. **User Proposals by Base ID**: `createdBy == userId && baseId == baseId`
2. **User Proposals Chronological**: `createdBy == userId ORDER BY createdAt DESC`
3. **User Proposals by Type**: `type == proposalType && createdBy == userId ORDER BY createdAt DESC`

## Error Handling

### Index Error Detection

```typescript
interface IndexError {
  type: 'MISSING_INDEX';
  collection: string;
  fields: string[];
  indexUrl?: string;
  fallbackStrategy: 'UNORDERED_QUERY' | 'CLIENT_SORT' | 'SIMPLIFIED_QUERY';
}
```

### Error Recovery Strategies

1. **Graceful Degradation**: Fall back to simpler queries when indexes are missing
2. **Client-Side Sorting**: Perform sorting in memory for small result sets
3. **User Notification**: Inform users about temporary limitations
4. **Admin Alerts**: Notify administrators about missing indexes

### Error Response Enhancement

```typescript
interface ProposalApiError {
  error: string;
  message: string;
  code: 'INDEX_MISSING' | 'PERMISSION_DENIED' | 'QUOTA_EXCEEDED' | 'UNKNOWN';
  details?: {
    indexUrl?: string;
    requiredFields?: string[];
    fallbackAvailable?: boolean;
  };
}
```

## Testing Strategy

### Index Validation Tests

1. **Index Existence Verification**: Automated tests to verify all required indexes exist
2. **Query Performance Tests**: Validate that queries use indexes efficiently
3. **Fallback Mechanism Tests**: Ensure graceful degradation works correctly

### Integration Tests

1. **End-to-End Query Tests**: Test all supported query patterns
2. **Error Scenario Tests**: Simulate missing indexes and validate error handling
3. **User Experience Tests**: Verify user-facing error messages are helpful

### Performance Tests

1. **Query Latency Measurement**: Benchmark query performance with and without indexes
2. **Scalability Tests**: Validate performance with large datasets
3. **Concurrent Query Tests**: Test behavior under high load

## Implementation Phases

### Phase 1: Index Configuration
- Update `firestore.indexes.json` with required composite indexes
- Deploy indexes to Firestore
- Validate index creation

### Phase 2: API Enhancement
- Add user-specific query support to proposals API
- Implement index error detection and fallback logic
- Enhanced error responses with actionable information

### Phase 3: Client-Side Improvements
- Update hooks to handle user context
- Implement retry mechanisms for transient errors
- Better user experience for error scenarios

### Phase 4: Monitoring and Maintenance
- Add logging for index usage patterns
- Automated index validation in CI/CD
- Performance monitoring and alerting

## Security Considerations

### Data Access Control
- Ensure users can only access their own proposals
- Validate user authentication before applying user filters
- Implement proper field-level security rules

### Index Security
- Review index configurations for potential data exposure
- Ensure indexes don't inadvertently expose sensitive data
- Validate that security rules work with new query patterns

## Performance Optimization

### Query Optimization
- Use compound indexes for multi-field queries
- Minimize the number of fields in composite indexes
- Consider query result caching for frequently accessed data

### Index Management
- Monitor index usage and performance
- Remove unused indexes to reduce storage costs
- Optimize index field ordering for query patterns