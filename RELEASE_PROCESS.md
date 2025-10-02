# Release Process Template

## 📋 **Release Checklist**

### **Before Merging to v3**

- [ ] Update `CHANGELOG.md` with new features/fixes
- [ ] Update version in `frontend/package.json` (and `api/package.json` if needed)
- [ ] Test your changes thoroughly

### **When Creating PR from v3 → prod**

- [ ] Create git tag for the release
- [ ] Create GitHub release with proper notes

---

## 📝 **CHANGELOG.md Template**

```markdown
# Changelog

All notable changes to Freequency v3 will be documented in this file.

## [Unreleased]

## [3.1.0] - 2025-01-XX

### Added

- New user profile search functionality
- Enhanced practice session tracking
- Mobile-responsive design improvements

### Changed

- Updated authentication flow
- Improved performance on feed loading

### Fixed

- Fixed issue with task creation
- Resolved mobile navigation bug

### Security

- Updated dependencies for security patches
```

---

## 🏷️ **Version Bumping Guide**

### **Minor Release (3.0.0 → 3.1.0)**

- **When**: New features, significant improvements
- **Examples**: New user profiles, enhanced practice tracking, UI improvements
- **Update**: `frontend/package.json` version to `3.1.0`

### **Patch Release (3.1.0 → 3.1.1)**

- **When**: Bug fixes, small improvements
- **Examples**: Fixed login bug, improved error messages, performance tweaks
- **Update**: `frontend/package.json` version to `3.1.1`

---

## 🚀 **Manual Release Process**

### **Step 1: Update CHANGELOG.md**

```markdown
## [3.1.0] - 2025-01-26

### Added

- Professional release management system
- User-facing version display in About page
- Automated version synchronization

### Changed

- About page now shows current version from package.json
- Improved release documentation

### Fixed

- Version display now stays in sync with releases
```

### **Step 2: Update Package Version**

```bash
# Update frontend/package.json
"version": "3.1.0"

# Update api/package.json (if you have API changes)
"version": "3.1.0"
```

### **Step 3: Create Git Tag**

```bash
# Switch to prod branch
git checkout prod

# Create annotated tag
git tag -a v3.1.0 -m "Release v3.1.0: Professional release management system"

# Push tag to GitHub
git push origin v3.1.0
```

### **Step 4: Create GitHub Release**

1. Go to: https://github.com/Willy-McNamara/freequency/releases/new
2. **Tag version**: `v3.1.0`
3. **Release title**: `Release v3.1.0`
4. **Description**: Copy from your CHANGELOG.md entry
5. **Publish release**

---

## 📋 **Release Notes Template**

```markdown
## What's New in v3.1.0

### 🎉 New Features

- **Professional Release Management**: Proper version tracking and release notes
- **User Version Display**: About page now shows current version
- **Release Documentation**: Clear process for managing releases

### 🐛 Bug Fixes

- Version display now stays in sync with actual releases
- Improved release workflow documentation

### 🔧 Technical Improvements

- Automated version synchronization between releases and app display
- Better release management process

---

**Full Changelog**: https://github.com/Willy-McNamara/freequency/compare/v3.0.0...v3.1.0
```

---

## 🎯 **Your Workflow**

### **For Feature Releases (Minor)**

1. **Develop features** → Merge to v3
2. **Update CHANGELOG.md** with new features
3. **Bump version** to next minor (3.0.0 → 3.1.0)
4. **Create PR** v3 → prod
5. **After merge**: Create tag `v3.1.0` and GitHub release

### **For Bug Fix Releases (Patch)**

1. **Fix bugs** → Merge to v3
2. **Update CHANGELOG.md** with fixes
3. **Bump version** to next patch (3.1.0 → 3.1.1)
4. **Create PR** v3 → prod
5. **After merge**: Create tag `v3.1.1` and GitHub release

---

## 💡 **Tips**

- **Group related changes**: Don't create a release for every single commit
- **Write clear release notes**: Users should understand what's new
- **Test before releasing**: Make sure everything works in production
- **Keep it simple**: Start with basic release notes, you can always improve later

---

_This template gives you full control over your release process while keeping it simple and manageable._
