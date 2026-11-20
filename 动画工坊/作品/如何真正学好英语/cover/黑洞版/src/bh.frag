#version 300 es
// Schwarzschild black hole with a thin accretion disk made of words.
// Units: Schwarzschild radius Rs = 1 (horizon r = 1, photon sphere r = 1.5).
// Null geodesics integrated with RK4 using x'' = -1.5 h^2 x / r^5.
// Output is linear HDR (float framebuffer). Deterministic: no time, no random.
precision highp float;
precision highp int;

uniform vec2 uRes;        // full image size (px)
uniform vec2 uTileOff;    // tile origin, bottom-left based (px)
uniform vec3 uCamPos, uCamR, uCamU, uCamF;
uniform float uTanHalf;   // tan(vertical fov / 2)
uniform vec2 uShift;      // screen position of the hole, in half-heights (x right, y up)
uniform sampler2D uWords; // log-polar word texture (R8, mipmapped), far half
uniform sampler2D uWordsNear; // same layout, lanes rotated 180 deg, near half
uniform vec2 uWordsSize;  // texture size (texels)
uniform float uRin, uRout;
uniform float uSpp;       // 1, 4 or 9
uniform float uBeam;      // Doppler beaming exponent
uniform float uDiskGain, uWordGain, uStarGain, uNebGain;
uniform float uSmearR;    // radius below which words smear into light
uniform float uWordAspect;// stretch of words along the orbit (u repeats per turn)
uniform float uSeed;
uniform float uFoggy;     // extra glow of gas
uniform float uProfExp;   // radial falloff of gas emission
uniform float uGasOuter;  // fraction of rout where the gas starts to fade
uniform vec2 uWhC;        // wormhole centre in screen units (half-heights, after shift)
uniform float uWhR;       // wormhole radius in half-heights (0 = none)
uniform float uWhGlow, uWhSky;
uniform float uRpk;       // radius of peak emission (ISCO); gas inside it plunges and fades
uniform float uTempHot;   // extra temperature of the inner disk (white-hot)
uniform float uUnderOut;  // outer radius of the emission seen from below (lower lensed arc); 0 = rout
uniform float uNeb2Gain, uNeb2Y, uNeb2W; // low nebula band (world direction y centre and width)

out vec4 outColor;

const float PI = 3.14159265358979;

// ---------- hashing / noise (deterministic) ----------
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec3 hash32(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yxz+33.33); return fract((p3.xxy+p3.yzz)*p3.zyx); }
float hash13(vec3 p3){ p3 = fract(p3 * 0.1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }

float vnoise3(vec3 p){
  vec3 i = floor(p); vec3 f = fract(p); f = f*f*(3.0-2.0*f);
  float a = hash13(i), b = hash13(i+vec3(1,0,0)), c = hash13(i+vec3(0,1,0)), d = hash13(i+vec3(1,1,0));
  float e = hash13(i+vec3(0,0,1)), g = hash13(i+vec3(1,0,1)), h = hash13(i+vec3(0,1,1)), k = hash13(i+vec3(1,1,1));
  return mix(mix(mix(a,b,f.x), mix(c,d,f.x), f.y), mix(mix(e,g,f.x), mix(h,k,f.x), f.y), f.z);
}
float fbm3(vec3 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a*vnoise3(p); p = p*2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s; }

// value noise periodic in x with period P (integer)
float pnoise2(vec2 p, float P){
  vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f);
  float x0 = mod(i.x, P), x1 = mod(i.x + 1.0, P);
  float a = hash12(vec2(x0, i.y)), b = hash12(vec2(x1, i.y));
  float c = hash12(vec2(x0, i.y+1.0)), d = hash12(vec2(x1, i.y+1.0));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}
float pfbm(vec2 p, float P){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ s += a*pnoise2(p, P); p = vec2(p.x*2.0, p.y*2.0 + 3.7); P *= 2.0; a *= 0.5; } return s; }

