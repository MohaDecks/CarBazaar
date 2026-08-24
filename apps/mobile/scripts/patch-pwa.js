const fs = require("fs");
const path = require("path");

const dist = path.join(__dirname, "..", "dist");
const publicDir = path.join(__dirname, "..", "public");
const htmlPath = path.join(dist, "index.html");

fs.mkdirSync(dist, { recursive: true });
for (const file of ["icon.png", "manifest.json", "sw.js"]) {
  const from = path.join(publicDir, file);
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, path.join(dist, file));
  }
}

if (!fs.existsSync(htmlPath)) {
  process.exit(0);
}

let html = fs.readFileSync(htmlPath, "utf8");
const tags = `
    <link rel="manifest" href="/manifest.json" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="DriveET" />
    <link rel="apple-touch-icon" href="/icon.png" />
`;

if (!html.includes('rel="manifest"')) {
  html = html.replace("</head>", `${tags}</head>`);
}

html = html.replace(
  'content="width=device-width, initial-scale=1, shrink-to-fit=no"',
  'content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no"'
);

fs.writeFileSync(htmlPath, html);
console.log("PWA assets patched in dist/");
