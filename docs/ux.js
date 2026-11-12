/* ===== UX: hướng dẫn người mới + phím tắt cho người dùng quen ===== */
(function () {
  var IC = {
    help: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M7.6 7.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.4v.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="10" cy="14.4" r="1" fill="currentColor"/></svg>',
    sun: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="3.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 1.8v2.1M10 16.1v2.1M1.8 10h2.1M16.1 10h2.1M4.2 4.2l1.5 1.5M14.3 14.3l1.5 1.5M4.2 15.8l1.5-1.5M14.3 5.7l1.5-1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    moon: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16.5 12.2A6.8 6.8 0 0 1 7.8 3.5a6.8 6.8 0 1 0 8.7 8.7Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    auto: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 2.4a7.6 7.6 0 0 1 0 15.2Z" fill="currentColor"/></svg>'
  };
  var TOUCH = window.matchMedia && matchMedia('(hover: none)').matches;

  /* ---------- Giao diện sáng / tối ---------- */
  var THEMES = ['auto', 'light', 'dark'], THEME_NAME = { auto: 'Tự động theo máy', light: 'Sáng', dark: 'Tối' };
  function applyTheme(t) {
    if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
    var b = $('#themeBtn'); if (b) { b.innerHTML = IC[t === 'auto' ? 'auto' : t === 'dark' ? 'moon' : 'sun']; b.title = 'Giao diện: ' + THEME_NAME[t] + ' (bấm để đổi)'; b.setAttribute('aria-label', b.title); }
  }

  /* ---------- Nút công cụ trên thanh đầu ---------- */
  var tools = document.createElement('div'); tools.className = 'tools';
  tools.innerHTML = '<button class="ibtn" id="themeBtn" type="button"></button><button class="ibtn" id="helpBtn" type="button" title="Hướng dẫn & phím tắt (?)" aria-label="Hướng dẫn và phím tắt">' + IC.help + '</button>';
  $('.top .wrap').appendChild(tools);
  var theme = LS.get('lanh_theme') || 'auto'; applyTheme(theme);
  $('#themeBtn').onclick = function () { theme = THEMES[(THEMES.indexOf(theme) + 1) % 3]; LS.set('lanh_theme', theme); applyTheme(theme); toast('Giao diện: ' + THEME_NAME[theme]); };
  $('#helpBtn').onclick = function () { openHelp(mode); };
  if (!TOUCH) { $('#mStaff').title = 'Đăng ký ca (phím 1)'; $('#mKho').title = 'Tồn kho (phím 2)'; $('#mAdmin').title = 'Quản lý (phím 3)'; }

  /* ---------- Nội dung hướng dẫn ---------- */
  var GUIDE = {
    staff: { ten: 'Đăng ký ca', tip: 'Chọn ca cho từng ngày trong tuần, rồi bấm <b>Gửi đăng ký</b> ở cuối màn hình.', steps: [
      ['Chọn tên của bạn', 'Lần đầu chạm vào tên mình. Web tự nhớ cho lần sau, muốn đổi thì bấm “Đổi tên”.'],
      ['Chọn tuần', 'Dùng nút ‹ › để đổi tuần. Dòng “Hạn chót” cho biết khi nào tuần đó khoá đăng ký.'],
      ['Chọn ca cho từng ngày', '<b>Sáng</b>, <b>Trưa</b>, <b>Học việc</b> (không tính lương) hoặc <b>Nghỉ</b>. Chạm lại để bỏ chọn. Bấm “đổi giờ” nếu không làm đủ ca.'],
      ['Gửi đăng ký', 'Bấm <b>Gửi đăng ký</b>. Ca còn chỗ được nhận ngay; ca đã đủ sẽ vào danh sách chờ theo thứ tự gửi.']] },
    kho: { ten: 'Tồn kho', tip: 'Chọn loại phiếu (Kiểm kho, Nhập hàng…), nhập số lượng bằng nút − / + rồi bấm <b>Lưu</b>.', steps: [
      ['Chọn tên của bạn', 'Để biết ai đã ghi phiếu.'],
      ['Chọn loại phiếu', '<b>Kiểm kho</b>: đếm số còn lại trên kệ. <b>Nhập hàng</b>: hàng mới về. <b>Tồn đầu</b>: số đầu tháng. <b>Đặt hàng</b>: cân tồn và lấy đơn gửi nhà cung cấp.'],
      ['Tìm và nhập số lượng', 'Gõ tên vào ô tìm hoặc lọc theo nhóm. Món nào để trống thì không tính.'],
      ['Lưu phiếu', 'Bấm nút xanh ở cuối màn hình. Khung “Cần nhập hàng” nhắc món sắp hết.']] },
    admin: { ten: 'Quản lý', tip: 'Đăng nhập bằng mật khẩu quản lý hoặc mã PIN Trưởng phòng. Mỗi tab là một công việc riêng.', steps: [
      ['Duyệt đăng ký', 'Yêu cầu chờ (ca đã đủ, học việc, nghỉ phép). Chọn rồi bấm Duyệt / Từ chối, hoặc “Duyệt theo thứ tự đăng ký”.'],
      ['Lịch tháng', 'Bảng ca cả tháng. Bấm ô để sửa ca, bấm tên để sửa nhân sự, bấm ngày để đặt ngày Lễ.'],
      ['Doanh thu · Bảng lương · Nhân sự', 'Chỉ Trưởng phòng thấy. Nhập doanh thu ngày, chi phí, xem báo cáo, tính lương theo giờ công.'],
      ['Tồn kho · Cài đặt', 'Xem báo cáo kho, danh mục hàng; đặt hạn chót đăng ký, số người tối đa mỗi ca, đổi mật khẩu.']] }
  };
  var LEGEND = '<div class="legend-codes"><span><span class="code S">S</span>Ca sáng</span><span><span class="code C">C</span>Ca trưa</span><span><span class="code HV">HV</span>Học việc</span><span><span class="code P">P</span>Nghỉ phép</span><span><span class="code NL">NL</span>Nghỉ Lễ</span></div>';
  var KEYS = [['1 · 2 · 3', 'Chuyển Đăng ký ca · Tồn kho · Quản lý'], ['← →', 'Tuần / tháng trước · sau'], ['[ ]', 'Tab Quản lý trước · sau'], ['/', 'Tới ô tìm kiếm'], ['Ctrl + Enter', 'Gửi / Lưu (nút xanh cuối màn hình)'], ['Esc', 'Đóng cửa sổ'], ['?', 'Mở trang hướng dẫn này']];

  function helpBody(t) {
    if (t === 'keys') return '<p class="small muted" style="margin:0">Dành cho máy tính, không cần chuột. Phím tắt tạm tắt khi bạn đang gõ trong ô nhập.</p><div class="kb-list">' +
      KEYS.map(function (k) { return '<div><span>' + k[1] + '</span><span>' + k[0].split(' ').map(function (x) { return /^[·+]$/.test(x) ? ' ' + x + ' ' : '<kbd>' + esc(x) + '</kbd>'; }).join('') + '</span></div>'; }).join('') + '</div>';
    var g = GUIDE[t];
    return '<ol class="steps">' + g.steps.map(function (s) { return '<li><span><span class="t">' + s[0] + '</span><span class="d">' + s[1] + '</span></span></li>'; }).join('') + '</ol>' +
      (t !== 'kho' ? '<div><div class="eyebrow" style="margin-bottom:6px">Ký hiệu ca</div>' + LEGEND + '</div>' : '');
  }
  window.openHelp = function (t) {
    t = t || 'staff';
    var tabs = [['staff', 'Đăng ký ca'], ['kho', 'Tồn kho'], ['admin', 'Quản lý']].concat(TOUCH ? [] : [['keys', 'Phím tắt']]);
    openModal('<header><div style="flex:1"><div class="eyebrow">Trợ giúp</div><h2>Hướng dẫn sử dụng</h2></div><button class="x" data-close aria-label="Đóng">×</button></header>' +
      '<div class="help-tabs" role="tablist">' + tabs.map(function (x) { return '<button role="tab" data-h="' + x[0] + '" aria-selected="' + (x[0] === t) + '">' + x[1] + '</button>'; }).join('') + '</div>' +
      '<div id="helpBody" style="display:grid;gap:14px">' + helpBody(t) + '</div>' +
      '<div class="row"><button class="btn ghost" id="hTour">Xem lại màn chào</button><span style="flex:1"></span><button class="btn pri" data-close>Đã hiểu</button></div>', function (sh) {
      $$('[data-h]', sh).forEach(function (b) { b.onclick = function () { $$('[data-h]', sh).forEach(function (x) { x.setAttribute('aria-selected', x === b); }); $('#helpBody', sh).innerHTML = helpBody(b.dataset.h); }; });
      $('#hTour', sh).onclick = function () { closeModal(); welcome(); };
    });
  };

  /* ---------- Màn chào lần đầu ---------- */
  function welcome() {
    var logo = $('.brand .logo') ? $('.brand .logo').src : '';
    openModal('<div class="welcome">' + (logo ? '<img class="logo" src="' + logo + '" alt="">' : '') +
      '<div><div class="eyebrow">Chào mừng bạn</div><h2>Bạn muốn làm gì hôm nay?</h2></div>' +
      '<p class="muted small" style="margin:0">Chọn một mục để bắt đầu. Bạn có thể mở lại hướng dẫn bất cứ lúc nào bằng nút <b>?</b> ở góc trên.</p>' +
      '<div class="wcards">' +
      '<button data-w="staff"><span class="wi">📅</span><span><b>Đăng ký ca làm</b><small>Nhân viên chọn ca sáng / trưa cho tuần tới</small></span><span class="go">›</span></button>' +
      '<button data-w="kho"><span class="wi">📦</span><span><b>Kiểm kho, nhập hàng</b><small>Đếm tồn, ghi hàng về, lấy đơn đặt hàng</small></span><span class="go">›</span></button>' +
      '<button data-w="admin"><span class="wi">🔒</span><span><b>Quản lý</b><small>Duyệt ca, lịch tháng, doanh thu, lương</small></span><span class="go">›</span></button>' +
      '</div><button class="btn ghost" data-close>Để sau</button></div>', function (sh) {
      $$('[data-w]', sh).forEach(function (b) { b.onclick = function () { closeModal(); if (mode !== b.dataset.w) setMode(b.dataset.w); showTip(b.dataset.w, true); }; });
    });
    LS.set('lanh_seen', '1');
  }

  /* ---------- Gợi ý theo từng màn (ẩn được) ---------- */
  var tip = document.createElement('div'); tip.className = 'tip'; tip.id = 'tip'; tip.hidden = true;
  $('#demo').insertAdjacentElement('afterend', tip);
  function showTip(m, force) {
    var g = GUIDE[m];
    if (!g || (!force && LS.get('lanh_tip_' + m))) { tip.hidden = true; return; }
    tip.innerHTML = '<div class="in" role="note"><span class="ic">i</span><div class="tx"><span class="t">Mẹo: ' + g.ten + '</span>' + g.tip + '</div><div class="acts"><button class="btn ghost" id="tipMore">Xem từng bước</button><button class="btn" id="tipOk">Đã hiểu</button></div></div>';
    tip.hidden = false;
    $('#tipOk').onclick = function () { LS.set('lanh_tip_' + m, '1'); tip.hidden = true; };
    $('#tipMore').onclick = function () { openHelp(m); };
  }

  /* ---------- Nhớ chế độ & tab dùng gần nhất ---------- */
  var _setMode = setMode;
  setMode = function (m) { _setMode(m); LS.set('lanh_mode', m); showTip(m); };
  $('#mStaff').onclick = function () { setMode('staff'); };
  $('#mKho').onclick = function () { setMode('kho'); };
  $('#mAdmin').onclick = function () { setMode('admin'); };
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('#admin .tabs [data-t]'); if (b) LS.set('lanh_tab', b.dataset.t); }, true);
  var lastTab = LS.get('lanh_tab'); if (lastTab && /^(duyet|lich|doanhthu|luong|nhansu|kho|caidat)$/.test(lastTab)) ad.tab = lastTab;
  var lastMode = LS.get('lanh_mode');
  if (location.hash !== '#quanly' && (lastMode === 'kho' || lastMode === 'admin')) setMode(lastMode); else showTip(mode);
  if (!LS.get('lanh_seen')) setTimeout(welcome, 400);

  /* ---------- Phím tắt ---------- */
  function vis(sel) { var e = $(sel); return e && e.offsetParent !== null && !e.disabled ? e : null; }
  document.addEventListener('keydown', function (e) {
    var t = e.target, typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    var modalOpen = !$('#modal').hidden;
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      var p = modalOpen ? $('#modal .btn.pri:not([disabled])') : vis('#bar:not([hidden]) .btn.pri');
      if (p) { e.preventDefault(); p.click(); } return;
    }
    if (typing || modalOpen || e.altKey || e.ctrlKey || e.metaKey) return;
    var k = e.key;
    if (k === '?') { e.preventDefault(); openHelp(mode); }
    else if (k === '1' || k === '2' || k === '3') { e.preventDefault(); setMode(['staff', 'kho', 'admin'][+k - 1]); }
    else if (k === 'ArrowLeft' || k === 'ArrowRight') {
      var b = k === 'ArrowLeft' ? (vis('#' + mode + ' #wp') || vis('#' + mode + ' #apv')) : (vis('#' + mode + ' #wn') || vis('#' + mode + ' #anx'));
      if (b) { e.preventDefault(); b.click(); }
    }
    else if (k === '/') { var s = $$('#' + mode + ' input[type=search], #' + mode + ' input[placeholder^="Tìm"]').filter(function (x) { return x.offsetParent; })[0]; if (s) { e.preventDefault(); s.focus(); s.select(); } }
    else if ((k === '[' || k === ']') && mode === 'admin') {
      var tabs = $$('#admin .tabs [data-t]'), i = tabs.findIndex(function (x) { return x.getAttribute('aria-selected') === 'true'; });
      if (tabs.length) { e.preventDefault(); var n = tabs[(i + (k === ']' ? 1 : -1) + tabs.length) % tabs.length]; n.click(); n.focus(); }
    }
  });
})();