// ---------- background sky ----------
vec3 starLayer(vec3 d, float N, float prob, float bmin, float bmax, float sig, float layer){
  vec3 a = abs(d); vec2 uv; float face;
  if (a.x >= a.y && a.x >= a.z){ uv = d.yz / a.x; face = d.x > 0.0 ? 0.0 : 1.0; }
  else if (a.y >= a.z){ uv = d.xz / a.y; face = d.y > 0.0 ? 2.0 : 3.0; }
  else { uv = d.xy / a.z; face = d.z > 0.0 ? 4.0 : 5.0; }
  vec2 g = (uv*0.5 + 0.5) * N;
  vec2 cell = floor(g); vec2 f = fract(g);
  vec2 key = cell + vec2(face*7919.0 + layer*104729.0 + uSeed, layer*31.0);
  vec3 h = hash32(key);
  if (h.x > prob) return vec3(0.0);
  vec3 h2 = hash32(key + 17.0);
  vec2 sp = 0.25 + 0.5*h2.xy;
  vec2 dd = f - sp;
  float r2 = dot(dd, dd);
  float s2 = sig*sig;
  float b = mix(bmin, bmax, pow(h.y, 6.0));
  float t = h.z; // colour temperature
  vec3 c = t < 0.15 ? vec3(1.0, 0.72, 0.48) : (t < 0.45 ? vec3(1.0, 0.92, 0.82) : (t < 0.8 ? vec3(0.86, 0.92, 1.0) : vec3(0.68, 0.80, 1.0)));
  return c * b * exp(-0.5*r2/s2);
}

vec3 sky(vec3 d, float pixAng){
  // star sizes are expressed in cell units so that a star is ~0.7 px wide
  vec3 col = vec3(0.0);
  float N1 = 900.0, N2 = 340.0, N3 = 90.0;
  float cellAng1 = 2.0/N1, cellAng2 = 2.0/N2, cellAng3 = 2.0/N3;
  float sp = 0.75*pixAng;
  col += starLayer(d, N1, 0.10, 0.01, 0.16, sp/cellAng1, 1.0);
  col += starLayer(d, N2, 0.10, 0.03, 0.9, sp/cellAng2, 2.0);
  col += starLayer(d, N3, 0.06, 0.3, 4.0, 1.1*sp/cellAng3, 3.0);
  col *= uStarGain;
  // faint nebula: two fbm layers, cool blue with a little teal and violet
  float n1 = fbm3(d*2.2 + vec3(3.0, 1.0, 7.0));
  float n2 = fbm3(d*5.0 + vec3(11.0, 4.0, 2.0));
  float band = exp(-pow(dot(d, normalize(vec3(0.35, 0.9, -0.25)))*3.2, 2.0));
  float neb = smoothstep(0.42, 0.85, n1) * (0.55 + 0.45*n2);
  float dust = smoothstep(0.45, 0.75, n2);
  vec3 nc = mix(vec3(0.05, 0.13, 0.32), vec3(0.04, 0.24, 0.30), smoothstep(0.3, 0.7, n2));
  nc = mix(nc, vec3(0.20, 0.08, 0.30), smoothstep(0.6, 0.9, n1)*0.5);
  col += uNebGain * nc * (neb*0.9 + band*0.35*(0.4+0.6*n2)) * (1.0 - 0.45*dust);
  col += uNebGain * vec3(0.006, 0.010, 0.022); // deep blue black floor
  return col;
}

// ---------- disk ----------
vec3 ramp(float x){
  // x ~ temperature 0..1.6 : deep red, orange, molten gold, white hot, blue white
  vec3 c0 = vec3(0.45, 0.06, 0.01);
  vec3 c1 = vec3(1.00, 0.36, 0.06);
  vec3 c2 = vec3(1.00, 0.70, 0.30);
  vec3 c3 = vec3(1.00, 0.93, 0.80);
  vec3 c4 = vec3(0.80, 0.90, 1.00);
  if (x < 0.35) return mix(c0, c1, x/0.35);
  if (x < 0.70) return mix(c1, c2, (x-0.35)/0.35);
  if (x < 1.05) return mix(c2, c3, (x-0.70)/0.35);
  return mix(c3, c4, clamp((x-1.05)/0.55, 0.0, 1.0));
}

