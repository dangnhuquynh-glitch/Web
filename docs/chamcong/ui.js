/* ===== Chấm công Wi-Fi — giao diện ===== */
var CC_DEMO = null;
if (!IS_GAS) CC_DEMO = lanhChamCongCore((function () {
  var c = { wifiTen: 'H&H Dao tao', ips: ['demo-wifi'], khoa: true, thietBi: {} }, rows = [], seq = 1;
  function staff() { var d = new Date(); return DEMO.getPublicData({ m: d.getMonth() + 1, y: d.getFullYear() }).staff.map(function (s) { return { ma: s.ma, ten: s.ten }; }); }
  var ss = staff(), t = new Date();
  for (var back = 1; back <= 6; back++) {
    var d = new Date(t.getFullYear(), t.getMonth(), t.getDate() - back); if (d.getDay() === 0) continue;
    ss.slice(0, 4).forEach(function (s, i) {
      var v = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 5 + (i % 2) * 4, 50 + i * 3), r = new Date(v.getTime() + (3 + (i % 3) * .5) * 36e5 + i * 6e4);
      rows.push({ id: 'x' + seq++, luc: v.getTime(), ma: s.ma, ten: s.ten, loai: 'VAO', ip: 'demo-wifi', hopLe: true, thietBi: 'demo-' + s.ma, ghiChu: '' });
      if (!(back === 2 && i === 3)) rows.push({ id: 'x' + seq++, luc: r.getTime(), ma: s.ma, ten: s.ten, loai: 'RA', ip: 'demo-wifi', hopLe: true, thietBi: 'demo-' + s.ma, ghiChu: '' });
    });
  }
  ss.slice(1, 3).forEach(function (s) { c.thietBi[s.ma] = 'demo-' + s.ma; });
  rows.push({ id: 'x' + seq++, luc: t.getTime() - 50 * 6e4, ma: ss[1].ma, ten: ss[1].ten, loai: 'VAO', ip: 'demo-wifi', hopLe: true, thietBi: 'demo-' + ss[1].ma, ghiChu: '' });
  rows.push({ id: 'x' + seq++, luc: t.getTime() - 26 * 36e5, ma: ss[4].ma, ten: ss[4].ten, loai: 'CHAN', ip: '113.161.42.7', hopLe: false, thietBi: '', ghiChu: 'Ngoài Wi-Fi quán' });
  return {
    now: function () { return new Date(); }, newId: function () { return 'd' + seq++; }, lock: function (f) { return f(); },
    auth: function (tk) { var r = DEMO.whoAmI({ token: tk }).vaiTro; if (!r) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'); return r; },
    staff: staff, cfg: function () { return JSON.parse(JSON.stringify(c)); }, saveCfg: function (o) { c = JSON.parse(JSON.stringify(o)); },
    rows: function () { return rows.map(function (r) { return Object.assign({}, r); }); },
    append: function (r) { rows.push(Object.assign({}, r)); },
    setHuy: function (id, h) { rows.forEach(function (r) { if (r.id === id) r.huy = h; }); }
  };
})());
function ccCall(name, args) {
  args = args || {};
  if (IS_GAS) return new Promise(function (res, rej) {
    google.script.run.withSuccessHandler(function (s) { var r = JSON.parse(s); r.ok ? res(r.data) : rej(new Error(r.loi)); })
      .withFailureHandler(function (e) { rej(new Error((e && e.message) || 'Không kết nối được máy chủ')); }).chamCongApi(name, JSON.stringify(args));
  });
  return new Promise(function (res, rej) { setTimeout(function () { try { res(JSON.parse(JSON.stringify(CC_DEMO[name](JSON.parse(JSON.stringify(args)))))); } catch (e) { rej(e); } }, 220); });
}

