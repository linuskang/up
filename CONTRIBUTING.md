# Contributing

Thank you for your interest in contributing to this project!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/<your-username>/up.linus.my.git`
3. Install dependencies: `npm ci`
4. Set up environment variables (copy `.env.example` to `.env` and fill in)
5. Generate Prisma client: `npx prisma generate`

## Development Workflow

- Create a new branch from `main`: `git checkout -b feature/my-feature`
- Make your changes
- Run linting: `npm run lint`
- Run type checking: `npm run typecheck`
- Build the project: `npm run build`
- Commit your changes with a clear message
- Push to your fork and open a pull request

## Pull Request Guidelines

- Ensure your PR description clearly describes the problem and solution
- Link any related issues using `Closes #123`
- Keep changes focused and minimal
- Ensure CI passes before requesting review
- Update relevant documentation if needed

## Code Style

- Follow the existing code style
- Run `npm run lint` before committing
- Use TypeScript for all new code
- Prefer functional components for React

## Reporting Bugs

Please use the bug report issue template and include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Any relevant logs or screenshots

## Questions

For questions, please use [GitHub Discussions](https://github.com/linusdotmy/up.linus.my/discussions).
