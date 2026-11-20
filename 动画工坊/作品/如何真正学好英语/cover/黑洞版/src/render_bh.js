// Headless WebGL2 (SwiftShader) render of the black hole shader into a linear HDR
// float32 RGB file (rows bottom-to-top). Usage: node render_bh.js <config.json> <out.f32>
const fs = require('fs');
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }

const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const out = process.argv[3];
const SRC = __dirname;
const frag = fs.readFileSync(path.join(SRC, 'bh.frag'), 'utf8');
const texB64 = fs.readFileSync(path.join(cfg.wordsDir, 'words_far.png')).toString('base64');
const texNearB64 = fs.readFileSync(path.join(cfg.wordsDir, 'words_near.png')).toString('base64');

function camera(c) {
  const d2r = Math.PI / 180;
  const el = c.elevDeg * d2r, az = (c.azimDeg || 0) * d2r;
  const pos = [c.camDist * Math.cos(el) * Math.sin(az), c.camDist * Math.sin(el), -c.camDist * Math.cos(el) * Math.cos(az)];
  const norm = v => { const l = Math.hypot(...v); return v.map(x => x / l); };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  // look slightly off the hole if asked (pitch offset), then roll
  let f = norm(pos.map(x => -x));
  let r = norm(cross(f, [0, 1, 0]));
  let u = cross(r, f);
  const ro = (c.rollDeg || 0) * d2r;
  const r2 = r.map((x, i) => Math.cos(ro) * x + Math.sin(ro) * u[i]);
  const u2 = u.map((x, i) => -Math.sin(ro) * r[i] + Math.cos(ro) * x);
  return { pos, f, r: r2, u: u2 };
}

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-watchdog', '--disable-features=GpuWatchdog'] });
  const page = await browser.newPage();
  page.on('console', m => { if (m.type() === 'error') console.error('page:', m.text()); });
  await page.setContent('<html><body style="margin:0;background:#000"><canvas id="c" width="8" height="8"></canvas></body></html>');
  const cam = camera(cfg);
  const ok = await page.evaluate(async ({ frag, texB64, texNearB64, cfg, cam }) => {
    const c = document.getElementById('c');
    const gl = c.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true });
    if (!gl) return 'no webgl2';
    gl.getExtension('EXT_color_buffer_float');
    const vs = `#version 300 es\nin vec2 p; void main(){ gl_Position = vec4(p,0.0,1.0); }`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    // word textures (unit 0 far half, unit 1 near half)
    const loadTex = async (b64, unit) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const tex = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, gl.RED, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return img;
    };
    const img = await loadTex(texB64, 0);
    await loadTex(texNearB64, 1);
    const U = n => gl.getUniformLocation(prog, n);
    gl.uniform1i(U('uWords'), 0); gl.uniform1i(U('uWordsNear'), 1);
    gl.uniform2f(U('uWordsSize'), img.width, img.height);
    gl.uniform2f(U('uRes'), cfg.W, cfg.H);
    gl.uniform3fv(U('uCamPos'), cam.pos); gl.uniform3fv(U('uCamR'), cam.r); gl.uniform3fv(U('uCamU'), cam.u); gl.uniform3fv(U('uCamF'), cam.f);
    gl.uniform1f(U('uTanHalf'), Math.tan(cfg.vfovDeg * Math.PI / 360));
    gl.uniform2f(U('uShift'), cfg.shift[0], cfg.shift[1]);
    // wormhole: given as frame fractions from the top-left; converted to screen units after shift
    const asp = cfg.W / cfg.H;
    const wh = cfg.wh || { x: 0, y: 0, r: 0 };
    gl.uniform2f(U('uWhC'), (2 * wh.x - 1) * asp - cfg.shift[0], (1 - 2 * wh.y) - cfg.shift[1]);
    gl.uniform1f(U('uWhR'), 2 * wh.r);
    for (const k of ['rin', 'rout', 'spp', 'beam', 'diskGain', 'wordGain', 'starGain', 'nebGain', 'smearR', 'wordAspect', 'seed', 'foggy', 'profExp', 'gasOuter', 'tempHot', 'rpk', 'whGlow', 'whSky', 'underOut', 'neb2Gain', 'neb2Y', 'neb2W']) {
      gl.uniform1f(U('u' + k[0].toUpperCase() + k.slice(1)), cfg[k] === undefined ? 0 : cfg[k]);
    }
    const T = cfg.tile;
    gl.activeTexture(gl.TEXTURE5);
    const rt = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, rt);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, T, T);
    gl.activeTexture(gl.TEXTURE0);
    const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rt, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) return 'fbo incomplete';
    window.__render = (x, y, w, h) => {
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U('uTileOff'), x, y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      const px = new Float32Array(w * h * 4);
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.FLOAT, px);
      const rgb = new Float32Array(w * h * 3);
      for (let i = 0, j = 0; i < w * h; i++) { rgb[j++] = px[4 * i]; rgb[j++] = px[4 * i + 1]; rgb[j++] = px[4 * i + 2]; }
      const bytes = new Uint8Array(rgb.buffer);
      let s = ''; const CH = 0x8000;
      for (let i = 0; i < bytes.length; i += CH) s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
      return btoa(s);
    };
    return 'ok ' + gl.getParameter(gl.RENDERER);
  }, { frag, texB64, texNearB64, cfg, cam });
  console.log(ok);
  if (!ok.startsWith('ok')) { await browser.close(); process.exit(1); }
  const W = cfg.W, H = cfg.H, T = cfg.tile;
  const outBuf = Buffer.alloc(W * H * 3 * 4);
  const t0 = Date.now();
  let n = 0; const total = Math.ceil(W / T) * Math.ceil(H / T);
  for (let y = 0; y < H; y += T) {
    for (let x = 0; x < W; x += T) {
      const w = Math.min(T, W - x), h = Math.min(T, H - y);
      if (cfg.region) { // [x, yTop, w, h] in top-left pixel coords: skip tiles outside
        const [rx, ry, rw, rh] = cfg.region; const yb = H - ry - rh;
        if (x + w <= rx || x >= rx + rw || y + h <= yb || y >= yb + rh) continue;
      }
      const b64 = await page.evaluate(([x, y, w, h]) => window.__render(x, y, w, h), [x, y, w, h]);
      const tb = Buffer.from(b64, 'base64');
      for (let row = 0; row < h; row++) {
        tb.copy(outBuf, ((y + row) * W + x) * 12, row * w * 12, (row + 1) * w * 12);
      }
      n++;
      if (cfg.verbose && n % 10 === 0) console.log(`tile ${n}/${total} ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    }
  }
  fs.writeFileSync(out, outBuf);
  console.log(`rendered ${W}x${H} spp=${cfg.spp} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