/* IP công cộng của mạng đang dùng (Wi-Fi quán sẽ ra cùng 1 IP) */
var ccIpCache = null;
function ccGetIp(fresh) {
  if (!fresh && ccIpCache && Date.now() - ccIpCache.t < 30000) return Promise.resolve(ccIpCache.ip);
  function get(url, json) {
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, tm = setTimeout(function () { if (ctl) ctl.abort(); }, 6000);
    return fetch(url, { cache: 'no-store', signal: ctl ? ctl.signal : undefined }).then(function (r) { clearTimeout(tm); if (!r.ok) throw new Error(); return json ? r.json().then(function (j) { return j.ip; }) : r.text(); })
      .then(function (ip) { ip = String(ip || '').trim(); if (!/^[0-9a-fA-F.:]{3,45}$/.test(ip)) throw new Error(); return ip; });
  }
  return get('https://api.ipify.org?format=json', true).catch(function () { return get('https://ipv4.icanhazip.com/', false); })
    .catch(function () { if (!IS_GAS) return 'demo-wifi'; throw new Error('Không kiểm tra được mạng. Kiểm tra lại kết nối Wi-Fi rồi thử lại.'); })
    .then(function (ip) { ccIpCache = { ip: ip, t: Date.now() }; return ip; });
}
function ccDevice() {
  var d = LS.get('lanh_dev');
  if (!d) { d = 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); LS.set('lanh_dev', d); }
  return d;
}
function gioTxt(g) { var h = Math.floor(g + 1e-9), m = Math.round((g - h) * 60); return (h ? h + ' giờ ' : '') + (m || !h ? m + ' phút' : '').trim(); }
function phutTxt(p) { return gioTxt(p / 60); }

