/**
 * Sent Tweaks Downloads – a standalone Cloudflare Worker.
 * Published files are maintained in a GitHub repository's files.json.
 * No files are hosted or proxied by this Worker: download targets are HTTPS links.
 */
const DEFAULT_MANIFEST_URL = 'https://raw.githubusercontent.com/sgjjjbbsxvnko/SentTweaks-Downloads/main/files.json';
const MAX_ENTRIES = 200;

function safeText(value, limit = 220) {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

function normalizeEntry(item) {
  if (!item || typeof item !== 'object') return null;
  const id = safeText(item.id, 80);
  const name = safeText(item.name, 110);
  const url = safeText(item.url, 1600);
  if (!/^[a-zA-Z0-9_-]{2,80}$/.test(id) || !name) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return null;
  } catch { return null; }
  return {
    id, name, url,
    description: safeText(item.description, 300),
    version: safeText(item.version, 35),
    platform: ['Android', 'iOS', 'Windows', 'Khác'].includes(item.platform) ? item.platform : 'Khác',
    size: safeText(item.size, 32),
    updated: safeText(item.updated, 40),
    featured: item.featured === true,
  };
}

async function listFiles(env) {
  const manifest = env.FILES_JSON_URL || DEFAULT_MANIFEST_URL;
  try {
    const target = new URL(manifest);
    if (target.protocol !== 'https:') return [];
    const response = await fetch(target.toString(), {
      headers: { 'Accept': 'application/json' },
      cf: { cacheEverything: true, cacheTtl: 90 },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return [];
    const text = await response.text();
    if (text.length > 250000) return [];
    const data = JSON.parse(text);
    if (!Array.isArray(data)) return [];
    const seen = new Set();
    return data.slice(0, MAX_ENTRIES).map(normalizeEntry).filter(f => {
      if (!f || seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
  } catch (error) {
    console.error(JSON.stringify({ event: 'manifest_fetch_failed', message: String(error) }));
    return [];
  }
}

const HTML = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="theme-color" content="#090c16" />
  <meta name="description" content="Thư viện tải xuống APK, IPA, ZIP và các bản cập nhật của Sent Tweaks." />
  <title>Sent Tweaks — Downloads</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <style>
    :root{color-scheme:dark;--bg:#090c16;--card:#11182a;--border:#26324b;--text:#edf3ff;--muted:#a0adc5;--purple:#aa8aff;--cyan:#6cdeee}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:radial-gradient(900px 540px at 82% -10%,#34326c71,transparent 72%),radial-gradient(650px 500px at -20% 30%,#104c5b4d,transparent 80%),var(--bg);color:var(--text);font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;min-height:100vh}
    body:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.11;background-image:linear-gradient(#9d8ff633 1px,transparent 1px),linear-gradient(90deg,#9d8ff633 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(to bottom,#000,transparent 85%)}
    a{color:inherit;text-decoration:none}button,input{font:inherit}button{cursor:pointer}
    .wrap{width:min(1140px,calc(100% - 38px));margin:auto;position:relative}
    header{border-bottom:1px solid #ffffff13;background:#080b14a8;backdrop-filter:blur(20px);position:sticky;top:0;z-index:8}
    .head{height:78px;display:flex;align-items:center;justify-content:space-between;gap:12px}
    .brand{display:flex;align-items:center;gap:13px;font-size:16px;font-weight:800;letter-spacing:.3px}.brand-icon{height:42px;width:42px;border-radius:14px;display:grid;place-items:center;color:white;background:linear-gradient(140deg,#6b63d9,#4d9dcc);box-shadow:0 8px 30px #6862e543;font-weight:900}.brand small{display:block;color:#9dacc6;font-size:10px;letter-spacing:2.8px;font-weight:700;margin-top:3px}
    .navlink{font-size:13px;border:1px solid var(--border);border-radius:12px;padding:12px 16px;color:#d6e0f3;background:#ffffff08}.navlink:hover{border-color:#7c91bf}
    .hero{padding:88px 0 60px;text-align:center}.eyebrow{display:inline-flex;align-items:center;gap:10px;color:#c8c3ff;font-weight:800;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;background:#9582ff15;border:1px solid #9282fa4a;padding:10px 15px;border-radius:30px}.dot{height:7px;width:7px;border-radius:50%;background:#7fedcc;box-shadow:0 0 14px #60f7d1}
    h1{font-size:clamp(42px,7vw,78px);letter-spacing:-3px;line-height:1.08;margin:25px 0 21px;font-weight:850}h1 span{background:linear-gradient(95deg,#d8bcff,#8ab9ff,#72e9ef);-webkit-background-clip:text;background-clip:text;color:transparent}
    .lead{color:var(--muted);font-size:clamp(15px,2vw,18px);line-height:1.7;max-width:630px;margin:0 auto 34px}
    .chips{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}.chip{font-size:12px;color:#c0d0ec;border:1px solid #37415a;border-radius:100px;padding:9px 14px;background:#121929aa}
    .section{padding:35px 0 105px}.heading{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:24px}.heading h2{font-size:28px;letter-spacing:-.8px;margin:0 0 6px}.heading p{margin:0;color:var(--muted);font-size:14px}.counter{background:#19243b;border:1px solid var(--border);padding:8px 12px;border-radius:99px;color:#cfdaf0;font-size:12px;white-space:nowrap}
    .toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:27px}.search{display:flex;align-items:center;gap:12px;flex:1;max-width:510px;background:#151c2ce6;border:1px solid var(--border);border-radius:14px;padding:0 16px;transition:border-color .2s}.search:focus-within{border-color:#a695ec}.search svg{flex:none;color:#9aaac8}.search input{height:50px;width:100%;background:transparent;color:var(--text);border:0;outline:none;min-width:0}.search input::placeholder{color:#77849c}
    .filters{display:flex;flex-wrap:wrap;gap:8px}.filter{border:1px solid var(--border);background:#11182acc;color:#b8c3d9;padding:11px 15px;border-radius:12px;font-size:13px;font-weight:650;transition:.2s}.filter.active,.filter:hover{background:#8873df24;color:#e6dcff;border-color:#8873df}
    .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.file{background:linear-gradient(150deg,#182035ee,#101827ef);border:1px solid var(--border);border-radius:22px;padding:23px;transition:transform .2s,border-color .2s,box-shadow .2s;min-height:280px;display:flex;flex-direction:column}.file:hover{transform:translateY(-4px);border-color:#7768a2;box-shadow:0 18px 50px #0005}
    .filetop{display:flex;align-items:center;justify-content:space-between;margin-bottom:25px}.fileico{width:52px;height:52px;display:grid;place-items:center;border-radius:15px;background:linear-gradient(135deg,#7051c33a,#447fb038);border:1px solid #9576e54f;font-weight:900;font-size:14px;color:#d6c3ff}.pill{font-size:11px;font-weight:750;padding:7px 10px;border-radius:8px;background:#1b3042;color:#8bd8e9}.file h3{font-size:19px;margin:0 0 9px;letter-spacing:-.3px}.desc{color:#98a8c3;font-size:13px;line-height:1.65;margin:0 0 18px;min-height:41px}.meta{display:flex;gap:12px;flex-wrap:wrap;color:#9baac3;font-size:12px;margin-top:auto}.meta span{white-space:nowrap}.download{margin-top:22px;background:linear-gradient(100deg,#7569e0,#498eb9);border-radius:12px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:13px;color:white}.download:hover{filter:brightness(1.15)}
    .empty{border:1px dashed #3b4965;border-radius:24px;background:linear-gradient(130deg,#182136ab,#131a2bac);padding:58px 22px;text-align:center;grid-column:1/-1}.empty-ico{margin:0 auto 20px;height:66px;width:66px;border-radius:18px;display:grid;place-items:center;background:#7776d51c;color:#c6bdff;font-size:30px}.empty h3{font-size:20px;margin:0 0 10px}.empty p{font-size:14px;color:var(--muted);line-height:1.6;margin:0 auto;max-width:450px}
    footer{border-top:1px solid #ffffff18;padding:30px 0;color:#8190aa;font-size:12px}.foot{display:flex;justify-content:space-between;gap:15px;flex-wrap:wrap}.foot strong{color:#d1d9ee}
    @media(max-width:900px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.toolbar{align-items:stretch;flex-direction:column}.search{max-width:none}.hero{padding-top:65px}}
    @media(max-width:620px){.grid{grid-template-columns:1fr}.head{height:66px}.hero{padding:60px 0 42px}h1{letter-spacing:-2px}.section{padding-top:24px}.heading h2{font-size:23px}.navlink{font-size:12px;padding:10px}.file{min-height:250px}.filters{gap:7px}.filter{padding:10px 11px}.foot{flex-direction:column}}
    @media(prefers-reduced-motion:reduce){*,*:before,*:after{scroll-behavior:auto!important;transition:none!important}}
  </style>
</head>
<body>
  <header><div class="wrap head"><a class="brand" href="/"><span class="brand-icon">ST</span><span>SENT TWEAKS<small>DOWNLOAD CENTER</small></span></a><a class="navlink" href="#files">Khám phá tệp ↓</a></div></header>
  <main class="wrap">
    <section class="hero"><div class="eyebrow"><span class="dot"></span> THƯ VIỆN TẢI XUỐNG</div><h1>Tải xuống <span>nhanh chóng.</span><br/>Đơn giản & rõ ràng.</h1><p class="lead">Tổng hợp các phiên bản ứng dụng và tài nguyên được công bố bởi Sent Tweaks. Tìm đúng tệp, chọn nền tảng và tải xuống dễ dàng.</p><div class="chips"><span class="chip">◇ Android / APK</span><span class="chip">◇ iOS / IPA</span><span class="chip">◇ ZIP & tài nguyên</span></div></section>
    <section class="section" id="files"><div class="heading"><div><h2>Danh sách tệp</h2><p>Những bản phát hành đang có sẵn để tải xuống.</p></div><div class="counter" id="counter">Đang tải...</div></div>
      <div class="toolbar"><label class="search" aria-label="Tìm kiếm tệp"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input id="query" type="search" placeholder="Tìm tên ứng dụng, phiên bản..." autocomplete="off" /></label><div class="filters" role="group" aria-label="Bộ lọc nền tảng"><button class="filter active" data-filter="Tất cả">Tất cả</button><button class="filter" data-filter="Android">Android</button><button class="filter" data-filter="iOS">iOS</button><button class="filter" data-filter="Khác">Khác</button></div></div>
      <div class="grid" id="grid"><div class="empty"><div class="empty-ico">↓</div><h3>Đang tải dữ liệu</h3><p>Hệ thống đang kiểm tra danh sách các tệp đã công bố.</p></div></div>
    </section>
  </main>
  <footer><div class="wrap foot"><span><strong>Sent Tweaks</strong> — Download Center</span><span>Tệp được lưu trữ tại liên kết của nhà phát hành.</span></div></footer>
  <script>
    (function(){
      'use strict';
      var files=[], filter='Tất cả', query='';
      var grid=document.getElementById('grid'),counter=document.getElementById('counter');
      function el(tag,cls,text){var v=document.createElement(tag);if(cls)v.className=cls;if(text!==undefined)v.textContent=text;return v;}
      function empty(title,body){var box=el('div','empty');box.append(el('div','empty-ico','↓'),el('h3','',title),el('p','',body));grid.replaceChildren(box);}
      function card(f){
        var box=el('article','file');
        var top=el('div','filetop'), ico=el('div','fileico',f.platform==='Android'?'APK':f.platform==='iOS'?'IPA':f.platform==='Windows'?'EXE':'FILE');
        var badge=el('span','pill',f.featured?'Nổi bật':f.platform);top.append(ico,badge);
        var title=el('h3','',f.name),desc=el('p','desc',f.description||'Tệp tải xuống do nhà phát hành cung cấp.');
        var meta=el('div','meta');if(f.version)meta.append(el('span','', 'Phiên bản: '+f.version));if(f.size)meta.append(el('span','', 'Dung lượng: '+f.size));if(f.updated)meta.append(el('span','', f.updated));
        var link=el('a','download');link.href='/download/'+encodeURIComponent(f.id);link.rel='nofollow';link.append(el('span','','Tải xuống'),el('span','','↗'));link.setAttribute('aria-label','Tải xuống '+f.name);
        box.append(top,title,desc,meta,link);return box;
      }
      function render(){var shown=files.filter(function(f){var platform=filter==='Tất cả'||f.platform===filter||(filter==='Khác'&&f.platform!=='Android'&&f.platform!=='iOS');return platform&&(f.name+' '+f.version+' '+f.description).toLowerCase().includes(query);});counter.textContent=shown.length+' tệp';if(!shown.length){empty(files.length?'Không tìm thấy tệp':'Chưa có tệp được công bố',files.length?'Thử tìm từ khóa hoặc chọn bộ lọc khác.':'Danh sách sẽ tự động cập nhật khi nhà phát hành thêm tệp lên GitHub.');return;}grid.replaceChildren.apply(grid,shown.map(card));}
      document.getElementById('query').addEventListener('input',function(e){query=e.target.value.trim().toLowerCase();render();});
      document.querySelectorAll('.filter').forEach(function(b){b.addEventListener('click',function(){filter=b.dataset.filter;document.querySelectorAll('.filter').forEach(function(x){x.classList.toggle('active',x===b);});render();});});
      fetch('/api/files').then(function(r){if(!r.ok)throw Error('network');return r.json();}).then(function(data){files=Array.isArray(data.files)?data.files:[];render();}).catch(function(){counter.textContent='Không khả dụng';empty('Không thể tải danh sách','Vui lòng thử tải lại trang sau.');});
    })();
  </script>
</body></html>`;

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#7967f2"/><stop offset="1" stop-color="#359fc0"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Arial,sans-serif" font-size="25" font-weight="bold">ST</text></svg>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = {
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Frame-Options': 'DENY',
    };
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: { ...headers, Allow: 'GET, HEAD' } });
    }
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(request.method === 'HEAD' ? null : HTML, {
        headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300', 'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'" },
      });
    }
    if (url.pathname === '/favicon.svg') {
      return new Response(request.method === 'HEAD' ? null : ICON, { headers: { ...headers, 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' } });
    }
    if (url.pathname === '/api/files') {
      const files = await listFiles(env);
      return Response.json({ files, total: files.length }, { headers: { ...headers, 'Cache-Control': 'public, max-age=60' } });
    }
    if (url.pathname.startsWith('/download/')) {
      const id = decodeURIComponent(url.pathname.slice('/download/'.length));
      const files = await listFiles(env);
      const match = files.find(f => f.id === id);
      if (!match) return new Response('Không tìm thấy tệp', { status: 404, headers });
      return new Response(null, { status: 302, headers: { ...headers, Location: match.url, 'Cache-Control': 'no-store' } });
    }
    if (url.pathname === '/health') {
      return Response.json({ ok: true, app: 'sent-tweaks-downloads' }, { headers });
    }
    return new Response('Not found', { status: 404, headers });
  },
};
