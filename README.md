# check-for-secrets

A Node.js CLI tool to detect sensitive patterns (like passwords, keys, or secrets) in your git-cached files or across your repository. Prevent accidental commits of secrets with automated checks—perfect for use with git hooks (e.g., Husky).

---

## Features

- Scans for configurable patterns (e.g., `password`, `key`, `secret`).
- Works on staged (git-cached) or all files in the repo.
- Ignores files and directories configured in `checkforsecrets.config.json` (including `node_modules` and `dist` by default).
- Robust pattern scanning with improved matching logic.
- Fails with a clear error if any forbidden patterns are found.
- Easily integrates with Husky for pre-commit or pre-push hooks.

---

## Installation

```sh
npm install --save-dev check-for-secrets
```

Or use with `npx` (no install required):

```sh
npx check-for-secrets <command>
```

---

## Usage

### CLI Commands

- **Check staged files (default for pre-commit):**
  ```sh
  npx check-for-secrets git-cached
  ```
- **Check all files in the repository:**
  ```sh
  npx check-for-secrets all-files
  ```
- **Add a file to the ignored list:**
  ```sh
  npx check-for-secrets add <file-path>
  ```
  Adds the specified file to the `ignoredFiles` list in `checkforsecrets.config.json` so it will be skipped in future scans.
- **Help:**
  ```sh
  npx check-for-secrets help
  ```

If forbidden patterns are detected, the CLI will list the files and exit with code 1, blocking the commit.

---

## Configuration

Configure ignored files and patterns in `checkforsecrets.config.json`:

```json
{
  "ignoredFiles": ["checkforsecrets.config.json"],
  "ignoredDirectories": ["node_modules", "dist"],
  "patterns": ["password", "key", "secret"]
}
```

---

## Example: Husky Integration

Add to your `.husky/pre-commit` file:

```sh
npx check-for-secrets git-cached
```

---

## Scripts

- `npm run lint:prettier:check` — Check code formatting with Prettier
- `npm run lint:prettier:fix` — Auto-fix formatting with Prettier

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

MIT © 2024 Guilherme Forte
