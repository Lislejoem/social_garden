---
allowed-tools: Bash(git:*)
description: Create a conventional commit with staged changes
---

# Create Commit

Generate a conventional commit message for staged changes.

## Steps

1. Check git status and staged changes
2. Analyze the changes
3. Create commit with conventional format

## Conventional Commit Format

```
<type>(<scope>): <description>

[optional body]

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Formatting, no code change
- **refactor**: Code restructure, no behavior change
- **test**: Adding tests
- **chore**: Maintenance, dependencies

## Scopes for This Project

- **api**: API routes (`/api/*`)
- **ui**: Components
- **db**: Prisma schema/migrations
- **health**: Health calculation logic
- **voice**: Voice recording/processing

## Examples

```
feat(api): add duplicate preference detection
fix(voice): handle Web Speech API errors gracefully
docs: add JSDoc to utility functions
refactor(ui): extract editable component pattern
```

$ARGUMENTS
