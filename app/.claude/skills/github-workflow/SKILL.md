# GitHub Workflow Skill

Use when creating issues, pull requests, or managing the project board.

## GitHub CLI Commands

```bash
# Issues
gh issue list                                    # List open issues
gh issue create --title "Title" --body "Body"   # Create issue
gh issue view 123                               # View issue details
gh issue close 123                              # Close issue
gh issue edit 123 --add-label "bug"             # Add label

# Pull Requests
gh pr create --title "Title" --body "Body"      # Create PR
gh pr list                                       # List PRs
gh pr view 123                                   # View PR details
gh pr merge 123                                  # Merge PR

# Projects
gh project list                                  # List projects
gh project view 1                                # View project board
```

## Labels

| Label | Color | Use for |
|-------|-------|---------|
| `bug` | red | Something broken |
| `feature` | green | New functionality |
| `enhancement` | cyan | Improvement to existing |
| `v1` | purple | V1 milestone |
| `v2` | blue | V2 milestone |
| `v3` | yellow | V3 milestone |
| `blocked` | dark red | Waiting on dependency |
| `needs-triage` | yellow | Needs categorization |
| `deployment` | peach | Infrastructure issues |

## CI/CD

GitHub Actions runs on every PR to `main`:
- `npm run test:run` - Tests must pass
- `npm run build` - Build must succeed

PRs that fail CI should not be merged.

## Workflow

1. **Create issue first** - Before starting work on bugs/features
2. **Reference in PR** - Use `Closes #123` in PR description
3. **Wait for CI** - Ensure tests and build pass
4. **Merge** - After review and CI pass
5. **Close issue** - Automatically closed by PR merge if referenced

## Project Board

"Grove Roadmap" at: https://github.com/users/Lislejoem/projects/1

Columns: Backlog → Ready → In Progress → Done

## Issue Templates

Located in `.github/ISSUE_TEMPLATE/`:
- `bug_report.md` - Bug reports with reproduction steps
- `feature_request.md` - Feature requests with use cases
- `config.yml` - Allows blank issues for quick capture

## PR Template

Located at `.github/PULL_REQUEST_TEMPLATE.md`:
- Summary of changes
- Related issues
- Testing checklist
