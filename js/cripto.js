/* ==========================================================
   cripto.js — normalização das respostas + SHA-256
   Usado pelo site (index.html) e pelo gerador (gerar-hash.html).
   Não precisa mexer aqui.
   ========================================================== */
(function (global) {
  'use strict';

  /**
   * Deixa a resposta num formato "padrão" antes de gerar o hash:
   * - tudo minúsculo
   * - sem acentos (ç vira c, ã vira a…)
   * - pontuação vira espaço
   * - espaços repetidos viram um só, e some o espaço do começo/fim
   * Ex.: "  Na Praia!! " -> "na praia"
   */
  function normalizarResposta(texto) {
    return String(texto || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[.,!?¿¡;:"'´`~^()\[\]{}\-_/\\]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* SHA-256 em JavaScript puro: funciona até abrindo o arquivo direto
     (file://), sem servidor e sem depender de crypto.subtle. */
  var K = [], H0 = [];
  (function () {
    function primo(n) { for (var i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
    function frac(x) { return ((x - Math.floor(x)) * 4294967296) >>> 0; }
    var n = 2, c = 0;
    while (c < 64) {
      if (primo(n)) {
        if (c < 8) H0[c] = frac(Math.pow(n, 1 / 2));
        K[c] = frac(Math.pow(n, 1 / 3));
        c++;
      }
      n++;
    }
  })();

  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

  function sha256(texto) {
    var bytes = new TextEncoder().encode(texto);
    var len = bytes.length;
    var total = ((len + 9 + 63) >> 6) << 6;
    var m = new Uint8Array(total);
    m.set(bytes);
    m[len] = 0x80;
    var dv = new DataView(m.buffer);
    dv.setUint32(total - 8, Math.floor(len / 0x20000000));
    dv.setUint32(total - 4, (len * 8) >>> 0);

    var H = H0.slice(), W = new Array(64), i;
    for (var off = 0; off < total; off += 64) {
      for (i = 0; i < 16; i++) W[i] = dv.getUint32(off + i * 4);
      for (i = 16; i < 64; i++) {
        var s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
        var s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
        W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
      }
      var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (i = 0; i < 64; i++) {
        var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K[i] + W[i]) | 0;
        var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0;
        d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    return H.map(function (x) { return ('00000000' + (x >>> 0).toString(16)).slice(-8); }).join('');
  }

  function hashResposta(texto) { return sha256(normalizarResposta(texto)); }

  global.Cripto = { normalizarResposta: normalizarResposta, sha256: sha256, hashResposta: hashResposta };
})(window);