vec4 diskShade(vec3 hit, vec3 vel, float path, float pixAng){
  float r = length(hit.xz);
  float L = log(uRout/uRin);
  float lr = log(r/uRin)/L;            // 0 inner .. 1 outer
  float phi = atan(-hit.x, hit.z);     // increases along the orbital motion
  float u = fract(phi/(2.0*PI) + 0.25);
  float v = 1.0 - lr;

  // emission profile
  float inner = smoothstep(uRin, uRpk, r); inner *= inner;
  float outer = 1.0 - smoothstep(uRout*uGasOuter, uRout*0.97, r);
  float prof = pow(min(uRpk/r, 1.0), uProfExp) * inner;

  // turbulent gas, streaky along the orbit, with three log-spiral arms
  float gas = pfbm(vec2(u*96.0, lr*22.0), 96.0);
  float fil = pfbm(vec2(u*48.0 + lr*1.5, lr*190.0), 48.0);      // thin orbital filaments
  float gas2 = pfbm(vec2(u*24.0 + lr*3.0, lr*7.0), 24.0);
  float arms = 0.5 + 0.5*cos(3.0*2.0*PI*u - 3.0*7.5*lr + 2.0*(gas2 - 0.5));
  float dens = (0.3 + 0.7*gas) * (0.55 + 0.45*arms) * (0.6 + 0.8*gas2) * (0.25 + 1.6*fil*fil);

  // relativistic shift: Doppler + gravitational
  float beta = min(sqrt(0.5/max(r - 1.0, 0.05)), 0.72);
  vec3 vdir = normalize(cross(vec3(hit.x, 0.0, hit.z), vec3(0.0, 1.0, 0.0)));
  vec3 n = -normalize(vel);
  float gam = 1.0/sqrt(1.0 - beta*beta);
  float gfull = sqrt(max(1.0 - 1.0/r, 0.05)) / (gam*(1.0 - beta*dot(vdir, n)));
  // artistic choice (as in film renders): keep the longitudinal Doppler asymmetry,
  // soften the transverse and gravitational dimming so the near side stays bright
  float g = mix(1.0/(1.0 - beta*dot(vdir, n)), gfull, 0.3);
  float boost = pow(g, uBeam);

  // words: anisotropic smear along the orbit, stronger toward the horizon
  float sm = clamp((uSmearR - r)/(uSmearR - uRin), 0.0, 1.0);
  sm = sm*sm;
  // where the disk is seen edge-on (left and right ends) the words become light streams
  vec2 fxz = normalize(uCamF.xz);
  vec2 nxz = hit.xz / r;
  float ext = abs(nxz.x*(-fxz.y) + nxz.y*fxz.x);
  float smE = smoothstep(0.55, 0.97, ext);
  sm = max(sm, 0.9*smE);
  // light that reaches us from the underside of the disk (the thin arc below the shadow) is smeared
  if (vel.y > 0.0) sm = max(sm, 0.8);
  float wN = smoothstep(0.22, -0.22, dot(nxz, fxz));   // 1 on the near half, 0 on the far half
  float ut = u * uWordAspect;
  float foot = path*pixAng / max(2.0*PI*r/(uWordsSize.x*uWordAspect), 1e-6);
  float lod = clamp(log2(max(foot, 1e-3)) - 0.5, 0.0, 9.0);
  float smearLen = sm * 0.11;          // in u units (fraction of the texture width)
  float w = 0.0, ws = 0.0;
  if (smearLen < 0.0008){
    vec2 q = vec2(ut, v);
    if (wN > 0.0) w += wN*textureLod(uWordsNear, q, lod).r;
    if (wN < 1.0) w += (1.0 - wN)*textureLod(uWords, q, lod).r;
  } else {
    float lodS = max(lod, log2(smearLen*uWordsSize.x/12.0) + 0.6);
    for (int k = 0; k < 12; k++){
      float t = float(k)/11.0;
      float wk = exp(-2.2*t);
      vec2 q = vec2(ut - smearLen*t, v);
      float sN = wN > 0.0 ? textureLod(uWordsNear, q, lodS).r : 0.0;
      float sF = wN < 1.0 ? textureLod(uWords, q, lodS).r : 0.0;
      w += wk * mix(sF, sN, wN);
      ws += wk;
    }
    w /= ws;
    w *= 1.0 + 1.5*sm;                 // stretched light keeps its energy
  }

  float temp = (0.32 + (0.50 + uTempHot)*pow(min(uRpk/r, 1.0), 1.1)) * pow(g, 0.55);
  vec3 gasCol = ramp(temp) * prof * dens * uDiskGain * boost;
  vec3 wordCol = mix(vec3(1.0, 0.82, 0.52), vec3(1.0, 0.96, 0.88), clamp(g - 0.6, 0.0, 1.0));
  float wg = uWordGain * (0.55 + 0.9*pow(min(uRpk/r, 1.0), 0.6)) * mix(1.0, boost, 0.75) * (1.0 - 0.7*sm);
  float edge = inner * outer;
  // outermost words float beyond the gas, slowly fading out
  float wordsReach = 1.0 - smoothstep(uRout*0.86, uRout, r);
  // the lower lensed image (underside of the far disk) is kept as a thin arc hugging the shadow
  if (vel.y > 0.0 && uUnderOut > 0.0){
    float uo = 1.0 - smoothstep(uUnderOut*0.72, uUnderOut, r);
    outer *= uo; wordsReach *= uo; edge *= uo;
  }
  vec3 em = gasCol*outer + wordCol * w * wg * wordsReach;
  em *= 1.0 + uFoggy*sm;
  float a = clamp(1.0 - exp(-(0.08*edge + 2.6*dens*prof*edge + 1.3*w*wordsReach)), 0.0, 0.97);
  return vec4(em, a);
}

