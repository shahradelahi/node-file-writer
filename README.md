<h1 align="center">
  <sup>@se-oss/file-writer</sup>
  <br>
  <a href="https://github.com/shahradelahi/node-file-writer/actions/workflows/ci.yml"><img src="https://github.com/shahradelahi/node-file-writer/actions/workflows/ci.yml/badge.svg?branch=main&event=push" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@se-oss/file-writer"><img src="https://img.shields.io/npm/v/@se-oss/file-writer.svg" alt="NPM Version"></a>
  <a href="/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat" alt="MIT License"></a>
  <a href="https://bundlephobia.com/package/@se-oss/file-writer"><img src="https://img.shields.io/bundlephobia/minzip/@se-oss/file-writer" alt="npm bundle size"></a>
  <a href="https://packagephobia.com/result?p=@se-oss/file-writer"><img src="https://packagephobia.com/badge?p=@se-oss/file-writer" alt="Install Size"></a>
</h1>

_@se-oss/file-writer_ is a fast, atomic async file writer with automatic retries and race-condition protection for Node.js.

---

- [Installation](#-installation)
- [Usage](#-usage)
- [Contributing](#-contributing)
- [License](#license)

## 📦 Installation

```bash
npm install @se-oss/file-writer
```

<details>
<summary>Install using your favorite package manager</summary>

**pnpm**

```bash
pnpm install @se-oss/file-writer
```

**yarn**

```bash
yarn add @se-oss/file-writer
```

</details>

## 📖 Usage

### Atomic Writing

```typescript
import { FileWriter } from '@se-oss/file-writer';

// Create a singleton writer for a file
const writer = new FileWriter('data.json');

// Safe under concurrent calls (writes are ordered and coalesced)
await writer.write(JSON.stringify({ updatedAt: Date.now() }));
```

### Custom Options

```typescript
import { FileWriter } from '@se-oss/file-writer';

const writer = new FileWriter('data.txt', {
  encoding: 'utf-8',
  retry: {
    maxRetries: 5,
    delayMs: 50,
  },
});

await writer.write('Hello, world!');
```

## 🤝 Contributing

Want to contribute? Star the project or raise issues on [GitHub](https://github.com/shahradelahi/node-file-writer).

Thanks again for your support! 🙏

## License

[MIT](/LICENSE) © [Shahrad Elahi](https://github.com/shahradelahi) and [contributors](https://github.com/shahradelahi/node-file-writer/graphs/contributors).
