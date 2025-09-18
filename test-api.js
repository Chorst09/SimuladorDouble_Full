// Simple test script to verify the API is working
// Run with: node test-api.js

const API_BASE_URL = 'http://localhost:3000/api';

async function testGetProposals() {
  try {
    console.log('Testing GET /api/proposals...');
    const response = await fetch(`${API_BASE_URL}/proposals`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ GET /api/proposals - SUCCESS');
    } else {
      console.log('❌ GET /api/proposals - FAILED');
    }
  } catch (error) {
    console.error('❌ GET /api/proposals - ERROR:', error.message);
  }
}

async function testGetProposalsWithType() {
  try {
    console.log('\nTesting GET /api/proposals?type=FIBER...');
    const response = await fetch(`${API_BASE_URL}/proposals?type=FIBER`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ GET /api/proposals?type=FIBER - SUCCESS');
    } else {
      console.log('❌ GET /api/proposals?type=FIBER - FAILED');
    }
  } catch (error) {
    console.error('❌ GET /api/proposals?type=FIBER - ERROR:', error.message);
  }
}

async function testCreateProposal() {
  try {
    console.log('\nTesting POST /api/proposals...');
    
    const testProposal = {
      title: 'Test Proposal',
      client: 'Test Client',
      createdBy: 'test-user',
      type: 'FIBER',
      value: 1000,
      status: 'Rascunho'
    };
    
    const response = await fetch(`${API_BASE_URL}/proposals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProposal)
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ POST /api/proposals - SUCCESS');
      return data.id; // Return the created proposal ID for cleanup
    } else {
      console.log('❌ POST /api/proposals - FAILED');
    }
  } catch (error) {
    console.error('❌ POST /api/proposals - ERROR:', error.message);
  }
  return null;
}

async function testInvalidMethod() {
  try {
    console.log('\nTesting PUT /api/proposals (should fail)...');
    const response = await fetch(`${API_BASE_URL}/proposals`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 405) {
      console.log('✅ PUT /api/proposals - CORRECTLY REJECTED');
    } else {
      console.log('❌ PUT /api/proposals - UNEXPECTED RESPONSE');
    }
  } catch (error) {
    console.error('❌ PUT /api/proposals - ERROR:', error.message);
  }
}

async function testGetProposalTypes() {
  try {
    console.log('\nTesting GET /api/proposals/types...');
    const response = await fetch(`${API_BASE_URL}/proposals/types`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ GET /api/proposals/types - SUCCESS');
    } else {
      console.log('❌ GET /api/proposals/types - FAILED');
    }
  } catch (error) {
    console.error('❌ GET /api/proposals/types - ERROR:', error.message);
  }
}

async function testCreateProposalWithInvalidType() {
  try {
    console.log('\nTesting POST /api/proposals with invalid type...');
    
    const testProposal = {
      title: 'Test Proposal',
      client: 'Test Client',
      createdBy: 'test-user',
      type: 'INVALID_TYPE', // This should fail validation
      value: 1000,
      status: 'Rascunho'
    };
    
    const response = await fetch(`${API_BASE_URL}/proposals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProposal)
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 400) {
      console.log('✅ POST /api/proposals with invalid type - CORRECTLY REJECTED');
    } else {
      console.log('❌ POST /api/proposals with invalid type - UNEXPECTED RESPONSE');
    }
  } catch (error) {
    console.error('❌ POST /api/proposals with invalid type - ERROR:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  await testGetProposals();
  await testGetProposalsWithType();
  await testGetProposalTypes();
  const createdId = await testCreateProposal();
  await testCreateProposalWithInvalidType();
  await testInvalidMethod();
  
  console.log('\n🏁 Tests completed!');
  
  if (createdId) {
    console.log(`\n📝 Note: Created test proposal with ID: ${createdId}`);
    console.log('You may want to clean this up manually from your database.');
  }
}

// Run the tests
runTests().catch(console.error);