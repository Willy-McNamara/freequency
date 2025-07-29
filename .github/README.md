# GitHub CI/CD Setup

## Overview

This repository uses GitHub Actions to enforce testing on pull requests to the `v3` branch.

## Workflow Configuration

### CI Workflow (`.github/workflows/ci.yml`)

The CI workflow runs on:

- Pull requests to the `v3` branch
- Direct pushes to the `v3` branch

### Jobs

1. **test-backend**: Runs NestJS tests and coverage
2. **test-frontend**: Runs React tests and coverage
3. **test-summary**: Ensures all tests pass before merge

### Features

- ✅ Automated testing on PRs
- ✅ Code coverage reporting via Codecov
- ✅ Linting checks
- ✅ NPM dependency caching for faster builds
- ✅ Status checks required before merge

## Setting Up Branch Protection

To enforce this workflow, you need to configure branch protection rules in GitHub:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Branches**
3. Click **Add rule** for the `v3` branch
4. Configure the following settings:

### Required Status Checks

- ✅ **Require status checks to pass before merging**
- ✅ **Require branches to be up to date before merging**
- Add these status checks:
  - `test-backend`
  - `test-frontend`
  - `test-summary`

### Pull Request Reviews

- ✅ **Require a pull request before merging**
- ✅ **Require approvals** (recommend 1-2 reviewers)
- ✅ **Require review from code owners**
- ✅ **Require conversation resolution before merging**

### Additional Settings

- ✅ **Include administrators in these restrictions**
- ✅ **Restrict pushes that create files larger than 100MB**
- ✅ **Require linear history**
- ❌ **Allow force pushes**
- ❌ **Allow deletions**

## Codecov Integration

The workflow automatically uploads coverage reports to Codecov. To view coverage:

1. Connect your repository to [Codecov](https://codecov.io)
2. Coverage reports will be available for each PR and commit
3. Coverage badges can be added to your README

## Local Testing

Before pushing, run tests locally:

```bash
# Backend
cd api
npm test
npm run test:cov

# Frontend
cd frontend
npm test
npm run test:coverage
```

## Troubleshooting

### Workflow Fails

- Check that all tests pass locally
- Ensure linting passes (`npm run lint`)
- Verify coverage thresholds are met

### Branch Protection Issues

- Ensure the `v3` branch exists
- Verify status checks are properly named
- Check that the workflow has permission to run
