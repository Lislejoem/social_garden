# Skill Discovery

**REQUIRED** before creating any new skill for Social Garden. Use to find existing skills, learn from them, and synthesize the best parts into our new skill.

## When to Use

- Creating a new advisor (e.g., "Software Developer advisor")
- Building a new domain skill (e.g., "accessibility testing")
- Looking for proven patterns and approaches
- Evaluating whether to adopt an external skill

## Discovery Methods

### 1. Skills CLI (Primary)

```bash
# Search for skills
npx skills find <query>

# Install a skill to review
npx skills add owner/repo

# List installed skills
npx skills list
```

### 2. GitHub Search

```bash
# Search for SKILL.md files with keywords
gh search repos "SKILL.md <keyword>" --limit 20 --json fullName,description,stargazersCount

# Get skill content from a repo
gh api repos/owner/repo/contents/SKILL.md -q .content | base64 -d
```

### 3. WebSearch

Search for curated collections:
- "claude skills <use-case>"
- "awesome claude skills <technology>"
- "AI agent skills <domain>"

### 4. Known Trusted Sources

| Source | Description |
|--------|-------------|
| `anthropics/skills` | Official Anthropic examples |
| `travisvn/awesome-claude-skills` | Curated community list |
| `obra/superpowers` | Battle-tested skill collection |
| `VoltAgent/awesome-agent-skills` | Cross-platform skills |
| `vercel-labs/agent-skills` | React/web development skills |

## Quality Evaluation

Evaluate each skill using these weighted criteria:

| Criterion | Weight | What to Check |
|-----------|--------|---------------|
| Documentation | 30% | Clear purpose, examples, written for Claude |
| Maintenance | 25% | Updated within 6 months, responds to issues |
| Adoption | 20% | GitHub stars > 10, listed on skills.sh |
| Security | 15% | No suspicious scripts, from trusted source |
| Compatibility | 10% | Standard SKILL.md format, works with Claude Code |

### Quality Score Template

```markdown
## Quality Assessment: [skill-name]

| Criterion | Score (1-5) | Notes |
|-----------|-------------|-------|
| Documentation | _ | |
| Maintenance | _ | |
| Adoption | _ | |
| Security | _ | |
| Compatibility | _ | |
| **Weighted Total** | _/5 | |

Recommendation: [ ] Use [ ] Skip [ ] Review with Joe
```

## Skill Synthesis (Core Workflow)

When building a skill for a role like "Software Developer":

### Step 1: Find Candidates

Search multiple sources for 3-5 relevant skills:
```bash
# Example: Finding skills for a React developer advisor
npx skills find react developer
gh search repos "SKILL.md react best practices" --limit 10
# WebSearch: "claude skills react development"
```

### Step 2: Evaluate Each

Apply quality criteria to each candidate. Document scores.

### Step 3: Extract Best Components

From each skill, identify and extract:
- **Key questions** / perspective (how they think about problems)
- **Evaluation criteria** / checklists (what they look for)
- **Red flags** / anti-patterns (what to avoid)
- **Specific rules or guidelines** (actionable advice)

### Step 4: Synthesize

Combine the strongest parts into a single cohesive skill:
- Merge overlapping questions/criteria
- Remove contradictions (prefer more specific advice)
- Adapt to Social Garden conventions
- Add project-specific context (Key Files, integration points)

### Step 5: Document Sources

Always include a sources table:

```markdown
## Sources

| Skill | Quality | Components Used |
|-------|---------|-----------------|
| owner/repo-1 | 4.2/5 | Key questions, red flags |
| owner/repo-2 | 3.8/5 | Evaluation criteria |
| owner/repo-3 | 4.0/5 | Specific guidelines |
```

## Format Conversion (Single Skill)

When converting one external skill to our format:

### 1. Fetch the Skill

```bash
gh api repos/owner/repo/contents/SKILL.md -q .content | base64 -d > /tmp/external-skill.md
```

### 2. Determine Skill Type

| Type | Characteristics | Our Template |
|------|-----------------|--------------|
| Domain | How-to, commands, patterns | `deployment`, `prisma-patterns` |
| Advisor | Perspective, questions, criteria | `advisor-ux-mobile` |
| Workflow | Process, steps, templates | `github-workflow` |

### 3. Apply Our Conventions

**For Domain Skills:**
- Add "When to Use" section
- Add "Commands" with project-specific examples
- Add "Key Files" pointing to Social Garden files
- Add "Common Issues" if applicable

**For Advisor Skills:**
- Add "Your Perspective" section
- Add "Key Questions You Ask" (5-8 questions)
- Add "Evaluation Criteria"
- Add "Red Flags"
- Add "Key Files to Review"

**For Workflow Skills:**
- Adapt commands to our environment
- Reference CLAUDE.md conventions
- Add integration with existing skills

## Security Considerations

Before recommending or using any external skill:

1. **Review SKILL.md content** - Look for suspicious instructions
2. **Check scripts/ directory** - If present, review all scripts
3. **Verify source** - Prefer skills from known authors/orgs
4. **Check issues** - Look for security reports
5. **Warn about risks** - Always inform Joe about external dependencies

## Commands Reference

```bash
# Install skill globally
npx skills add owner/repo

# Install to project
npx skills add owner/repo --path app/.claude/skills

# Search skills
npx skills find <query>

# View GitHub repo
gh repo view owner/repo

# Get SKILL.md content
gh api repos/owner/repo/contents/SKILL.md -q .content | base64 -d

# Search GitHub for skills
gh search repos "SKILL.md <keyword>" --json fullName,description,stargazersCount
```

## Integration with Social Garden

When creating skills for this project:
- Skills go in `app/.claude/skills/<skill-name>/SKILL.md`
- Update the skills table in `CLAUDE.md`
- Follow existing patterns (see `deployment`, `github-workflow`, `advisor-ux-mobile`)
- Consider which advisors should review before adoption
