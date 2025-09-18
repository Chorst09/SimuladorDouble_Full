# Migration Example: Using the New Proposals API

## Current Implementation (Firestore Direct)

The current `InternetFibraCalculator.tsx` uses Firestore directly:

```typescript
const fetchProposals = async () => {
    if (!user || !user.role || !db) {
        setProposals([]);
        return;
    }

    const proposalsCol = collection(db, 'proposals');
    let q;
    if (user.role === 'admin' || user.role === 'diretor') {
        q = query(proposalsCol);
    } else {
        q = query(proposalsCol, where('userId', '==', user.uid));
    }

    try {
        const querySnapshot = await getDocs(q);
        const proposalsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Proposal));
        setProposals(proposalsData);
    } catch (error) {
        console.error("Erro ao buscar propostas: ", error);
    }
};
```

## New Implementation (REST API)

Replace the above with the new hook:

```typescript
import { useProposalsApi } from '@/hooks/use-proposals-api';

// In your component:
const { 
    proposals, 
    loading, 
    error, 
    createProposal,
    refresh 
} = useProposalsApi({ type: 'FIBER' });

// Remove the old fetchProposals function and useEffect
// The hook handles fetching automatically

// For creating proposals, replace the old Firestore code:
const handleSaveProposal = async () => {
    const proposalData = {
        title: proposalTitle,
        client: clientData.name,
        createdBy: user.uid,
        value: totalValue,
        status: 'Rascunho' as const,
        accountManager: accountManagerData.name,
        distributorId: clientData.distributorId || '',
        date: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        version: 1,
    };

    const createdProposal = await createProposal(proposalData);
    if (createdProposal) {
        console.log('Proposal saved successfully:', createdProposal);
        // Handle success (show notification, etc.)
    } else {
        console.error('Failed to save proposal');
        // Handle error
    }
};
```

## Benefits of the New API

1. **Centralized Error Handling**: All API errors are handled consistently
2. **Type Safety**: Full TypeScript support with proper interfaces
3. **Caching**: The hook manages state and caching automatically
4. **Validation**: Server-side validation ensures data integrity
5. **Scalability**: REST API can be easily extended and versioned
6. **Testing**: API endpoints can be tested independently
7. **Performance**: Optimized queries and response formatting

## Testing the API

Run the test script to verify the API is working:

```bash
node test-api.js
```

This will test:
- GET /api/proposals
- GET /api/proposals?type=FIBER
- POST /api/proposals
- Error handling for unsupported methods

## Migration Steps

1. Install the new hook: `src/hooks/use-proposals-api.ts`
2. Replace Firestore imports with the hook import
3. Replace the fetchProposals function with the hook
4. Update proposal creation logic to use the createProposal function
5. Remove direct Firestore dependencies from the component
6. Test the component to ensure it works with the new API

## Environment Variables

Make sure these environment variables are set for Firebase Admin SDK:

```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
```