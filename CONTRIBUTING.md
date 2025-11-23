# Contributing to KnotIQ

Thank you for your interest in contributing to KnotIQ! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/crochet-reboot.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Make your changes
6. Test your changes thoroughly
7. Commit your changes: `git commit -m 'Add some feature'`
8. Push to your branch: `git push origin feature/your-feature-name`
9. Open a Pull Request

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing code style and patterns
- Use functional components and hooks
- Keep components small and focused
- Add comments for non-obvious logic

### File Structure

- Place new screens in `app/`
- Place reusable components in `components/`
- Place custom hooks in `hooks/`
- Place utility functions in `lib/`
- Place types in `types/`
- Place stores in `store/`

### Testing

- Test on iOS, Android, and Web when possible
- Test edge cases and error states
- Ensure no TypeScript errors: `npx tsc --noEmit`
- Test navigation flows
- Test data persistence

### Commit Messages

Use clear, descriptive commit messages:
- `feat: Add counter rename functionality`
- `fix: Fix yarn form empty state`
- `docs: Update README with new features`
- `style: Improve spacing in Patterns tab`

## Feature Requests

If you have a feature request:
1. Check if it's already in the roadmap
2. Open an issue describing the feature
3. Explain the use case and benefits

## Bug Reports

When reporting bugs, please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Platform (iOS/Android/Web)
- Screenshots if applicable

## Pull Request Process

1. Ensure your code follows the style guidelines
2. Update documentation if needed
3. Add tests if applicable
4. Ensure all tests pass
5. Update CHANGELOG.md if applicable
6. Request review from maintainers

## Questions?

Feel free to open an issue for any questions or clarifications!

Thank you for contributing! 🧶