vec3 accel(vec3 p, float h2){ float r2 = dot(p,p); return -1.5*h2*p/(r2*r2*sqrt(r2)); }

vec3 trace(vec3 ro, vec3 rd, float pixAng){
  vec3 pos = ro, vel = rd;
  vec3 hv = cross(pos, vel); float h2 = dot(hv, hv);
  vec3 col = vec3(0.0); float T = 1.0; float path = 0.0;
  const float ESC = 400.0;
  for (int i = 0; i < 480; i++){
    float r = length(pos);
    if (r < 1.0){ return col; }
    float dt = clamp(0.07*r, 0.012, 40.0);
    // RK4
    vec3 k1v = accel(pos, h2), k1x = vel;
    vec3 k2v = accel(pos + 0.5*dt*k1x, h2), k2x = vel + 0.5*dt*k1v;
    vec3 k3v = accel(pos + 0.5*dt*k2x, h2), k3x = vel + 0.5*dt*k2v;
    vec3 k4v = accel(pos + dt*k3x, h2), k4x = vel + dt*k3v;
    vec3 np = pos + dt/6.0*(k1x + 2.0*k2x + 2.0*k3x + k4x);
    vec3 nv = vel + dt/6.0*(k1v + 2.0*k2v + 2.0*k3v + k4v);
    if (pos.y*np.y < 0.0){
      float t = pos.y/(pos.y - np.y);
      vec3 hit = mix(pos, np, t);
      float rr = length(hit.xz);
      if (rr > uRin*0.97 && rr < uRout){
        vec4 d = diskShade(hit, mix(vel, nv, t), path + dt*t, pixAng);
        col += T*d.rgb;
        T *= 1.0 - d.a;
        if (T < 0.004) return col;
      }
    }
    float nr = length(np);
    if (nr > ESC){
      // exit exactly on the escape sphere so the sky lookup is continuous
      float t = (ESC - r)/(nr - r);
      return col + T*sky(normalize(mix(vel, nv, t)), pixAng);
    }
    path += dt*length(vel);
    pos = np; vel = nv;
  }
  return col;
}

