/* ===== Chấm công Wi-Fi — lõi dùng chung (máy chủ Apps Script + bản demo) ===== */
function lanhChamCongCore(io) {
  var WIFI_MAC_DINH = 'H&H Dao tao', CHONG_BAM_LAI = 60 * 1000;
  var THU = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  function err(m) { return new Error(m); }
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function keyOf(d) { return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
  function fromKey(k) { var x = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(k || '')); if (!x) throw err('Ngày không hợp lệ.'); return new Date(+x[1], x[2] - 1, +x[3]); }
  function hm(ms) { var d = new Date(ms); return d.getHours() + ':' + p2(d.getMinutes()); }
  function r2(x) { return Math.round(x * 100) / 100; }
  function normIp(s) { return String(s || '').trim().toLowerCase(); }
  function cfg() {
    var c = io.cfg() || {};
    return { wifiTen: c.wifiTen || WIFI_MAC_DINH, ips: (c.ips || []).map(normIp).filter(Boolean), khoa: c.khoa !== false, thietBi: c.thietBi || {} };
  }
  function staffOf(ma) {
    var s = io.staff().filter(function (x) { return x.ma === ma; })[0];
    if (!s) throw err('Không tìm thấy nhân viên. Bấm “Đổi tên” và chọn lại tên của bạn.');
    return s;
  }
  function valid(r) { return r.hopLe && !r.huy; }
  /* Ghép các lần chấm trong 1 ngày thành từng đoạn Vào → Ra */
  function segments(list, nowMs) {
    var homNay = keyOf(new Date(nowMs));
    var segs = [], open = null;
    list.slice().sort(function (a, b) { return a.luc - b.luc; }).forEach(function (r) {
      if (r.loai === 'VAO') { if (open) segs.push({ vao: open, ra: null, gio: 0, thieuRa: true }); open = r; }
      else if (open) { segs.push({ vao: open, ra: r, gio: r2((r.luc - open.luc) / 36e5) }); open = null; }
      else segs.push({ vao: null, ra: r, gio: 0, thieuVao: true });
    });
    if (open) segs.push(keyOf(new Date(open.luc)) === homNay
      ? { vao: open, ra: null, gio: 0, dangLam: true, phutDaLam: Math.max(0, Math.round((nowMs - open.luc) / 6e4)) }
      : { vao: open, ra: null, gio: 0, thieuRa: true });
    return segs;
  }
  function pub(r) { return r ? { id: r.id, luc: r.luc, gio: hm(r.luc), ghiChu: r.ghiChu || '', tay: r.ip === 'tay' } : null; }
  function pubSeg(s) { return { vao: pub(s.vao), ra: pub(s.ra), gio: s.gio, dangLam: !!s.dangLam, phutDaLam: s.phutDaLam || 0, thieuRa: !!s.thieuRa, thieuVao: !!s.thieuVao }; }
  function rowsOn(ma, k) { return io.rows().filter(function (r) { return r.ma === ma && keyOf(new Date(r.luc)) === k && valid(r); }); }

  function status(a) {
    var s = staffOf(a.ma), c = cfg(), now = io.now(), k = keyOf(now), ip = normIp(a.ip);
    var today = rowsOn(s.ma, k), segs = segments(today, now.getTime());
    var last = today.slice().sort(function (x, y) { return y.luc - x.luc; })[0];
    var bound = c.thietBi[s.ma], chuMay = null;
    Object.keys(c.thietBi).forEach(function (m) { if (m !== s.ma && c.thietBi[m] === a.thietBi) chuMay = m; });
    var mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() + 6) % 7), tuan = [], all = io.rows();
    for (var i = 0; i < 7; i++) {
      var d = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i), dk = keyOf(d);
      var g = segments(all.filter(function (r) { return r.ma === s.ma && valid(r) && keyOf(new Date(r.luc)) === dk; }), now.getTime())
        .reduce(function (t, x) { return t + x.gio; }, 0);
      tuan.push({ ngay: dk, thu: THU[d.getDay()], dm: d.getDate() + '/' + (d.getMonth() + 1), gio: r2(g), homNay: dk === k });
    }
    return {
      ma: s.ma, ten: s.ten, wifiTen: c.wifiTen, daCaiDat: c.ips.length > 0, dungWifi: c.ips.indexOf(ip) >= 0,
      khoa: c.khoa, mayOk: !c.khoa || ((!bound || bound === a.thietBi) && !chuMay), chuMay: chuMay ? staffOf(chuMay).ten : '',
      tiepTheo: last && last.loai === 'VAO' ? 'RA' : 'VAO', homNay: segs.map(pubSeg),
      gioHomNay: r2(segs.reduce(function (t, x) { return t + x.gio; }, 0)), tuan: tuan,
      tongTuan: r2(tuan.reduce(function (t, x) { return t + x.gio; }, 0)), luc: now.getTime()
    };
  }

  function punch(a) {
    return io.lock(function () {
      var s = staffOf(a.ma), c = cfg(), now = io.now(), ip = normIp(a.ip);
      if (!c.ips.length) throw err('Quản lý chưa cài Wi-Fi chấm công. Nhờ quản lý vào Quản lý → Chấm công → Cài đặt Wi-Fi.');
      if (!ip) throw err('Không kiểm tra được mạng. Kiểm tra lại kết nối Wi-Fi rồi thử lại.');
      if (c.ips.indexOf(ip) < 0) {
        io.append({ id: io.newId(), luc: now.getTime(), ma: s.ma, ten: s.ten, loai: 'CHAN', ip: ip, hopLe: false, thietBi: a.thietBi || '', ghiChu: 'Ngoài Wi-Fi quán' });
        throw err('Bạn chưa kết nối Wi-Fi “' + c.wifiTen + '”. Hãy bật Wi-Fi, chọn mạng “' + c.wifiTen + '”, tắt 4G / VPN rồi thử lại.');
      }
      if (c.khoa) {
        if (!a.thietBi) throw err('Không nhận diện được điện thoại. Tải lại trang rồi thử lại.');
        var bound = c.thietBi[s.ma];
        var other = Object.keys(c.thietBi).filter(function (m) { return m !== s.ma && c.thietBi[m] === a.thietBi; })[0];
        if (other) throw err('Điện thoại này đã đăng ký chấm công cho ' + staffOf(other).ten + '. Mỗi người chấm trên điện thoại của mình.');
        if (bound && bound !== a.thietBi) throw err('Đây không phải điện thoại bạn đã đăng ký chấm công. Nếu bạn đổi máy, nhờ quản lý bấm “Gỡ máy” cho bạn.');
        if (!bound) { c.thietBi[s.ma] = a.thietBi; io.saveCfg({ wifiTen: c.wifiTen, ips: c.ips, khoa: c.khoa, thietBi: c.thietBi }); }
      }
      var today = rowsOn(s.ma, keyOf(now)).sort(function (x, y) { return y.luc - x.luc; });
      if (today[0] && now.getTime() - today[0].luc < CHONG_BAM_LAI) throw err('Bạn vừa chấm công lúc ' + hm(today[0].luc) + '. Đợi 1 phút nếu muốn chấm lại.');
      var loai = today[0] && today[0].loai === 'VAO' ? 'RA' : 'VAO';
      io.append({ id: io.newId(), luc: now.getTime(), ma: s.ma, ten: s.ten, loai: loai, ip: ip, hopLe: true, thietBi: a.thietBi || '', ghiChu: '' });
      var st = status(a); st.vuaCham = { loai: loai, gio: hm(now.getTime()) };
      return st;
    });
  }

  function range(a) {
    var tu = fromKey(a.tu), den = fromKey(a.den);
    if (den < tu || (den - tu) / 864e5 > 62) throw err('Khoảng ngày không hợp lệ (tối đa 2 tháng).');
    return { tu: tu, den: new Date(den.getFullYear(), den.getMonth(), den.getDate() + 1) };
  }
  function admin(a) {
    io.auth(a.token);
    var rg = range(a), c = cfg(), now = io.now(), staff = io.staff();
    var rows = io.rows().filter(function (r) { return r.luc >= rg.tu.getTime() && r.luc < rg.den.getTime(); });
    var by = {};
    rows.filter(function (r) { return r.loai !== 'CHAN'; }).forEach(function (r) { var k = keyOf(new Date(r.luc)) + '|' + r.ma; (by[k] = by[k] || []).push(r); });
    var ngay = Object.keys(by).sort().reverse().map(function (k) {
      var p = k.split('|'), list = by[k], segs = segments(list.filter(valid), now.getTime()), d = fromKey(p[0]);
      return { ngay: p[0], nhan: THU[d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1), ma: p[1], ten: list[0].ten,
        segs: segs.map(pubSeg), gio: r2(segs.reduce(function (t, x) { return t + x.gio; }, 0)),
        tatCa: list.sort(function (x, y) { return x.luc - y.luc; }).map(function (r) { return { id: r.id, gio: hm(r.luc), loai: r.loai, huy: !!r.huy, tay: r.ip === 'tay', ghiChu: r.ghiChu || '' }; }) };
    });
    var tong = {};
    ngay.forEach(function (n) { var t = tong[n.ma] = tong[n.ma] || { ma: n.ma, ten: n.ten, gio: 0, soNgay: 0, loi: 0 }; t.gio = r2(t.gio + n.gio); t.soNgay++; n.segs.forEach(function (s) { if (s.thieuRa || s.thieuVao) t.loi++; }); });
    var dangLam = [];
    staff.forEach(function (s) { var sg = segments(rowsOn(s.ma, keyOf(now)), now.getTime()); var o = sg.filter(function (x) { return x.dangLam; })[0]; if (o) dangLam.push({ ma: s.ma, ten: s.ten, tu: hm(o.vao.luc), phut: o.phutDaLam }); });
    return {
      cfg: { wifiTen: c.wifiTen, ips: c.ips, khoa: c.khoa },
      staff: staff.map(function (s) { return { ma: s.ma, ten: s.ten, coMay: !!c.thietBi[s.ma] }; }),
      ngay: ngay, tong: Object.keys(tong).map(function (k) { return tong[k]; }).sort(function (x, y) { return y.gio - x.gio; }),
      chan: rows.filter(function (r) { return r.loai === 'CHAN'; }).sort(function (x, y) { return y.luc - x.luc; }).slice(0, 50)
        .map(function (r) { var d = new Date(r.luc); return { ten: r.ten, luc: THU[d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1) + ' ' + hm(r.luc), ip: r.ip }; }),
      dangLam: dangLam, tongGio: r2(ngay.reduce(function (t, n) { return t + n.gio; }, 0))
    };
  }

  return {
    ccStatus: status,
    ccPunch: punch,
    ccAdmin: admin,
    ccSaveCfg: function (a) {
      io.auth(a.token);
      return io.lock(function () {
        var c = cfg(), ips = [];
        (a.ips || []).map(normIp).forEach(function (x) {
          if (!/^[0-9a-f.:]{3,45}$/.test(x)) throw err('Địa chỉ IP không hợp lệ: ' + x);
          if (ips.indexOf(x) < 0) ips.push(x);
        });
        var ten = String(a.wifiTen || '').trim().slice(0, 60) || WIFI_MAC_DINH;
        io.saveCfg({ wifiTen: ten, ips: ips, khoa: a.khoa !== false, thietBi: c.thietBi });
        return { wifiTen: ten, ips: ips, khoa: a.khoa !== false };
      });
    },
    ccResetDevice: function (a) {
      io.auth(a.token);
      return io.lock(function () { var c = cfg(); delete c.thietBi[a.ma]; io.saveCfg(c); return { ok: true }; });
    },
    ccAddManual: function (a) {
      io.auth(a.token);
      return io.lock(function () {
        var s = staffOf(a.ma), d = fromKey(a.ngay), t = /^(\d{1,2}):(\d{2})$/.exec(String(a.gio || ''));
        if (!t || +t[1] > 23 || +t[2] > 59) throw err('Giờ không hợp lệ, ví dụ 7:30.');
        if (a.loai !== 'VAO' && a.loai !== 'RA') throw err('Chọn Vào hoặc Ra.');
        var luc = new Date(d.getFullYear(), d.getMonth(), d.getDate(), +t[1], +t[2]).getTime();
        io.append({ id: io.newId(), luc: luc, ma: s.ma, ten: s.ten, loai: a.loai, ip: 'tay', hopLe: true, thietBi: '', ghiChu: ('Quản lý thêm ' + (a.ghiChu || '')).trim() });
        return { ok: true };
      });
    },
    ccVoid: function (a) {
      io.auth(a.token);
      return io.lock(function () { io.setHuy(a.id, !!a.huy); return { ok: true }; });
    }
  };
}
