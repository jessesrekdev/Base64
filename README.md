# Open Base64 Studio

A responsive Base64 encoder and decoder, built with React, TypeScript and Vite. Part of the Open Studio family by Jesse Srek.

## Features

- Dashboard and live text/file conversion workspace
- UTF-8 text, standard Base64, URL-safe Base64 and data URLs
- File upload and drag-and-drop, image previews, copy and download
- Browser-local saved project library with search, editing and deletion
- Light and dark themes, developer documentation and mobile navigation

## Development

```sh
npm install
npm run dev
npm run build
npm run preview
```

Deploy the generated `dist` folder using a static host such as Cloudflare Pages or Netlify. Build command: `npm run build`.

## Privacy and limitations

Conversions happen in the browser; no conversion data is sent to a server. Base64 is not encryption. Projects are stored in localStorage only when saved, with a limit of one million serialized characters per project, subject to browser quota. Files are limited to 10 MiB per conversion. The upgraded library does not import old CodeVault IndexedDB entries. The original implementation remains on the main branch. A public server API is not part of this version.

## Author

[Jesse Srek](https://github.com/jessesrekdev) · [Open QR Studio](https://open-qr-studio.pages.dev)