// ---------- foreground nebula low in the frame (between us and the hole, so not lensed) ----------
// blue, teal and violet clouds with dark dust lanes and a dust of faint stars; it gives the lower
// half of the frame depth and fades out around the hole and the wormhole
vec3 lowNeb(vec3 d, vec2 sp, float pixAng){
  if (uNeb2Gain <= 0.0) return vec3(0.0);
  float by = (d.y - uNeb2Y)/uNeb2W;
  float bw = exp(-0.5*by*by);
  bw *= smoothstep(0.55, 1.05, length(sp*vec2(0.85, 1.0)));             // clear of the black hole
  if (uWhR > 0.0) bw *= smoothstep(1.05, 1.6, length(sp - uWhC)/uWhR);    // clear of the portal
  if (bw < 0.003) return vec3(0.0);
  float c1 = fbm3(d*3.1 + vec3(2.0, 5.0, 1.0));
  float c2 = fbm3(d*8.5 + vec3(7.0, 3.0, 4.0));
  float c3 = fbm3(d*19.0 + vec3(4.0, 8.0, 6.0));
  float cloud = smoothstep(0.30, 0.80, c1) * (0.45 + 0.75*c2);
  float lanes = smoothstep(0.50, 0.72, c2) * smoothstep(0.35, 0.65, c3);
  vec3 bc = mix(vec3(0.05, 0.11, 0.34), vec3(0.04, 0.26, 0.32), smoothstep(0.40, 0.75, c2));
  bc = mix(bc, vec3(0.30, 0.12, 0.42), smoothstep(0.55, 0.85, c1)*0.6);
  bc = mix(bc, vec3(0.42, 0.22, 0.10), smoothstep(0.2, -0.9, by)*0.35);   // warmer toward the horizon
  vec3 col = uNeb2Gain * bw * bc * (0.25 + 1.3*cloud) * (1.0 - 0.75*lanes);
  col += bw * starLayer(d, 1500.0, 0.30, 0.01, 0.10, 0.75*pixAng/(2.0/1500.0), 4.0) * uNeb2Gain * (1.0 - 0.7*lanes);
  return col;
}

// ---------- the other universe, seen through the wormhole ----------
// d is a direction in the wormhole's own frame (z = straight through the throat, x right, y up);
// fp is the angular footprint of a pixel there (rad)
vec3 otherSky(vec3 d, float fp){
  vec3 col = vec3(0.0);
  col += starLayer(d, 700.0, 0.05, 0.05, 0.5, max(0.45*fp/(2.0/700.0), 0.06), 7.0);
  col += starLayer(d, 220.0, 0.06, 0.30, 3.5, max(0.45*fp/(2.0/220.0), 0.03), 8.0);
  // blue nebula of the other side
  float n1 = fbm3(d*2.4 + vec3(5.0, 2.0, 9.0));
  float n2 = fbm3(d*6.5 + vec3(1.0, 7.0, 3.0));
  vec3 nc = mix(vec3(0.03, 0.10, 0.42), vec3(0.20, 0.62, 1.0), smoothstep(0.40, 0.80, n2));
  nc = mix(nc, vec3(0.50, 0.26, 0.95), smoothstep(0.60, 0.90, n1)*0.55);
  col += nc * (smoothstep(0.30, 0.85, n1)*1.25 + 0.10);
  // a small spiral galaxy, tilted, upper left of the centre
  vec3 gc = normalize(vec3(-0.26, 0.20, 1.0));
  vec3 e1 = normalize(cross(vec3(0.0, 1.0, 0.0), gc));
  vec3 e2 = cross(gc, e1);
  vec2 p = vec2(dot(d, e1), dot(d, e2)) * 2.0/(1.0 + dot(d, gc));
  float pa = 0.55, ci = cos(pa), si = sin(pa);
  p = vec2(ci*p.x - si*p.y, si*p.x + ci*p.y);
  p.y /= 0.52;                                  // inclination
  float R0 = 0.40;
  float rr = length(p)/R0 + 1e-4;
  float th = atan(p.y, p.x);
  float arm = 0.5 + 0.5*cos(2.0*(th - 2.2*log(rr)));
  arm = pow(arm, 3.0);
  float knots = smoothstep(0.55, 0.9, fbm3(vec3(p*40.0, 3.0)));
  float diskG = exp(-rr/0.30) * (0.25 + 1.6*arm) * (1.0 - smoothstep(0.85, 1.25, rr));
  float bulge = exp(-rr*rr/0.010);
  float dust = smoothstep(0.35, 0.8, arm) * 0.0 + (1.0 - 0.45*pow(0.5 + 0.5*cos(2.0*(th - 2.2*log(rr)) + 1.9), 6.0)*step(0.15, rr));
  col += (vec3(0.62, 0.78, 1.0)*diskG*(1.0 + 1.2*knots)*1.6 + vec3(1.0, 0.86, 0.62)*bulge*3.5 + vec3(1.0, 0.92, 0.80)*exp(-rr/0.12)*0.7) * dust * 1.3;
  return col * uWhSky;
}

