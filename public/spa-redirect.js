(function () {
  // Restore the original SPA path after GitHub Pages serves its 404 fallback.
  // The 404.html page appends ?p=<encoded-path>&h=<encoded-hash> to the URL.
  //
  // Security: decode once, validate with a character allowlist, never re-decode.
  // An allowlist (vs. the previous blocklist of bad protocols) closes any
  // URI-scheme confusion or encoded-bypass attack vectors.

  function isSafePath(value) {
    // Must start with exactly one slash followed only by URL-safe path characters.
    return typeof value === 'string' &&
      /^\/[A-Za-z0-9\-._~!$&'()*+,;=:@/%?]*$/.test(value);
  }

  function isSafeFragment(value) {
    // Hash fragments must start with # followed only by URL-safe characters.
    return typeof value === 'string' &&
      /^#[A-Za-z0-9\-._~!$&'()*+,;=:@/%?]*$/.test(value);
  }

  var params = new URLSearchParams(window.location.search);
  var p = params.get('p');
  if (!p) return;

  var decoded;
  try { decoded = decodeURIComponent(p); } catch (e) { return; }
  if (!isSafePath(decoded)) return;

  var fragment = '';
  var h = params.get('h');
  if (h) {
    var decodedH;
    try { decodedH = decodeURIComponent(h); } catch (e) { decodedH = ''; }
    if (isSafeFragment(decodedH)) fragment = decodedH;
  }

  window.history.replaceState(null, '', decoded + fragment);
})();
