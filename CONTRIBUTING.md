# Contributing to HE-Messenger

Thank you for your interest in contributing to **HE-Messenger**! This document provides guidelines and instructions for contributing.

---

## 🤝 Code of Conduct

- Be respectful and constructive
- Welcome diverse perspectives
- Focus on the code, not the person
- Report harassment or violations privately

---

## 📋 Before You Start

- Check [existing issues](https://github.com/shadow9-1-1/HE-Messenger/issues) to avoid duplicates
- For major changes, open a discussion first
- Read [ARCHITECTURE.md](./docs/ARCHITECTURE.md) to understand the system
- Set up [development environment](./docs/SETUP.md)

---

## 🔄 Pull Request Workflow

### 1. Fork & Branch

```bash
git clone https://github.com/YOUR_USERNAME/HE-Messenger.git
cd HE-Messenger
git checkout -b feature/my-feature
```

Use descriptive branch names:
- `feature/add-search` ✅
- `bugfix/fix-socket-disconnect` ✅
- `docs/update-api-reference` ✅

### 2. Make Changes

- Follow the existing code style (see below)
- Keep commits atomic and logical
- Write clear commit messages

**Commit Message Format:**
```
type(scope): brief description

- Optional detailed explanation
- Why this change was needed
```

Examples:
```
feat(auth): add passwordless login via OTP

fix(redis): prevent connection pool exhaustion on restart

docs(setup): clarify MongoDB Atlas connection string
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### 3. Push & Create PR

```bash
git push origin feature/my-feature
```

Then open a Pull Request on GitHub with:
- **Clear title** (same format as commit message)
- **Description** of changes and why
- **Testing** instructions if applicable
- **Screenshots** if UI changes

---

## 💻 Code Style Guide

### TypeScript

- Use `const` by default, `let` when needed, avoid `var`
- Use explicit type annotations for function parameters
- Use `interface` for object types (not `type`)
- Keep lines under 100 characters (except URLs)

**Good:**
```typescript
interface User {
  uid: string;
  displayName: string;
  email: string;
}

async function createUser(user: User): Promise<void> {
  // implementation
}
```

**Bad:**
```typescript
let user = { uid: "123", displayName: "John", email: "john@example.com" };
function createUser(user) { }  // missing type
```

### File Organization

**Backend (`src/`):**
```
config/          # External service initialization
├── firebase.ts
├── mongodb.ts
├── redis.ts
└── socket.ts

middleware/      # Express middleware
models/          # Mongoose schemas
routes/          # Express route handlers
services/        # Business logic & utilities
```

**Frontend (`src/`):**
```
app/             # Next.js pages
components/      # Reusable React components
context/         # Context providers
lib/             # Utilities & helpers
```

### Frontend React Components

```typescript
// Use functional components with hooks
export function ChatRoom({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Keep components focused on a single responsibility
  return (
    <div className="chat-room">
      <MessageList messages={messages} />
      <MessageInput onSend={(msg) => sendMessage(roomId, msg)} />
    </div>
  );
}
```

---

## 🧪 Testing

### Before Submitting

1. **Lint your code:**
   ```bash
   cd backend && npm run lint
   cd ../frontend && npm run lint
   ```

2. **Type check:**
   ```bash
   cd backend && npm run type-check
   cd ../frontend && npm run type-check
   ```

3. **Test locally:**
   ```bash
   # Backend: npm run dev
   # Frontend: npm run dev
   # Verify the app works as expected
   ```

### Writing Tests (Future)

When test coverage is added, include tests for:
- API endpoint responses
- Socket.IO event handlers
- React component rendering & interactions
- Auth middleware verification

---

## 📝 Commit Message Examples

### Good Commits

```
feat(messages): implement message search in rooms

- Add full-text search using MongoDB aggregation pipeline
- Add frontend search input with debounced API calls
- Cache search results in React state
- Fixes #123
```

```
fix(socket): handle socket reconnection gracefully

- Queue messages during disconnect
- Send queued messages after reconnect
- Add reconnection event listener
- Fixes #456
```

### Bad Commits (Avoid)

```
update stuff                      # Too vague
fixed the thing that was broken   # Unclear
asdf                              # Not a message
```

---

## 🐛 Reporting Bugs

Use the [GitHub Issues](https://github.com/shadow9-1-1/HE-Messenger/issues) template:

1. **Title:** Clear, concise bug description
2. **Reproduction Steps:** How to reproduce the issue
3. **Expected Behavior:** What should happen
4. **Actual Behavior:** What actually happens
5. **Environment:** OS, Node.js version, etc.
6. **Logs/Screenshots:** Error messages or visual proof

---

## ✨ Feature Requests

1. **Use GitHub Discussions** for brainstorming
2. **Or open an Issue** with the feature template:
   - Why this feature is needed
   - How it benefits users
   - Proposed implementation (optional)
   - Alternative solutions (if any)

---

## 📚 Documentation

Help improve docs by:
- Fixing typos or unclear explanations
- Adding examples or diagrams
- Clarifying setup instructions
- Adding API endpoint documentation

**Docs live in:**
- [README.md](./README.md) — Project overview
- [SETUP.md](./docs/SETUP.md) — Installation & configuration
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — System design
- [API.md](./docs/API.md) — Endpoint reference

---

## 🚀 Review Process

1. GitHub automatically runs checks (linting, types)
2. Maintainers review your PR
3. Feedback or requests for changes
4. Once approved, PR is merged

**Note:** Be patient. Maintainers are volunteers. :)

---

## 🎓 Learning Resources

- [Express.js Docs](https://expressjs.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Socket.IO Guide](https://socket.io/docs/v4/)
- [MongoDB + Mongoose](https://mongoosejs.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Redis Commands](https://redis.io/commands)

---

## ❓ Questions?

- **Setup Issues:** Check [SETUP.md](./docs/SETUP.md)
- **Architecture Questions:** Read [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **General Help:** Start a [GitHub Discussion](https://github.com/shadow9-1-1/HE-Messenger/discussions)

---

Thank you for contributing to HE-Messenger! 🙌
