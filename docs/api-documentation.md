# Proposals API Documentation

## Overview

The Proposals API provides endpoints for creating, retrieving, and managing proposal documents. All endpoints require user authentication and implement user-specific data isolation.

## Authentication

All API endpoints require authentication via Bearer token in the Authorization header.

### Authentication Headers

```http
Authorization: Bearer <firebase-id-token>
X-User-ID: <user-id>
X-User-Email: <user-email>
```

### Authentication Flow

1. User authenticates with Firebase Auth
2. Client obtains ID token from Firebase
3. Client includes token in API requests
4. Server validates token and extracts user context
5. API operations are scoped to authenticated user

## Endpoints

### GET /api/proposals

Retrieve proposals for the authenticated user.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Filter by proposal type (FIBER, VM, RADIO, PABX, MAN, GENERAL) |
| `baseId` | string | No | Filter by specific proposal base ID |
| `userId` | string | No | User ID (redundant with auth, for explicit filtering) |

#### Request Example

```http
GET /api/proposals?type=FIBER&baseId=FIBER_2025_123456
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
X-User-ID: user123
```

#### Response

**Success (200 OK)**

```json
[
  {
    "id": "doc123",
    "baseId": "FIBER_2025_123456",
    "title": "Fiber Internet Proposal",
    "client": "Acme Corp",
    "type": "FIBER",
    "status": "Rascunho",
    "value": 5000,
    "version": 1,
    "createdBy": "user123",
    "createdAt": "2025-01-01T10:00:00Z",
    "date": "2025-01-01",
    "expiryDate": "2025-01-31",
    "accountManager": "John Doe",
    "distributorId": "dist-001"
  }
]
```

**Error Responses**

```json
// Authentication Error (401)
{
  "error": "Authentication Error",
  "message": "Authorization header is required",
  "code": "MISSING_AUTH"
}

// Index Missing Error (500)
{
  "error": "Index Missing",
  "message": "Required Firestore index is missing",
  "code": "INDEX_MISSING",
  "details": {
    "indexUrl": "https://console.firebase.google.com/project/myproject/firestore/indexes",
    "requiredFields": ["createdBy", "createdAt"],
    "fallbackAvailable": true
  }
}
```

#### Response Headers

| Header | Description |
|--------|-------------|
| `X-Request-ID` | Unique request identifier for tracking |
| `X-Response-Time` | Response time in milliseconds |
| `X-Result-Count` | Number of proposals returned |
| `X-Fallback-Used` | Whether fallback query strategy was used |
| `X-Fallback-Type` | Type of fallback used (if applicable) |
| `X-Performance-Impact` | Performance impact level (LOW/MEDIUM/HIGH) |

### POST /api/proposals

Create a new proposal for the authenticated user.

#### Request Body

```json
{
  "title": "New Fiber Proposal",
  "client": "Client Name",
  "type": "FIBER",
  "value": 10000,
  "status": "Rascunho",
  "accountManager": "Manager Name",
  "distributorId": "dist-123",
  "date": "2025-01-09",
  "expiryDate": "2025-02-08"
}
```

#### Required Fields

- `title` (string): Proposal title
- `client` (string): Client name

#### Optional Fields

- `type` (string): Proposal type (default: "GENERAL")
- `value` (number): Proposal value (default: 0)
- `status` (string): Proposal status (default: "Rascunho")
- `version` (number): Version number (default: 1)
- `accountManager` (string): Account manager name
- `distributorId` (string): Distributor ID
- `date` (string): Proposal date in YYYY-MM-DD format
- `expiryDate` (string): Expiry date in YYYY-MM-DD format

#### Response

**Success (201 Created)**

```json
{
  "id": "new-doc-id",
  "baseId": "FIBER_2025_789012",
  "title": "New Fiber Proposal",
  "client": "Client Name",
  "type": "FIBER",
  "status": "Rascunho",
  "value": 10000,
  "version": 1,
  "createdBy": "user123",
  "createdAt": "2025-01-09T15:30:00Z",
  "date": "2025-01-09",
  "expiryDate": "2025-02-08",
  "accountManager": "Manager Name",
  "distributorId": "dist-123"
}
```

**Error Responses**

```json
// Validation Error (400)
{
  "error": "Validation Error",
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "errors": [
      "title is required and cannot be empty",
      "client is required and cannot be empty"
    ]
  }
}
```

#### Response Headers

| Header | Description |
|--------|-------------|
| `X-Request-ID` | Unique request identifier |
| `X-Response-Time` | Response time in milliseconds |
| `X-Document-ID` | Created document ID |
| `X-Base-ID` | Generated base ID for the proposal |

## Data Models

### Proposal

```typescript
interface Proposal {
  id: string;                    // Firestore document ID
  baseId: string;               // Generated base ID (e.g., FIBER_2025_123456)
  title: string;                // Proposal title
  client: string;               // Client name
  type: ProposalType;           // Proposal type
  status: ProposalStatus;       // Current status
  value: number;                // Proposal value
  version: number;              // Version number
  createdBy: string;            // User ID who created the proposal
  createdAt: Date;              // Creation timestamp
  date: string;                 // Proposal date (YYYY-MM-DD)
  expiryDate: string;           // Expiry date (YYYY-MM-DD)
  accountManager?: string;      // Account manager name
  distributorId?: string;       // Distributor ID
}
```

### Proposal Types

