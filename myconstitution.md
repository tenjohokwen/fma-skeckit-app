## I. Code Quality Principles

### Vue 3 Composition API with `<script setup>`
- Use `<script setup>` syntax exclusively (no Options API, no export default)
- Leverage ref, reactive, computed, and watch from Vue
- Avoid this and class-style components entirely

### Plain JavaScript Only
- No TypeScript syntax, interfaces, or type annotations
- Use JSDoc comments for clarity when needed
- Validate data at runtime using simple checks

### Functional Component Splitting
- Each distinct feature = its own component
- Keep components focused on one responsibility
- Never combine unrelated features

### Quasar Integration
- Use Quasar components consistently
- Leverage Quasar composables like useQuasar()
- Follow Quasar's built-in theming and spacing utilities

### Clean & Readable Code
- Limit components to ≤ 250 lines
- Extract reusable logic into composables
- Name variables and functions clearly

## II. Testing Standards

### Component Isolation
- Each functional component must have its own test file
- Test only the component's own behavior

### Vitest + Vue Test Utils
- Write tests in plain JavaScript
- Cover user interactions, loading states, and conditional rendering
- Mock API calls and Quasar plugins

### Realistic Test Scenarios
- Simulate actual user flows
- Include edge cases
- Assert against visible text or user-facing behavior

## III. User Experience Consistency

### Design System

#### Color Palette
- **Primary Blue**: `#2563eb` (headers, buttons, key UI elements)
- **White**: `#ffffff` (form backgrounds, content areas)
- **Dark Text**: `#1e293b` (primary text content)
- **Light Gray**: `#f1f5f9` (subtle backgrounds, borders)
- **Hover Blue**: `#1d4ed8` (interactive elements on hover)
- **Success Green**: `#10b981` (success messages)
- **Warning Amber**: `#f59e0b` (warnings)
- **Error Red**: `#ef4444` (error messages)

#### Typography
- **Primary Font**: Inter, system-ui, -apple-system, sans-serif
- **Alternative**: Roboto, Helvetica, Arial, sans-serif
- **Font Sizes**:
  - H1: 28px, weight 700 (page titles)
  - H2: 24px, weight 600 (section titles)
  - H3: 20px, weight 600 (subsection titles)
  - Body Large: 16px, weight 400 (main content)
  - Body Medium: 14px, weight 400 (secondary content)
  - Body Small: 12px, weight 400 (captions, footnotes)
- **Line Height**: Headings 1.2, Body Text 1.5

#### Layout Structure
- **Grid**: 12-column, 1200px max-width, 24px gutters
- **Spacing Scale**: 4px, 8px, 16px, 24px, 32px, 48px, 64px
- **Page Structure**:
  - Header: Fixed 80px height
  - Main Content: Flexible height with padding
  - Footer: Fixed 60px height

#### Component Specifications

**Buttons**
```vue
<!-- Primary Button -->
<q-btn 
  unelevated 
  color="primary" 
  padding="12px 24px"
  class="rounded-6 weight-500"
>
  Button Text
</q-btn>

<!-- Secondary Button -->
<q-btn 
  outline 
  color="primary" 
  padding="12px 24px"
  class="rounded-6 weight-500 bg-white"
>
  Button Text
</q-btn>
```

**Form Elements**
```vue
<!-- Input Field -->
<q-input
  bg-color="white"
  class="rounded-6 q-px-md"
  :style="{ border: '1px solid #f1f5f9' }"
/>

<!-- Form Section -->
<q-card class="rounded-8 q-pa-md bg-white shadow-1">
  <!-- Form content -->
</q-card>
```

### Follow Quasar's Design Language
- Use consistent padding, typography, and color via Quasar classes
- Stick to Quasar's default icon set (Material Icons)
- Maintain uniform button styles

### Clear Feedback & States
- Show loading indicators during async operations
- Display errors via `$q.notify()`
- Provide success confirmation after actions

### Accessibility (a11y)
- All form inputs must have visible labels or aria-label
- Ensure sufficient contrast and focus visibility
- Make interactive elements keyboard-navigable

### Responsive by Default
- Use Quasar's responsive grid system
- Hide/adjust layout on small screens
- Test on mobile viewports during development

## IV. Performance Requirements

### Lazy Loading & Code Splitting
- Route-level components must be async
- Heavy components should be dynamically imported

### Efficient Reactivity
- Use computed for derived state
- Debounce search inputs
- Avoid inline functions/objects in templates

### Network & Memory Hygiene
- Cancel pending requests when components unmount
- Clean up timers and event listeners
- Avoid storing large datasets in component state

### Bundle Awareness
- Import only needed Quasar components/plugins
- Avoid large third-party libraries

## V. Testing Support
- Add unique ids to elements for easy testing

## VI. Additional Requirements
- Mobile-first responsive design
- Clean, minimalist UI with clear navigation
- Support for both English and French localization
- Progress indicators for all async operations

## Google Apps Script Architecture

### Request Flow
```
Client Request → Security Interceptor → Router → Handler Method → Response Handler → Client
```

### Security
- Validate tokens for secured endpoints
- Intercept all requests

### Router
- Route requests to appropriate methods
- Handle method discovery and invocation

### Response Handler
```javascript
{
  status: "HTTP status code",
  msgKey: "i18nKey", 
  message: "Error message in English",
  data: {},
  token: {
    value: "encrypted",
    ttl: currentUTCTime + 15 minutes,
    username: "username"
  }
}
```

### Best Practices
- **Logging**: Use console.log() thoughtfully
- **Security**: Never hard-code tokens or credentials
- **Caching**: Use CacheService for repeated requests
- **Configuration**: Use PropertiesService for settings

### Implementation Example
```javascript
function doPost(e) {
  return ResponseHandler.handle(() => {
    SecurityInterceptor.validateRequest(e);
    return Router.route(e);
  });
}
```
