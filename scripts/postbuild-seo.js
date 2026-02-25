/**
 * Post-build script that injects SEO meta tags, structured data,
 * GA4 analytics, and mobile web CSS into Expo Web's generated index.html.
 *
 * Run after `npx expo export --platform web`.
 */
const fs = require('fs');
const path = require('path');

const DIST_HTML = path.join(__dirname, '..', 'dist', 'index.html');

const CONFIG = {
  url: 'https://work-hour-calculator.vercel.app',
  title: '근무 시간 계산기 - 주간 근무시간 쉽게 계산',
  description:
    '주간 근무 시간을 드래그로 쉽게 계산하고 관리하는 웹앱. 출퇴근 시간 입력, 점심시간 자동 제외, 주간 근무시간 합계를 한눈에 확인하세요.',
  keywords:
    '근무시간 계산기,출퇴근 시간 계산,주간 근무시간,근무시간 관리,근태 관리,work hour calculator',
  themeColor: '#2CB5AC',
  gaId: 'G-SVLCX60GJY',
};

// --- Meta tags ---
const metaTags = `
    <meta name="description" content="${CONFIG.description}">
    <meta name="keywords" content="${CONFIG.keywords}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${CONFIG.url}/">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${CONFIG.title}">
    <meta property="og:description" content="${CONFIG.description}">
    <meta property="og:url" content="${CONFIG.url}/">
    <meta property="og:locale" content="ko_KR">
    <meta property="og:site_name" content="근무 시간 계산기">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${CONFIG.title}">
    <meta name="twitter:description" content="${CONFIG.description}">
`;

// --- JSON-LD structured data ---
const jsonLd = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "근무 시간 계산기",
      "description": "${CONFIG.description}",
      "url": "${CONFIG.url}",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
      "inLanguage": ["ko"]
    }
    </script>
`;

// --- GA4 ---
const ga4 = `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${CONFIG.gaId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${CONFIG.gaId}');
    </script>
`;

// --- noscript fallback ---
const noscript = `
    <noscript>
      <h1>근무 시간 계산기</h1>
      <p>주간 근무 시간을 드래그로 쉽게 계산하고 관리하는 웹앱입니다. 출퇴근 시간을 입력하면 점심시간을 자동으로 제외하고 주간 근무시간 합계를 한눈에 확인할 수 있습니다.</p>
      <ul>
        <li>드래그로 출퇴근 시간 입력</li>
        <li>점심시간 자동 제외</li>
        <li>주간 근무시간 합계 계산</li>
        <li>스케줄 공유 기능</li>
      </ul>
    </noscript>
`;

// --- Mobile web CSS ---
const mobileCss = `
    <style id="mobile-ux-css">
      html, body { height: 100%; }
      body {
        overflow: hidden;
        background-color: #F0F2F5;
        margin: 0;
      }
      * { user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
      input, textarea { user-select: text; -webkit-user-select: text; }
      #root { display: flex; height: 100%; flex: 1; max-width: 480px; margin: 0 auto; }
    </style>
`;

// --- Patch ---
let html = fs.readFileSync(DIST_HTML, 'utf-8');

// Fix lang attribute
html = html.replace('<html lang="en">', '<html lang="ko">');

// Replace title
html = html.replace(
  /<title>[^<]*<\/title>/,
  `<title>${CONFIG.title}</title>`
);

// Inject meta tags before </head>
html = html.replace(
  '</head>',
  `${metaTags}${jsonLd}${ga4}${mobileCss}</head>`
);

// Replace noscript content
html = html.replace(
  /<noscript>[\s\S]*?<\/noscript>/,
  noscript.trim()
);

fs.writeFileSync(DIST_HTML, html, 'utf-8');
console.log('[postbuild-seo] SEO tags injected into dist/index.html');
