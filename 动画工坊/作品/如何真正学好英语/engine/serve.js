#!/usr/bin/env node
// node serve.js [--port 8123]  -> serves A over http and prints the preview URLs (scrubber + play with music).
// Preview playback uses the wall clock and is only for humans; stills and renders always go through seek(t).
'use strict';
const L = require('./lib');
(async () => {
  const a = L.parseArgs(process.argv.slice(2));
  const srv = await L.startServer(L.ROOT, +(a.port || 8123));
  const base = `http://127.0.0.1:${srv.port}/engine/index.html`;
  console.log(`film:    ${base}?preview=1`);
  console.log(`demo:    ${base}?preview=1&demo=1`);
  console.log(`gallery: ${base}?preview=1&demo=gallery`);
  console.log(`one scene: ${base}?preview=1&only=s03`);
  console.log('Ctrl+C to stop');
})();
