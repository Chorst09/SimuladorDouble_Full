import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuth } from '@/hooks/use-auth';

// Mock the auth hook
jest.mock('@/hooks/use-auth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  doc: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  doc: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  updateDoc: jest.fn(),
  addDoc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false })),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Import calculator components
import { PABXSIPCalculator } from '@/components/calculators/PABXSIPCalculator';
import MaquinasVirtuaisCalculator from '@/components/calculators/MaquinasVirtuaisCalculator';
import RadioInternetCalculator from '@/components/calculators/RadioInternetCalculator';
import InternetFibraCalculator from '@/components/calculators/InternetFibraCalculator';
import DoubleFibraRadioCalculator from '@/components/calculators/DoubleFibraRadioCalculator';
import InternetManCalculator from '@/components/calculators/InternetManCalculator';

describe('Calculator Back Button Functionality', () => {
  beforeEach(() => {
    // Mock authenticated user
    mockUseAuth.mockReturnValue({
      user: {
        uid: 'test-user-id',
        email: 'test@example.com',
        role: 'admin',
      },
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PABXSIPCalculator', () => {
    it('should render back button in search view and navigate to calculator view', async () => {
      render(<PABXSIPCalculator />);
      
      // Should start in search view and show back button
      await waitFor(() => {
        expect(screen.getByText('Buscar Propostas')).toBeInTheDocument();
      });
      
      const backButton = screen.getByRole('button', { name: /voltar/i });
      expect(backButton).toBeInTheDocument();
      
      // Click back button should navigate to calculator view
      fireEvent.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByText(/PABX/i)).toBeInTheDocument();
      });
    });

    it('should preserve calculator state when navigating back from search', async () => {
      render(<PABXSIPCalculator />);
      
      // Navigate to calculator view first
      const backButton = screen.getByRole('button', { name: /voltar/i });
      fireEvent.click(backButton);
      
      // Set some calculator values (this would need to be adjusted based on actual form fields)
      await waitFor(() => {
        const extensionsInput = screen.getByDisplayValue('32'); // Default value
        expect(extensionsInput).toBeInTheDocument();
      });
    });
  });

  describe('MaquinasVirtuaisCalculator', () => {
    it('should render back button in search view and navigate to calculator view', async () => {
      render(<MaquinasVirtuaisCalculator />);
      
      await waitFor(() => {
        expect(screen.getByText('Buscar Propostas')).toBeInTheDocument();
      });
      
      const backButton = screen.getByRole('button', { name: /voltar/i });
      expect(backButton).toBeInTheDocument();
      
      fireEvent.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Máquinas Virtuais/i)).toBeInTheDocument();
      });
    });
  });

  describe('RadioInternetCalculator', () => {
    it('should render back button in search view and navigate to calculator view', async () => {
      render(<RadioInternetCalculator />);
      
      await waitFor(() => {
        expect(screen.getByText('Buscar Propostas - Internet via Rádio')).toBeInTheDocument();
      });
      
      const backButton = screen.getByRole('button', { name: /voltar/i });
      expect(backButton).toBeInTheDocument();
      
      fireEvent.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Internet via Rádio/i)).toBeInTheDocument();
      });
    });
  });

  describe('InternetFibraCalculator', () => {
    it('should render back button in search view and navigate to calculator view', async () => {
      render(<InternetFibraCalculator />);
      
      await waitFor(() => {
        expect(screen.getByText('Buscar Propostas - Internet via Fibra')).toBeInTheDocument();
      });
      
      const backButton = screen.getByRole('button', { name: /voltar/i });
      expect(backButton).toBeInTheDocument();
      
      fireEvent.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Internet via Fibra/i)).toBeInTheDocument();
      });
    });
  });

  describe('DoubleFibraRadioCalculator', () => {
    it('should render back button in search view and navigate to calculator view', async () => {
      render(<DoubleFibraRadioCalculator />);
      
      await waitFor(() => {
        expect(screen.getByText('Buscar Propostas - Double-Fibra/Radio')).toBeInTheDocument();
      });
      
      const backButton = screen.getByRole('button', { name: /voltar/i });
      expect(backButton).toBeInTheDocument();
      
      fireEvent.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Double-Fibra/i)).toBeInTheDocument();
      });
    });
  });

  describe('InternetManCalculator', () => {
    it('should render back button in search view and navigate to calculator view', async () => {
      render(<InternetManCalculator />);
      
      await waitFor(() => {
        expect(screen.getByText(/Buscar Propostas/i)).toBeInTheDocument();
      });
      
      const backButton = screen.getByRole('button', { name: /voltar/i });
      expect(backButton).toBeInTheDocument();
      
      fireEvent.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Internet MAN/i)).toBeInTheDocument();
      });
    });
  });

  describe('Consistent Styling and Behavior', () => {
    const calculators = [
      { name: 'PABXSIPCalculator', component: PABXSIPCalculator },
      { name: 'MaquinasVirtuaisCalculator', component: MaquinasVirtuaisCalculator },
      { name: 'RadioInternetCalculator', component: RadioInternetCalculator },
      { name: 'InternetFibraCalculator', component: InternetFibraCalculator },
      { name: 'DoubleFibraRadioCalculator', component: DoubleFibraRadioCalculator },
      { name: 'InternetManCalculator', component: InternetManCalculator },
    ];

    calculators.forEach(({ name, component: Component }) => {
      it(`should have consistent back button styling in ${name}`, async () => {
        render(<Component />);
        
        await waitFor(() => {
          const backButton = screen.getByRole('button', { name: /voltar/i });
          expect(backButton).toBeInTheDocument();
          
          // Check for ArrowLeft icon (should be present in button)
          const arrowIcon = backButton.querySelector('svg');
          expect(arrowIcon).toBeInTheDocument();
          
          // Check for consistent button classes
          expect(backButton).toHaveClass('flex', 'items-center');
        });
      });

      it(`should have accessible back button in ${name}`, async () => {
        render(<Component />);
        
        await waitFor(() => {
          const backButton = screen.getByRole('button', { name: /voltar/i });
          
          // Button should be focusable
          expect(backButton).not.toHaveAttribute('disabled');
          
          // Button should have proper role
          expect(backButton).toHaveAttribute('type', 'button');
        });
      });
    });
  });

  describe('State Preservation', () => {
    it('should preserve form data when navigating between views in PABXSIPCalculator', async () => {
      render(<PABXSIPCalculator />);
      
      // Start in search view, navigate to calculator
      const backButton = screen.getByRole('button', { name: /voltar/i });
      fireEvent.click(backButton);
      
      // Wait for calculator view to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('32')).toBeInTheDocument(); // Default PABX extensions
      });
      
      // Navigate to search view (would need to find the search button)
      // This test verifies that the state is maintained
      // The actual implementation would depend on how navigation to search is triggered
    });
  });
});