vec3 shade(vec3 ro, vec3 rd, vec2 sp, vec3 R, vec3 U, float pixAng){
  vec3 add = lowNeb(rd, sp, pixAng);
  if (uWhR > 0.0){
    vec2 o = sp - uWhC;
    float x = length(o)/uWhR;
    vec2 o2 = o/(length(o) + 1e-9);
    vec3 n = normalize(o2.x*R + o2.y*U);
    vec3 rim = vec3(0.62, 0.82, 1.0);
    float angR = uWhR*uTanHalf;                 // angular radius (rad)
    float pix = pixAng/angR;                    // one pixel in units of the radius
    if (x < 1.0){
      // through the throat: a fisheye view of the other universe, compressed toward the rim
      float th = 1.05*x + 1.7*pow(x, 6.0);
      float dth = 1.05 + 10.2*pow(x, 5.0);
      float fp = max(dth, sin(th)/max(x, 1e-3)) * pix;
      vec3 d2 = vec3(sin(th)*o2.x, sin(th)*o2.y, cos(th));
      vec3 c = otherSky(d2, fp);
      // inner rim: the whole far sky piles up at the edge of the throat (inner Einstein ring)
      float e = 1.0 - x;
      c += rim * uWhGlow * (0.55*exp(-e/0.035) + 0.10*exp(-e/0.20));
      return c;
    }
    float e = x - 1.0;
    // outside: point-lens bending of our own sky toward the throat
    float alpha = min(1.04*angR/x, 0.6);
    rd = normalize(rd*cos(alpha) - n*sin(alpha));
    // thin bright Einstein ring of lensed stars hugging the rim: arcs of varying brightness
    float ph = atan(o2.y, o2.x)/(2.0*PI) + 0.5;
    float a1 = pnoise2(vec2(ph*36.0, 1.5), 36.0);
    float a2 = pnoise2(vec2(ph*150.0, 4.5), 150.0);
    float arcs = 0.85 + 1.9*pow(a1, 2.0) + 2.2*pow(a2, 10.0);
    float wR = max(0.012, 1.2*pix);
    float ring = exp(-0.5*pow((e - 0.010)/wR, 2.0));
    add += rim*uWhGlow*(ring*arcs*1.6 + 0.22*exp(-e/0.18) + 0.06*exp(-e/0.9));
    add += vec3(1.0, 0.95, 0.88)*uWhGlow*ring*pow(a2, 12.0)*4.0;
  }
  return add + trace(ro, rd, pixAng);
}

void main(){
  vec2 gp = uTileOff + gl_FragCoord.xy;   // global pixel, bottom-left origin
  float aspect = uRes.x/uRes.y;
  float pixAng = 2.0*uTanHalf/uRes.y;
  vec3 acc = vec3(0.0);
  int n = int(uSpp + 0.5);
  int m = n == 9 ? 3 : (n == 4 ? 2 : 1);
  for (int j = 0; j < 3; j++){
    if (j >= m) break;
    for (int i = 0; i < 3; i++){
      if (i >= m) break;
      // rotated-grid sub-pixel offsets
      vec2 o = (vec2(float(i), float(j)) + 0.5)/float(m) - 0.5;
      o = vec2(o.x*0.94 - o.y*0.34, o.x*0.34 + o.y*0.94);
      vec2 p = gp - 0.5 + 0.5 + o;
      float sx = (2.0*p.x/uRes.x - 1.0)*aspect - uShift.x;
      float sy = (2.0*p.y/uRes.y - 1.0) - uShift.y;
      vec3 rd = normalize(uCamF + uTanHalf*(sx*uCamR + sy*uCamU));
      acc += shade(uCamPos, rd, vec2(sx, sy), uCamR, uCamU, pixAng);
    }
  }
  outColor = vec4(acc/float(m*m), 1.0);
}
