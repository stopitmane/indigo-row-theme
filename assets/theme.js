(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function toast(msg) {
    var t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('on');
    clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('on'); }, 2600);
  }
  function setCount(n) { $$('[data-cart-count]').forEach(function (el) { el.textContent = n; }); }

  /* Cart drawer */
  var drawer = $('#cart-drawer');
  var onCartPage = location.pathname.replace(/\/$/, '') === window.theme.cartUrl.replace(/\/$/, '');
  function openDrawer() { if (drawer && !drawer.open) drawer.showModal(); }
  function closeDrawer() { if (drawer && drawer.open) drawer.close(); }
  function refreshDrawer() {
    return Promise.all([
      fetch('?sections=cart-drawer').then(function (r) { return r.json(); }),
      fetch('/cart.js').then(function (r) { return r.json(); })
    ]).then(function (res) {
      var html = new DOMParser().parseFromString(res[0]['cart-drawer'], 'text/html');
      var fresh = $('[data-drawer-body]', html), cur = $('[data-drawer-body]', drawer);
      if (fresh && cur) cur.replaceWith(fresh);
      setCount(res[1].item_count);
    });
  }
  if (drawer) {
    drawer.addEventListener('click', function (e) {
      if (e.target === drawer) return closeDrawer();
      if (e.target.closest('[data-drawer-close]')) return closeDrawer();
      var b = e.target.closest('[data-line]');
      if (!b) return;
      var body = $('[data-drawer-body]', drawer); body.classList.add('busy');
      fetch('/cart/change.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ line: +b.dataset.line, quantity: +b.dataset.qty }) })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.description || d.message || 'Could not update cart'); }); })
        .then(refreshDrawer)
        .catch(function (err) {
          body.classList.remove('busy');
          var e = $('.derr', body);
          if (!e) { e = document.createElement('p'); e.className = 'derr'; e.setAttribute('role', 'alert'); $('.drawer-head', body).after(e); }
          e.textContent = err.message;
        });
    });
  }
  $$('[data-cart-open]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!drawer || onCartPage) return;
      e.preventDefault(); refreshDrawer().then(openDrawer);
    });
  });

  /* Product page */
  var root = $('[data-product]');
  if (root) {
    var variants = JSON.parse($('[data-variants]', root).textContent);
    var form = $('[data-product-form]', root);
    var idInput = $('[data-variant-id]', form);
    var priceEl = $('[data-price]', root);
    var atc = $('[data-atc]', form);

    function showMedia(id) {
      $$('[data-media]', root).forEach(function (s) { s.hidden = s.dataset.media != id; });
      $$('[data-thumb]', root).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.thumb == id); });
    }
    $$('[data-thumb]', root).forEach(function (b) { b.addEventListener('click', function () { showMedia(b.dataset.thumb); }); });

    function selected() {
      return $$('fieldset[data-option]', form).map(function (fs) { var c = $('input:checked', fs); return c ? c.value : null; });
    }
    function update() {
      $$('fieldset[data-option] legend span', form).forEach(function (s) {
        var c = $('input:checked', s.closest('fieldset')); if (c) s.textContent = c.value;
      });
      var sel = selected();
      var v = variants.filter(function (x) { return x.options.every(function (o, i) { return sel[i] === null || o === sel[i]; }); })[0];
      if (!v) { atc.disabled = true; atc.textContent = 'Unavailable'; return; }
      idInput.value = v.id;
      priceEl.innerHTML = (v.sale ? '<s>' + v.compare + '</s> ' : '') + v.price;
      atc.disabled = !v.available; atc.textContent = v.available ? 'Add to cart' : 'Sold out';
      if (v.media) showMedia(v.media);
      var u = new URL(location.href); u.searchParams.set('variant', v.id); history.replaceState({}, '', u);
    }
    form.addEventListener('change', function (e) { if (e.target.type === 'radio') update(); });

    $$('[data-qty]', form).forEach(function (b) {
      b.addEventListener('click', function () {
        var q = $('input[name=quantity]', form);
        q.value = Math.max(1, (parseInt(q.value, 10) || 1) + parseInt(b.dataset.qty, 10));
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      atc.disabled = true;
      fetch(window.theme.addUrl + '.js', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.description || 'Could not add to cart'); return d; }); })
        .then(refreshDrawer)
        .then(openDrawer)
        .catch(function (err) { toast(err.message); })
        .then(function () { atc.disabled = false; });
    });
  }

  var sort = $('[data-sort]');
  if (sort) sort.addEventListener('change', function () {
    var u = new URL(location.href); u.searchParams.set('sort_by', sort.value); u.searchParams.delete('page'); location.href = u;
  });
})();
