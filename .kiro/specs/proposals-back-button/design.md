# Design Document

## Overview

Esta funcionalidade adiciona um botão "Voltar" na seção de propostas do DashboardView para melhorar a navegação do usuário. O botão permitirá que os usuários retornem facilmente à seção de calculadoras do dashboard através de scroll suave.

## Architecture

A implementação será feita modificando o componente `ProposalsView` para aceitar uma nova prop `onBackToTop` que será uma função callback fornecida pelo `DashboardView`. Esta abordagem mantém a separação de responsabilidades e permite que o componente pai controle o comportamento de navegação.

### Component Hierarchy
```
DashboardView
├── Calculadoras Section (target scroll position)
├── Visão Geral Section  
└── ProposalsView (modified)
    └── Back Button (new)
```

## Components and Interfaces

### ProposalsView Component Modifications

**New Props Interface:**
```typescript
interface ProposalsViewProps {
  proposals: Proposal[];
  partners: Partner[];
  onSave: (proposal: Proposal) => void;
  onDelete: (id: string) => void;
  onBackToTop?: () => void; // New optional prop
}
```

**Header Layout Modification:**
- Modify the existing header section to include the back button
- Use flexbox layout to position the back button and title appropriately
- Maintain existing "Nova Proposta" button positioning

### DashboardView Component Modifications

**New Callback Function:**
```typescript
const handleBackToTop = () => {
  // Scroll to the calculadoras section smoothly
  const calculadorasSection = document.querySelector('[data-section="calculadoras"]');
  if (calculadorasSection) {
    calculadorasSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
```

**Props Passing:**
- Pass the `handleBackToTop` function to ProposalsView as `onBackToTop` prop

## Data Models

No new data models are required. This is purely a UI/UX enhancement that uses existing component props and callback patterns.

## Error Handling

### Scroll Target Not Found
- If the calculadoras section element is not found, fallback to scrolling to the top of the page
- Use `window.scrollTo({ top: 0, behavior: 'smooth' })` as fallback

### Missing Callback
- The `onBackToTop` prop is optional, so the button should only render when the callback is provided
- Use conditional rendering to prevent errors when the prop is undefined

## Testing Strategy

### Unit Tests
1. **ProposalsView Component:**
   - Test that back button renders when `onBackToTop` prop is provided
   - Test that back button does not render when `onBackToTop` prop is undefined
   - Test that clicking the back button calls the `onBackToTop` callback
   - Test that the button has correct styling and icon

2. **DashboardView Component:**
   - Test that `handleBackToTop` function is passed correctly to ProposalsView
   - Test scroll behavior when calculadoras section exists
   - Test fallback scroll behavior when calculadoras section doesn't exist

### Integration Tests
1. **Navigation Flow:**
   - Test complete user flow from calculadoras to propostas and back
   - Verify smooth scrolling behavior
   - Test responsive behavior on different screen sizes

### Visual Tests
1. **Layout Verification:**
   - Verify button positioning in header
   - Test spacing and alignment with existing elements
   - Verify consistent styling with design system

## Implementation Notes

### Styling Approach
- Use existing Button component with `variant="outline"` for consistency
- Use `ArrowLeft` icon from lucide-react for clear visual indication
- Apply appropriate spacing using Tailwind CSS classes

### Accessibility Considerations
- Ensure button has proper ARIA labels
- Maintain keyboard navigation support
- Provide sufficient color contrast for the button

### Performance Considerations
- Use smooth scrolling with `behavior: 'smooth'` for better UX
- Implement scroll target detection to avoid unnecessary DOM queries
- Consider using `useCallback` for the scroll handler to prevent unnecessary re-renders