---
allowed-tools: Bash(npm run lint:*), Read, Grep
description: Run ESLint and fix issues
---

# ESLint Check

Run ESLint with Next.js configuration.

## Commands

### Check for Issues

```bash
cd app && npm run lint
```

### Auto-fix Issues

```bash
cd app && npm run lint -- --fix
```

## Common Issues

### 1. Unused Variables

ESLint will flag unused variables. Either:
- Remove them if truly unused
- Prefix with `_` if intentionally unused: `_unusedVar`

### 2. React Hook Dependencies

Missing dependencies in useEffect/useCallback:

```typescript
// Add missing dependencies
useEffect(() => {
  doSomething(value);
}, [value]); // Include 'value' in deps
```

### 3. Unescaped Entities

Use proper escaping in JSX:

```typescript
// Wrong
<p>Don't do this</p>

// Right
<p>Don&apos;t do this</p>
```

### 4. Image Alt Text

All `<img>` tags need alt text for accessibility:

```typescript
<img src={url} alt="Contact avatar" />
```

$ARGUMENTS