```typescript
type ProposalType = 
  | 'FIBER'      // Fiber Internet proposals
  | 'VM'         // Virtual Machines proposals
  | 'RADIO'      // Radio Internet proposals
  | 'PABX'       // PABX SIP proposals
  | 'MAN'        // Metropolitan Area Network proposals
  | 'GENERAL';   // General/Other proposals
```

### Proposal Status

```typescript
type ProposalStatus = 
  | 'Rascunho'
  | 'Enviada'
  | 'Em Análise'
  | 'Aprovada'
  | 'Rejeitada'
  | 'Aguardando aprovação desconto Diretoria'
  | 'Aguardando Aprovação do Cliente'
  | 'Fechado Ganho'
  | 'Perdido';
```

## Error Handling

### Error Response Format

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-09T15:30:00Z",
  "details": {
    // Additional error-specific details
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `MISSING_AUTH` | 401 | Authorization header missing |
| `INVALID_TOKEN` | 403 | Invalid or expired token |
| `UNAUTHORIZED` | 403 | User not authorized |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INDEX_MISSING` | 500 | Required Firestore index missing |
| `PERMISSION_DENIED` | 403 | Insufficient permissions |
| `QUOTA_EXCEEDED` | 429 | Database quota exceeded |
| `DATABASE_CONNECTION_ERROR` | 500 | Database connection failed |
| `UNKNOWN_ERROR` | 500 | Unknown server error |

### Fallback Strategies

When Firestore indexes are missing, the API automatically implements fallback strategies:

1. **Simplified Queries**: Remove complex filters and ordering
2. **Client-Side Sorting**: Fetch unordered data and sort in memory
3. **Cached Results**: Return previously cached data when available

Fallback usage is indicated in response headers:
- `X-Fallback-Used: true`
- `X-Fallback-Type: CLIENT_SORT`
- `X-Performance-Impact: MEDIUM`

## Rate Limiting

The API implements automatic retry mechanisms with exponential backoff for transient errors:

- **Read Operations**: Up to 3 retries with 500ms base delay
- **Write Operations**: Up to 2 retries with 1000ms base delay
- **Query Operations**: Up to 3 retries with 750ms base delay

## Security

### Data Isolation

- All queries are automatically filtered by the authenticated user's ID
- Users can only access their own proposals
- Server-side validation ensures data integrity

### Authentication Requirements

- All endpoints require valid Firebase ID token
- Tokens are validated on each request
- User context is extracted from token claims

### Input Validation

- All input data is validated against defined schemas
- SQL injection and XSS protection
- Field length and type validation

## Performance Considerations

### Indexing

The API requires specific Firestore indexes for optimal performance:

1. **User Proposals**: `createdBy + createdAt`
2. **User + Type**: `type + createdBy + createdAt`
3. **User + BaseId**: `createdBy + baseId + __name__`

### Caching

- Query results are cached for fallback scenarios
- Cache TTL: 5 minutes
- Automatic cache invalidation on data changes

### Monitoring

The API includes comprehensive monitoring:

- Request/response times
- Error rates and types
- Fallback strategy usage
- Database performance metrics

## Client Integration

### React Hook Usage

```typescript
import { useProposalsApi } from '@/hooks/use-proposals-api';

function ProposalsComponent() {
  const {
    proposals,
    loading,
    error,
    apiError,
    createProposal,
    refresh,
    retry,
    clearError,
    isAuthenticated,
    usedFallback
  } = useProposalsApi({
    type: 'FIBER',
    autoFetch: true
  });

  // Handle loading state
  if (loading) return <div>Loading...</div>;

  // Handle errors with retry option
  if (error || apiError) {
    return (
      <div>
        <p>Error: {error || apiError?.message}</p>
        {apiError?.code === 'INDEX_MISSING' && (
          <p>Database index required. Please contact administrator.</p>
        )}
        <button onClick={retry}>Retry</button>
        <button onClick={clearError}>Dismiss</button>
      </div>
    );
  }

  // Display proposals
  return (
    <div>
      {usedFallback && (
        <div className="warning">
          Using fallback query. Performance may be impacted.
        </div>
      )}
      {proposals.map(proposal => (
        <div key={proposal.id}>
          {proposal.title} - {proposal.client}
        </div>
      ))}
    </div>
  );
}
```

### Direct API Usage

```typescript
// Fetch proposals
const response = await fetch('/api/proposals?type=FIBER', {
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'X-User-ID': userId
  }
});

const proposals = await response.json();

// Create proposal
const newProposal = await fetch('/api/proposals', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'X-User-ID': userId,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'New Proposal',
    client: 'Client Name',
    type: 'FIBER'
  })
});
```

## Testing

### Unit Tests

Run unit tests for API logic:

```bash
npm test src/lib/__tests__/
npm test src/app/api/proposals/__tests__/
```

### Integration Tests

Run integration tests for end-to-end functionality:

```bash
npm test src/__tests__/integration/
```

### Manual Testing

Use the provided test script to verify API functionality:

```bash
node test-user-filtered-proposals.js
```

## Deployment

### Prerequisites

1. Firebase project configured
2. Firestore indexes deployed
3. Authentication enabled
4. Environment variables set

### Index Deployment

```bash
# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Verify index status
firebase firestore:indexes
```

### Environment Variables

```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Health Checks

Monitor API health using these endpoints:

- Application logs for error patterns
- Firebase Console for index status
- Performance monitoring for response times

## Support

For technical support or questions:

- Check the troubleshooting guide: `docs/firestore-index-troubleshooting.md`
- Review error logs and monitoring dashboards
- Contact the development team for assistance