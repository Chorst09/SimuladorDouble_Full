# Implementation Plan

- [x] 1. Add back button to PABXSIPCalculator search view
  - Import ArrowLeft icon from lucide-react if not already imported
  - Add back button above the "Buscar Propostas" title in the search view section
  - Use Button component with outline variant and onClick handler to set currentView to 'calculator'
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2_

- [x] 2. Add back button to MaquinasVirtuaisCalculator search view
  - Import ArrowLeft icon from lucide-react if not already imported
  - Add back button above the "Buscar Propostas" title in the search proposals section
  - Use Button component with outline variant and onClick handler to return to main calculator view
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2_

- [x] 3. Add back button to RadioInternetCalculator search view
  - Import ArrowLeft icon from lucide-react if not already imported
  - Add back button above the "Buscar Propostas - Internet via Rádio" title
  - Use Button component with outline variant and onClick handler to return to main calculator view
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2_

- [x] 4. Add back button to InternetFibraCalculator search view
  - Import ArrowLeft icon from lucide-react if not already imported
  - Add back button above the "Buscar Propostas - Internet via Fibra" title
  - Use Button component with outline variant and onClick handler to return to main calculator view
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2_

- [x] 5. Add back button to DoubleFibraRadioCalculator search view
  - Import ArrowLeft icon from lucide-react if not already imported
  - Add back button above the "Buscar Propostas - Double-Fibra/Radio" title
  - Use Button component with outline variant and onClick handler to return to main calculator view
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2_

- [x] 6. Add back button to InternetManCalculator search view
  - Import ArrowLeft icon from lucide-react if not already imported
  - Add back button above the search proposals section title
  - Use Button component with outline variant and onClick handler to return to main calculator view
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2_

- [x] 7. Test back button functionality across all calculators
  - Verify that clicking the back button returns to the main calculator view in each component
  - Test that calculator state is preserved when navigating back from search view
  - Ensure consistent styling and behavior across all calculator components
  - _Requirements: 2.1, 2.2, 2.3, 3.3_