/* ---------- Màn chấm công của nhân viên ---------- */
var cc = { st: null, busy: false, ad: { kieu: 'ngay', d: new Date() }, adData: null, myIp: '' };
var WIFI_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.3a9.5 9.5 0 0 1 13 0M8.6 15.5a5 5 0 0 1 6.8 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="19" r="1.6" fill="currentColor"/></svg>';
function ccShow() {
  mode = 'cc';
  $('#mCC').setAttribute('aria-pressed', 'true');
  ['mStaff', 'mKho', 'mAdmin'].forEach(function (id) { $('#' + id).setAttribute('aria-pressed', 'false'); });
  ['staff', 'kho', 'admin'].forEach(function (id) { $('#' + id).hidden = true; });
  $('#bar').hidden = true; document.body.classList.remove('has-bar');
  $('#cc').hidden = false; renderCC(); window.scrollTo(0, 0);
}
function renderCC() {
  var el = $('#cc');
  if (!st.me) {
    el.innerHTML = '<div class="loading">Đang tải…</div>';
    call('getPublicData', { m: CUR.m, y: CUR.y }).then(function (v) {
      el.innerHTML = '<section class="pick"><h1>Bạn là ai?</h1><p class="muted">Chạm vào tên của bạn để chấm công. Lần sau web tự nhớ.</p><div class="names">' +
        v.staff.map(function (s) { return '<button data-me="' + esc(s.ma) + '"><span class="av">' + esc(initials(s.ten)) + '</span><b>' + esc(s.ten) + '</b></button>'; }).join('') + '</div></section>';
      $$('[data-me]', el).forEach(function (b) { b.onclick = function () { st.me = b.dataset.me; LS.set('lanh_me', st.me); renderCC(); }; });
    }).catch(function (e) { el.innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
    return;
  }
  if (!cc.st || cc.st.ma !== st.me) el.innerHTML = '<div class="loading">Đang kiểm tra Wi-Fi…</div>';
  ccLoad(false);
}
function ccLoad(fresh) {
  var el = $('#cc'), me = st.me;
  return ccGetIp(fresh).then(function (ip) { return ccCall('ccStatus', { ma: me, ip: ip, thietBi: ccDevice() }); }, function (e) { return { netErr: e.message }; })
    .then(function (s) {
      if (mode !== 'cc') return;
      if (s.netErr) { if (cc.st) { cc.st.dungWifi = false; cc.st.netErr = s.netErr; drawCC(); } else el.innerHTML = '<div class="panel empty">' + esc(s.netErr) + '<br><br><button class="btn pri" id="ccRetry">Thử lại</button></div>'; var rb = $('#ccRetry'); if (rb) rb.onclick = function () { ccLoad(true); }; return; }
      cc.st = s; drawCC();
    }).catch(function (e) {
      if (/Không tìm thấy nhân viên/.test(e.message)) { st.me = null; LS.set('lanh_me', null); return renderCC(); }
      el.innerHTML = '<div class="panel empty">' + esc(e.message) + '<br><br><button class="btn" id="ccRetry">Thử lại</button></div>'; $('#ccRetry').onclick = function () { ccLoad(true); };
    });
}
function drawCC() {
  var s = cc.st, el = $('#cc'), vao = s.tiepTheo === 'VAO';
  var net = !s.daCaiDat ? ['warn', 'Chưa cài Wi-Fi chấm công', 'Nhờ quản lý vào <b>Quản lý → Chấm công</b> để cài mạng Wi-Fi của quán.']
    : s.netErr ? ['bad', 'Không kiểm tra được mạng', esc(s.netErr)]
    : s.dungWifi ? ['ok', 'Đã kết nối Wi-Fi “' + esc(s.wifiTen) + '”', 'Bạn có thể chấm công.']
    : ['bad', 'Chưa kết nối Wi-Fi “' + esc(s.wifiTen) + '”', 'Mở <b>Cài đặt → Wi-Fi</b>, chọn <b>' + esc(s.wifiTen) + '</b>, tắt 4G / VPN rồi bấm <b>Kiểm tra lại</b>.'];
  var may = s.khoa && !s.mayOk ? '<div class="cc-alert">' + (s.chuMay ? 'Điện thoại này đã đăng ký chấm công cho <b>' + esc(s.chuMay) + '</b>. Mỗi người chấm trên điện thoại của mình.' : 'Đây không phải điện thoại bạn đã đăng ký. Nếu bạn đổi máy, nhờ quản lý bấm <b>Gỡ máy</b> cho bạn.') + '</div>' : '';
  var can = s.daCaiDat && s.dungWifi && s.mayOk && !s.netErr;
  var dl = s.homNay.filter(function (x) { return x.dangLam; })[0];
  var h = '<div class="who-bar"><span class="av">' + esc(initials(s.ten)) + '</span><b>' + esc(s.ten) + '</b><button class="lnk" id="ccChg">Đổi tên</button></div>' +
    '<div class="cc-grid"><section class="panel cc-main">' +
    '<div class="cc-time"><div class="cc-clock num" id="ccClock"></div><div class="muted" id="ccDate"></div></div>' +
    '<div class="cc-net ' + net[0] + '" role="status"><span class="cc-wi">' + WIFI_ICON + '</span><div><span class="t">' + net[1] + '</span><span class="d">' + net[2] + '</span></div>' +
    '<button class="btn ghost" id="ccRe" title="Kiểm tra lại mạng">Kiểm tra lại</button></div>' + may +
    '<button class="cc-btn ' + (vao ? 'vao' : 'ra') + '" id="ccGo"' + (can ? '' : ' disabled') + '><span class="cc-bi">' + (vao ? '→' : '←') + '</span>' + (vao ? 'Vào ca' : 'Ra ca') + '<small>' + (can ? (vao ? 'Bấm khi bắt đầu làm' : 'Bấm khi kết thúc ca') : 'Cần kết nối Wi-Fi quán') + '</small></button>' +
    (dl ? '<div class="cc-now"><span class="dot"></span>Đang trong ca từ <b>' + dl.vao.gio + '</b> · đã làm ' + phutTxt(dl.phutDaLam) + '</div>' : '') +
    '</section><div class="cc-side"><section class="panel cc-today"><div class="cc-h"><h3>Hôm nay</h3><span class="num"><b>' + gioTxt(s.gioHomNay) + '</b></span></div>' +
    (s.homNay.length ? '<ul class="cc-tl">' + s.homNay.map(function (x) {
      return '<li><span class="cc-pt in">' + (x.vao ? x.vao.gio : '—') + '</span><span class="cc-ln"></span><span class="cc-pt out">' + (x.ra ? x.ra.gio : x.dangLam ? 'đang làm' : '—') + '</span>' +
        '<span class="cc-g">' + (x.ra && x.vao ? gioTxt(x.gio) : x.thieuVao ? 'thiếu giờ vào' : x.thieuRa ? 'quên ra ca' : '') + '</span></li>';
    }).join('') + '</ul>' : '<p class="muted small" style="margin:0">Chưa chấm công hôm nay.</p>') + '</section>' +
    '<section class="panel cc-week"><div class="cc-h"><h3>Tuần này</h3><span class="num"><b>' + gioTxt(s.tongTuan) + '</b></span></div><div class="cc-bars">' +
    s.tuan.map(function (d) { var mx = Math.max.apply(null, s.tuan.map(function (x) { return x.gio; }).concat([4])); return '<div class="' + (d.homNay ? 'td' : '') + '" title="' + d.dm + ': ' + gioTxt(d.gio) + '"><span class="v num">' + (d.gio ? String(d.gio).replace('.', ',') : '') + '</span><span class="b"><i style="height:' + Math.round(d.gio / mx * 100) + '%"></i></span><span class="l">' + d.thu + '</span></div>'; }).join('') +
    '</div></section></div></div>';
  el.innerHTML = h; ccTick();
  $('#ccChg').onclick = function () { st.me = null; cc.st = null; LS.set('lanh_me', null); renderCC(); };
  $('#ccRe').onclick = function () { this.disabled = true; this.textContent = 'Đang kiểm tra…'; ccLoad(true); };
  $('#ccGo').onclick = ccPunch;
}
function ccPunch() {
  if (cc.busy) return; cc.busy = true;
  var b = $('#ccGo'); b.disabled = true; b.classList.add('busy');
  ccGetIp(true).then(function (ip) { return ccCall('ccPunch', { ma: st.me, ip: ip, thietBi: ccDevice() }); }).then(function (s) {
    cc.busy = false; cc.st = s; drawCC();
    var v = s.vuaCham.loai === 'VAO';
    openModal('<div class="done ok"><div class="big-ic">✓</div><h2>' + (v ? 'Đã vào ca' : 'Đã ra ca') + ' lúc ' + s.vuaCham.gio + '</h2><p class="muted">' +
      (v ? 'Chúc ' + esc(shortName(s.ten)) + ' làm việc vui vẻ! Nhớ bấm <b>Ra ca</b> khi về.' : 'Hôm nay bạn đã làm <b>' + gioTxt(s.gioHomNay) + '</b>. Cảm ơn bạn!') + '</p></div><button class="btn pri big" data-close>Xong</button>');
  }).catch(function (e) {
    cc.busy = false; ccLoad(true);
    var wifi = /Wi-Fi|mạng/.test(e.message);
    openModal('<div class="done warn"><div class="big-ic">!</div><h2>Chưa chấm được công</h2><p>' + esc(e.message) + '</p></div>' +
      (wifi ? '<ol class="steps"><li><span><span class="t">Bật Wi-Fi</span><span class="d">Vào Cài đặt → Wi-Fi trên điện thoại.</span></span></li><li><span><span class="t">Chọn “' + esc(cc.st ? cc.st.wifiTen : 'H&H Dao tao') + '”</span><span class="d">Đợi đến khi điện thoại báo đã kết nối.</span></span></li><li><span><span class="t">Tắt 4G và VPN</span><span class="d">Rồi quay lại bấm chấm công.</span></span></li></ol>' : '') +
      '<button class="btn pri big" data-close>Đã hiểu</button>');
  });
}
var ccTimer = null;
function ccTick() {
  var c = $('#ccClock'); if (!c) return;
  var d = new Date(); c.textContent = d.getHours() + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
  $('#ccDate').textContent = THU_DAI[d.getDay()] + ', ' + fullDate(d);
  if (!ccTimer) ccTimer = setInterval(function () { if (mode === 'cc') ccTick(); }, 1000);
}

/* ---------- Tab Quản lý → Chấm công ---------- */
var _renderAdmin = renderAdmin;
renderAdmin = function () {
  var want = ad.tab === 'chamcong';
  if (want) ad.tab = 'duyet';
  _renderAdmin();
  var nav = $('#admin .tabs'); if (!nav || !ad.token) return;
  var b = document.createElement('button'); b.setAttribute('role', 'tab'); b.dataset.t = 'chamcong'; b.textContent = 'Chấm công';
  var set = $('[data-t="caidat"]', nav); nav.insertBefore(b, set);
  b.onclick = function () { ad.tab = 'chamcong'; renderAdmin(); };
  if (want) { ad.tab = 'chamcong'; $$('[data-t]', nav).forEach(function (x) { x.setAttribute('aria-selected', x === b); }); tabChamCong(); }
};
function ccRange() {
  var a = cc.ad, d = a.d, k = function (x) { return x.getFullYear() + '-' + ('0' + (x.getMonth() + 1)).slice(-2) + '-' + ('0' + x.getDate()).slice(-2); };
  if (a.kieu === 'ngay') return { tu: k(d), den: k(d), nhan: (isoOf(d) === isoOf(new Date()) ? 'Hôm nay · ' : THU_DAI[d.getDay()] + ' · ') + dmOf(d) };
  if (a.kieu === 'tuan') { var m = mondayOf(d), e = addDays(m, 6); return { tu: k(m), den: k(e), nhan: 'Tuần ' + dmOf(m) + ' – ' + dmOf(e) }; }
  var f = new Date(d.getFullYear(), d.getMonth(), 1), l = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { tu: k(f), den: k(l), nhan: 'Tháng ' + (d.getMonth() + 1) + ' / ' + d.getFullYear() };
}
function ccShift(n) {
  var a = cc.ad, d = a.d;
  a.d = a.kieu === 'ngay' ? addDays(d, n) : a.kieu === 'tuan' ? addDays(d, 7 * n) : new Date(d.getFullYear(), d.getMonth() + n, 1);
  tabChamCong();
}
function tabChamCong() {
  var el = $('#ab'), r = ccRange();
  if (!cc.adData) el.innerHTML = '<div class="loading">Đang tải…</div>';
  Promise.all([ccCall('ccAdmin', { token: ad.token, tu: r.tu, den: r.den }), ccGetIp(false).catch(function () { return ''; })]).then(function (res) {
    if (ad.tab !== 'chamcong') return;
    cc.adData = res[0]; cc.myIp = res[1]; drawCCAdmin(r);
  }).catch(guard);
}
function drawCCAdmin(r) {
  var d = cc.adData, el = $('#ab'), c = d.cfg, onWifi = cc.myIp && c.ips.indexOf(cc.myIp.toLowerCase()) >= 0;
  var h = '<div class="head"><div><div class="eyebrow">Chấm công Wi-Fi · ' + esc(c.wifiTen) + '</div><h1>' + esc(r.nhan) + '</h1></div><div class="row">' +
    '<div class="cc-seg">' + [['ngay', 'Ngày'], ['tuan', 'Tuần'], ['thang', 'Tháng']].map(function (x) { return '<button data-k="' + x[0] + '" aria-pressed="' + (cc.ad.kieu === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div>' +
    '<div class="mnav"><button id="apv" aria-label="Trước">‹</button><button id="anx" aria-label="Sau">›</button></div></div></div>';
  if (!c.ips.length) h += '<div class="cc-setup"><b>Bước đầu tiên: cài Wi-Fi chấm công</b><span>Hãy đứng ở quán, kết nối điện thoại / máy tính này vào Wi-Fi <b>' + esc(c.wifiTen) + '</b>, rồi bấm nút bên cạnh. Nhân viên chỉ chấm công được khi dùng mạng này.</span><button class="btn pri" id="ccAddMine">Dùng mạng đang kết nối</button></div>';
  h += '<div class="tiles">' +
    '<div class="panel tile main"><div class="eyebrow">Đang trong ca</div><div class="v num">' + d.dangLam.length + '</div></div>' +
    '<div class="panel tile"><div class="eyebrow">Nhân viên đã chấm</div><div class="v num">' + d.tong.length + '</div></div>' +
    '<div class="panel tile"><div class="eyebrow">Tổng giờ công</div><div class="v num">' + String(d.tongGio).replace('.', ',') + ' h</div></div>' +
    '<div class="panel tile"><div class="eyebrow">Thử chấm ngoài Wi-Fi</div><div class="v num"' + (d.chan.length ? ' style="color:var(--bad)"' : '') + '>' + d.chan.length + '</div></div></div>';
  if (d.dangLam.length) h += '<div class="cc-live">' + d.dangLam.map(function (x) { return '<span><span class="dot"></span><b>' + esc(x.ten) + '</b> từ ' + x.tu + ' · ' + phutTxt(x.phut) + '</span>'; }).join('') + '</div>';
  h += '<div class="toolbar"><span class="small muted" style="flex:1;min-width:200px">Bấm vào một dòng để sửa: huỷ lần chấm sai hoặc thêm giờ khi nhân viên quên chấm.</span><button class="btn" id="ccAdd">+ Thêm giờ chấm tay</button></div>';
  h += d.ngay.length ? '<div class="tscroll"><table class="pay cc-tb"><thead><tr><th>Ngày</th><th>Nhân viên</th><th>Vào</th><th>Ra</th><th class="r">Số giờ</th><th></th></tr></thead><tbody>' +
    d.ngay.map(function (n, i) {
      var segs = n.segs.length ? n.segs : [{ vao: null, ra: null, gio: 0 }];
      return segs.map(function (s, j) {
        var tag = function (p) { return p ? p.gio + (p.tay ? ' <span class="cc-tag">tay</span>' : '') : '<span class="cc-miss">thiếu</span>'; };
        return '<tr data-row="' + i + '"' + (j ? ' class="cont"' : '') + '><td>' + (j ? '' : esc(n.nhan)) + '</td><td>' + (j ? '' : '<b>' + esc(n.ten) + '</b>') + '</td><td>' + tag(s.vao) + '</td><td>' + (s.dangLam ? '<span class="cc-on">đang làm</span>' : s.thieuRa ? '<span class="cc-miss">quên ra ca</span>' : tag(s.ra)) + '</td><td class="r num">' + (s.gio ? String(s.gio).replace('.', ',') : '–') + '</td><td class="r">' + (j ? '' : '<button class="btn ghost sm" data-ed="' + i + '">Sửa</button>') + '</td></tr>';
      }).join('');
    }).join('') + '</tbody></table></div>' : '<div class="panel empty">Chưa có ai chấm công trong khoảng này.</div>';
  if (d.tong.length && cc.ad.kieu !== 'ngay') h += '<h3 class="sp-h">Tổng theo nhân viên</h3><div class="tscroll"><table class="pay cc-tb"><thead><tr><th>Nhân viên</th><th class="r">Số ngày</th><th class="r">Tổng giờ</th><th>Cần kiểm tra</th></tr></thead><tbody>' +
    d.tong.map(function (t) { return '<tr><td><b>' + esc(t.ten) + '</b></td><td class="r num">' + t.soNgay + '</td><td class="r num"><b>' + String(t.gio).replace('.', ',') + '</b></td><td>' + (t.loi ? '<span class="cc-miss">' + t.loi + ' lần thiếu vào/ra</span>' : '<span class="muted">—</span>') + '</td></tr>'; }).join('') + '</tbody></table></div>';
  if (d.chan.length) h += '<details class="panel cc-det"><summary><b>Lần thử chấm ngoài Wi-Fi (' + d.chan.length + ')</b> <span class="small muted">— nhân viên dùng 4G hoặc mạng khác</span></summary><ul>' + d.chan.map(function (x) { return '<li><b>' + esc(x.ten) + '</b> · ' + esc(x.luc) + ' · <span class="muted">IP ' + esc(x.ip) + '</span></li>'; }).join('') + '</ul></details>';
  h += '<details class="panel cc-det cc-set"' + (c.ips.length ? '' : ' open') + '><summary><b>Cài đặt Wi-Fi chấm công</b> <span class="small muted">— ' + (c.ips.length ? c.ips.length + ' mạng được phép' : 'chưa cài') + '</span></summary><div class="cc-set-b">' +
    '<div class="field"><label for="ccTen">Tên Wi-Fi hiển thị cho nhân viên</label><input class="inp" id="ccTen" value="' + esc(c.wifiTen) + '"></div>' +
    '<div class="field"><label>Địa chỉ IP của Wi-Fi quán</label><div class="cc-ips" id="ccIps">' + (c.ips.length ? c.ips.map(function (ip) { return '<span class="cc-ip num">' + esc(ip) + '<button data-rm="' + esc(ip) + '" aria-label="Bỏ ' + esc(ip) + '">×</button></span>'; }).join('') : '<span class="small muted">Chưa có IP nào.</span>') + '</div>' +
    '<span class="small muted">Mạng bạn đang dùng: <b class="num">' + esc(cc.myIp || 'không xác định') + '</b>' + (cc.myIp ? (onWifi ? ' · <span style="color:var(--ok)">đã có trong danh sách ✓</span>' : ' · chưa có trong danh sách') : '') + '</span>' +
    '<div class="row"><button class="btn" id="ccMine"' + (onWifi || !cc.myIp ? ' disabled' : '') + '>+ Thêm mạng đang dùng</button><input class="inp" id="ccIpIn" placeholder="hoặc nhập IP, VD 113.161.42.7" style="flex:1;min-width:160px"><button class="btn" id="ccIpAdd">Thêm</button></div></div>' +
    '<label class="cc-chk"><input type="checkbox" id="ccKhoa"' + (c.khoa ? ' checked' : '') + '><span><b>Mỗi nhân viên chỉ chấm trên điện thoại của mình</b><span class="small muted">Lần chấm đầu tiên sẽ gắn điện thoại với nhân viên, chống chấm công hộ.</span></span></label>' +
    '<div class="field"><label>Điện thoại đã gắn</label><div class="cc-devs">' + d.staff.map(function (s) { return '<div><span>' + esc(s.ten) + '</span>' + (s.coMay ? '<button class="btn ghost sm danger" data-rs="' + esc(s.ma) + '">Gỡ máy</button>' : '<span class="small muted">chưa gắn</span>') + '</div>'; }).join('') + '</div></div>' +
    '<div class="row"><span style="flex:1"></span><button class="btn pri" id="ccSave">Lưu cài đặt</button></div>' +
    '<p class="small muted" style="margin:0">Lưu ý: nếu nhà mạng đổi IP của Wi-Fi quán (thường khi khởi động lại modem), nhân viên sẽ không chấm được. Khi đó chỉ cần đứng ở quán và bấm “Thêm mạng đang dùng”.</p></div></details>';
  el.innerHTML = h;

  var ips = c.ips.slice();
  function drawIps() { $('#ccIps').innerHTML = ips.length ? ips.map(function (ip) { return '<span class="cc-ip num">' + esc(ip) + '<button data-rm="' + esc(ip) + '" aria-label="Bỏ ' + esc(ip) + '">×</button></span>'; }).join('') : '<span class="small muted">Chưa có IP nào.</span>'; bindRm(); }
  function bindRm() { $$('[data-rm]', el).forEach(function (b) { b.onclick = function () { ips = ips.filter(function (x) { return x !== b.dataset.rm; }); drawIps(); }; }); }
  function addIp(ip) { ip = String(ip || '').trim().toLowerCase(); if (!ip) return; if (ips.indexOf(ip) < 0) ips.push(ip); drawIps(); }
  function save(msg) {
    return ccCall('ccSaveCfg', { token: ad.token, wifiTen: $('#ccTen').value, ips: ips, khoa: $('#ccKhoa').checked }).then(function () { toast(msg || 'Đã lưu cài đặt chấm công'); tabChamCong(); }).catch(guard);
  }
  bindRm();
  $$('.cc-seg [data-k]', el).forEach(function (b) { b.onclick = function () { cc.ad.kieu = b.dataset.k; tabChamCong(); }; });
  $('#apv').onclick = function () { ccShift(-1); }; $('#anx').onclick = function () { ccShift(1); };
  $('#ccMine').onclick = function () { addIp(cc.myIp); };
  $('#ccIpAdd').onclick = function () { addIp($('#ccIpIn').value); $('#ccIpIn').value = ''; };
  $('#ccIpIn').onkeydown = function (e) { if (e.key === 'Enter') $('#ccIpAdd').click(); };
  $('#ccSave').onclick = function () { save(); };
  var am = $('#ccAddMine'); if (am) am.onclick = function () { if (!cc.myIp) return fail(new Error('Không xác định được mạng đang dùng.')); addIp(cc.myIp); save('Đã cài Wi-Fi chấm công'); };
  $$('[data-rs]', el).forEach(function (b) { b.onclick = function () { ccCall('ccResetDevice', { token: ad.token, ma: b.dataset.rs }).then(function () { toast('Đã gỡ máy. Lần chấm tới sẽ gắn máy mới.'); tabChamCong(); }).catch(guard); }; });
  $('#ccAdd').onclick = function () { ccManual(); };
  $$('tr[data-row]', el).forEach(function (tr) { tr.onclick = function () { ccEditDay(d.ngay[+tr.dataset.row]); }; });
}
function ccManual(pre) {
  var d = cc.adData, today = new Date(), k = pre ? pre.ngay : today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
  openModal('<header><div style="flex:1"><div class="eyebrow">Chấm công</div><h2>Thêm giờ chấm tay</h2></div><button class="x" data-close aria-label="Đóng">×</button></header>' +
    '<p class="small muted" style="margin:0">Dùng khi nhân viên quên chấm hoặc điện thoại hỏng. Dòng này được đánh dấu “tay”.</p>' +
    '<div class="field"><label for="mNv">Nhân viên</label><select class="inp" id="mNv">' + d.staff.map(function (s) { return '<option value="' + esc(s.ma) + '"' + (pre && pre.ma === s.ma ? ' selected' : '') + '>' + esc(s.ten) + '</option>'; }).join('') + '</select></div>' +
    '<div class="two"><div class="field"><label for="mNg">Ngày</label><input class="inp" type="date" id="mNg" value="' + k + '"></div><div class="field"><label for="mGi">Giờ</label><input class="inp" type="time" id="mGi" value="' + (pre && pre.gio || '') + '"></div></div>' +
    '<div class="field"><label>Loại</label><div class="cc-seg wide"><button data-l="VAO" aria-pressed="' + (!pre || pre.loai !== 'RA') + '">Vào ca</button><button data-l="RA" aria-pressed="' + (!!pre && pre.loai === 'RA') + '">Ra ca</button></div></div>' +
    '<div class="field"><label for="mGc">Lý do (không bắt buộc)</label><input class="inp" id="mGc" placeholder="VD: quên chấm"></div>' +
    '<button class="btn pri big" id="mOk">Thêm</button>', function (sh) {
    var loai = pre && pre.loai === 'RA' ? 'RA' : 'VAO';
    $$('[data-l]', sh).forEach(function (b) { b.onclick = function () { loai = b.dataset.l; $$('[data-l]', sh).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); }; });
    $('#mOk', sh).onclick = function () {
      var g = $('#mGi', sh).value; if (!g) return toast('Chọn giờ', true);
      this.disabled = true;
      ccCall('ccAddManual', { token: ad.token, ma: $('#mNv', sh).value, ngay: $('#mNg', sh).value, gio: g.slice(0, 5).replace(/^0(\d)/, '$1'), loai: loai, ghiChu: $('#mGc', sh).value })
        .then(function () { closeModal(); toast('Đã thêm giờ chấm'); tabChamCong(); }).catch(function (e) { $('#mOk', sh).disabled = false; guard(e); });
    };
  });
}
function ccEditDay(n) {
  openModal('<header><div style="flex:1"><div class="eyebrow">' + esc(n.nhan) + '</div><h2>' + esc(n.ten) + '</h2></div><button class="x" data-close aria-label="Đóng">×</button></header>' +
    '<div class="panel cc-edit">' + n.tatCa.map(function (r) {
      return '<div class="' + (r.huy ? 'huy' : '') + '"><span class="code ' + (r.loai === 'VAO' ? 'S' : 'C') + '">' + (r.loai === 'VAO' ? 'Vào' : 'Ra') + '</span><b class="num">' + r.gio + '</b>' + (r.tay ? '<span class="cc-tag">tay</span>' : '') +
        '<span class="small muted" style="flex:1">' + esc(r.ghiChu) + (r.huy ? ' (đã huỷ)' : '') + '</span><button class="btn ghost sm ' + (r.huy ? '' : 'danger') + '" data-v="' + esc(r.id) + '" data-h="' + (r.huy ? 0 : 1) + '">' + (r.huy ? 'Khôi phục' : 'Huỷ') + '</button></div>';
    }).join('') + '</div>' +
    '<p class="small muted" style="margin:0">Lần chấm bị huỷ không bị xoá, chỉ không tính giờ. Có thể khôi phục.</p>' +
    '<div class="row"><button class="btn" id="eAdd">+ Thêm giờ cho ngày này</button><span style="flex:1"></span><button class="btn pri" data-close>Xong</button></div>', function (sh) {
    $$('[data-v]', sh).forEach(function (b) { b.onclick = function () { b.disabled = true; ccCall('ccVoid', { token: ad.token, id: b.dataset.v, huy: b.dataset.h === '1' }).then(function () { closeModal(); toast(b.dataset.h === '1' ? 'Đã huỷ lần chấm' : 'Đã khôi phục'); tabChamCong(); }).catch(guard); }; });
    $('#eAdd', sh).onclick = function () { var miss = n.segs.some(function (s) { return s.thieuRa || s.dangLam; }); closeModal(); ccManual({ ma: n.ma, ngay: n.ngay, loai: miss ? 'RA' : 'VAO' }); };
  });
}
