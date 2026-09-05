/*
 * Colosseum App — compact QR Code encoder (ISO/IEC 18004).
 * Byte mode, error correction level M, versions 1–10, fixed mask 0.
 * Written from the specification; no dependencies.
 * Exposes global `QRCode`.
 */
(function (global) {
  'use strict';

  // ---------- GF(256) tables ----------
  var EXP = new Array(512), LOG = new Array(256);
  (function () {
    var x = 1;
    for (var i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d; // primitive polynomial x^8+x^4+x^3+x^2+1
    }
    for (var j = 255; j < 512; j++) EXP[j] = EXP[j - 255];
  })();

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return EXP[LOG[a] + LOG[b]];
  }

  // Reed-Solomon generator polynomial of degree n, coefficients ascending (x^0..x^n)
  function rsGenerator(n) {
    var poly = [1];
    for (var i = 0; i < n; i++) {
      var root = EXP[i]; // alpha^i
      var next = new Array(poly.length + 1).fill(0);
      for (var j = 0; j < poly.length; j++) {
        next[j] ^= gfMul(poly[j], root); // * (x + alpha^i)
        next[j + 1] ^= poly[j];
      }
      poly = next;
    }
    return poly;
  }

  function rsRemainder(data, gen) {
    // gen: ascending coefficients [g0..gn-1, 1] (including leading 1)
    var high = [];
    for (var i = gen.length - 2; i >= 0; i--) high.push(gen[i]); // high-first, leading 1 omitted
    var rem = new Array(high.length).fill(0);
    for (var i = 0; i < data.length; i++) {
      var factor = data[i] ^ rem[0];
      rem.shift();
      rem.push(0);
      if (factor !== 0) {
        for (var j = 0; j < rem.length; j++) {
          rem[j] ^= gfMul(high[j], factor);
        }
      }
    }
    return rem;
  }

  // ---------- Error-correction tables (level M) ----------
  var VERSION_CAPACITY = { 1: 16, 2: 28, 3: 44, 4: 64, 5: 86, 6: 108, 7: 124, 8: 154, 9: 182, 10: 216 };
  var BLOCKS = {
    1:  { ecc: 10, sizes: [16] },
    2:  { ecc: 16, sizes: [28] },
    3:  { ecc: 26, sizes: [44] },
    4:  { ecc: 18, sizes: [32, 32] },
    5:  { ecc: 24, sizes: [43, 43] },
    6:  { ecc: 16, sizes: [27, 27, 27, 27] },
    7:  { ecc: 18, sizes: [31, 31, 31, 31] },
    8:  { ecc: 22, sizes: [38, 38, 39, 39] },
    9:  { ecc: 22, sizes: [36, 36, 36, 37, 37] },
    10: { ecc: 26, sizes: [43, 43, 43, 43, 44] }
  };
  var ALIGN = { 1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50] };

  function getBit(x, i) { return ((x >>> i) & 1) !== 0; }

  function bitBuffer() { return { bits: [], push: function (val, len) { for (var i = len - 1; i >= 0; i--) this.bits.push((val >>> i) & 1); } }; }

  function chooseVersion(len) {
    for (var v = 1; v <= 10; v++) {
      if (len <= VERSION_CAPACITY[v] - 2) return v; // 4-bit mode + 8-bit count
    }
    throw new Error('Text too long for QR (max ~210 bytes)');
  }

  // UTF-8 encode (byte mode)
  function utf8Bytes(str) {
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c < 0x80) bytes.push(c);
      else if (c < 0x800) {
        bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
        var lo = str.charCodeAt(++i);
        if (lo >= 0xdc00 && lo <= 0xdfff) {
          c = 0x10000 + ((c - 0xd800) << 10) + (lo - 0xdc00);
          bytes.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 0x3f), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
        } else {
          bytes.push(0xef, 0xbf, 0xbd); i--;
        }
      } else if (c >= 0xd800 && c <= 0xdfff) {
        bytes.push(0xef, 0xbf, 0xbd);
      } else {
        bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
      }
    }
    return bytes;
  }

  function buildData(text, version) {
    var capacity = VERSION_CAPACITY[version];
    var bytes = utf8Bytes(text);
    var buf = bitBuffer();
    buf.push(0x4, 4);                      // byte mode
    buf.push(bytes.length, version === 10 ? 16 : 8);
    for (var i = 0; i < bytes.length; i++) buf.push(bytes[i], 8);
    var maxBits = capacity * 8;
    var term = Math.min(4, maxBits - buf.bits.length);
    for (var t = 0; t < term; t++) buf.bits.push(0);
    while (buf.bits.length % 8 !== 0) buf.bits.push(0);
    var data = [];
    for (var d = 0; d < buf.bits.length; d += 8) {
      var b = 0;
      for (var j = 0; j < 8; j++) b = (b << 1) | buf.bits[d + j];
      data.push(b);
    }
    var pads = [0xec, 0x11], p = 0;
    while (data.length < capacity) data.push(pads[p++ % 2]);
    return data;
  }

  function interleave(data, block) {
    var blocks = [], pos = 0;
    for (var i = 0; i < block.sizes.length; i++) {
      var size = block.sizes[i];
      var chunk = data.slice(pos, pos + size);
      pos += size;
      var gen = rsGenerator(block.ecc);
      blocks.push({ data: chunk, ecc: rsRemainder(chunk, gen) });
    }
    var out = [], maxD = Math.max.apply(null, block.sizes);
    for (var d = 0; d < maxD; d++)
      for (var k = 0; k < blocks.length; k++)
        if (d < blocks[k].data.length) out.push(blocks[k].data[d]);
    for (var e = 0; e < block.ecc; e++)
      for (var m = 0; m < blocks.length; m++)
        out.push(blocks[m].ecc[e]);
    return out;
  }

  function matrix(text) {
    var version = chooseVersion(text.length);
    var size = version * 4 + 17;
    var block = BLOCKS[version];
    var data = buildData(text, version);
    var all = interleave(data, block);

    var modules = [], isFunc = [];
    for (var r = 0; r < size; r++) { modules.push(new Array(size).fill(false)); isFunc.push(new Array(size).fill(false)); }

    function setFunc(x, y, dark) { modules[y][x] = dark; isFunc[y][x] = true; }

    function drawFinder(x, y) {
      for (var dy = -4; dy <= 4; dy++)
        for (var dx = -4; dx <= 4; dx++) {
          var xx = x + dx, yy = y + dy;
          if (xx < 0 || xx >= size || yy < 0 || yy >= size) continue;
          var dist = Math.max(Math.abs(dx), Math.abs(dy));
          setFunc(xx, yy, dist !== 2 && dist !== 4);
        }
    }

    drawFinder(3, 3); drawFinder(size - 4, 3); drawFinder(3, size - 4);

    // Alignment (drawn BEFORE timing, as in the reference implementation, so
    // patterns centered on row/column 6 are not skipped)
    var centers = ALIGN[version];
    for (var a = 0; a < centers.length; a++)
      for (var b = 0; b < centers.length; b++) {
        var cx = centers[a], cy = centers[b];
        if (isFunc[cy][cx]) continue;
        for (var dy = -2; dy <= 2; dy++)
          for (var dx = -2; dx <= 2; dx++)
            setFunc(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }

    // Timing
    for (var t = 7; t < size - 7; t++) {
      if (!isFunc[6][t]) setFunc(t, 6, t % 2 === 0);
      if (!isFunc[t][6]) setFunc(6, t, t % 2 === 0);
    }

    // Reserve format info (top-left, two 1x9 + split, bottom-left, top-right)
    for (var i = 0; i < 9; i++) {
      if (i !== 6) { setFunc(8, i, false); setFunc(i, 8, false); }
    }
    for (var j = 0; j < 8; j++) {
      setFunc(size - 1 - j, 8, false);
      setFunc(8, size - 1 - j, false);
    }

    // Version info (7+)
    if (version >= 7) {
      var rem = version;
      for (var vi = 0; vi < 12; vi++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
      var vbits = (version << 12) | rem;
      for (var vb = 0; vb < 18; vb++) {
        var col = size - 11 + (vb % 3);
        var row = Math.floor(vb / 3);
        setFunc(col, row, getBit(vbits, vb));
        setFunc(row, col, getBit(vbits, vb));
      }
    }

    // --- Place data (mask 0 applied inline) ---
    var idx = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) {
        for (var h = 0; h < 2; h++) {
          var x = right - h;
          var upward = ((right + 1) & 2) === 0;
          var y = upward ? size - 1 - vert : vert;
          if (!isFunc[y][x]) {
            // Remaining modules after the data stream are 0 bits, then masked
            var bit = idx < all.length * 8 ? getBit(all[idx >>> 3], 7 - (idx & 7)) : 0;
            modules[y][x] = bit ^ ((x + y) % 2 === 0 ? 1 : 0); // mask 0
            idx++;
          }
        }
      }
    }

    // --- Format info: level M (00), mask 0 (000) => 0b00000 ---
    var fmtData = 0;
    var frem = fmtData;
    for (var fi = 0; fi < 10; fi++) frem = (frem << 1) ^ ((frem >>> 9) * 0x537);
    var fbits = ((fmtData << 10) | frem) ^ 0x5412;

    for (var f1 = 0; f1 <= 5; f1++) setFunc(8, f1, getBit(fbits, f1));
    setFunc(8, 7, getBit(fbits, 6));
    setFunc(8, 8, getBit(fbits, 7));
    setFunc(7, 8, getBit(fbits, 8));
    for (var f2 = 9; f2 < 15; f2++) setFunc(14 - f2, 8, getBit(fbits, f2));

    for (var f3 = 0; f3 < 8; f3++) setFunc(size - 1 - f3, 8, getBit(fbits, f3));
    for (var f4 = 8; f4 < 15; f4++) setFunc(8, size - 15 + f4, getBit(fbits, f4));
    setFunc(8, size - 8, true); // dark module

    return { size: size, version: version, modules: modules };
  }

  // ---------- Public API ----------
  var QRCode = {
    generate: function (text) { return matrix(String(text)); },

    toCanvas: function (canvas, text, opts) {
      opts = opts || {};
      var m = matrix(String(text));
      var margin = opts.margin != null ? opts.margin : 4;
      var px = opts.size || Math.max(1, Math.floor(220 / (m.size + margin * 2)));
      var dim = (m.size + margin * 2) * px;
      var dark = opts.dark || '#0b0b0f';
      var light = opts.light || '#ffffff';
      canvas.width = dim; canvas.height = dim;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = light;
      ctx.fillRect(0, 0, dim, dim);
      ctx.fillStyle = dark;
      for (var y = 0; y < m.size; y++)
        for (var x = 0; x < m.size; x++)
          if (m.modules[y][x]) ctx.fillRect((x + margin) * px, (y + margin) * px, px, px);
      return dim;
    }
  };

  global.QRCode = QRCode;
})(typeof window !== 'undefined' ? window : this);
