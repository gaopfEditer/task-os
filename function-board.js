/* global window */
(function () {
  var EXEC_LABEL = { idle: '未启动', running: '执行中', blocked: '阻塞', done: '已交付' };

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function roleName(data, roleId) {
    var r = (data.roles || []).find(function (x) { return x.id === roleId; });
    return r ? r.name : roleId;
  }

  function businessName(data, bid) {
    if (!bid) return '通用';
    var b = (data.businesses || []).find(function (x) { return x.id === bid; });
    return b ? b.name : bid;
  }

  function log(data, action, item, detail) {
    if (!data.logs) data.logs = [];
    data.logs.unshift({ at: new Date().toISOString(), action: action, item: item, detail: detail || '' });
  }

  function FunctionBoard(opts) {
    this.opts = opts;
    this.root = opts.host;
    this.ui = { selected: opts.defaultRole || 'ops', view: 'role', filter: 'all', q: '', biz: '' };
    this._bound = false;
  }

  FunctionBoard.prototype.sync = function () {
    if (!this.root) return;
    var o = this.opts;
    var st = o.getShellState ? o.getShellState() : {};
    if (st.loading) {
      this.root.innerHTML = '<div class="fboard-root"><div class="fb-empty">正在读取看板…</div></div>';
      return;
    }
    if (st.error) {
      this.root.innerHTML = '<div class="fboard-root"><div class="msg error">读取失败：' + esc(st.error) + '</div></div>';
      return;
    }
    if (st.missing) {
      this.root.innerHTML = '<div class="fboard-root"><div class="fb-empty">' + esc(st.missingText || '尚无看板 JSON') + '</div></div>';
      return;
    }
    var data = o.getData();
    if (!data) {
      this.root.innerHTML = '<div class="fboard-root"><div class="fb-empty">（空）</div></div>';
      return;
    }
  if (this.ui.selected !== 'all' && this.ui.selected !== 'archived' && this.ui.selected !== 'history') {
      var exists = (data.roles || []).some(function (r) { return r.id === this.ui.selected; }, this);
      if (!exists && (data.roles || []).length) this.ui.selected = data.roles[0].id;
    }
    this.root.innerHTML = this._html(data, st);
    if (!this._bound) {
      this._bound = true;
      this.root.addEventListener('click', this._onClick.bind(this));
      this.root.addEventListener('change', this._onChange.bind(this));
      this.root.addEventListener('input', this._onInput.bind(this));
      this.root.addEventListener('submit', this._onSubmit.bind(this));
    }
    this._bindFileImport();
  };

  FunctionBoard.prototype._bindFileImport = function () {
    var inst = this;
    var fi = this.root.querySelector('[data-fb-file]');
    if (!fi || fi._fbKey === inst._key) return;
    fi._fbKey = inst._key;
    fi.addEventListener('change', function (e) {
      var f = e.target.files[0];
      if (!f) return;
      f.text().then(function (text) {
        try {
          var p = JSON.parse(text);
          if (!Array.isArray(p.roles) || !Array.isArray(p.duties)) throw new Error('JSON 格式不正确');
          if (!confirm('导入会替换当前看板中的 roles/duties/logs，建议先导出备份。继续？')) return;
          var data = inst._data();
          if (!data) return;
          data.roles = p.roles;
          data.duties = p.duties;
          data.logs = Array.isArray(p.logs) ? p.logs : [];
          if (p.businesses) data.businesses = p.businesses;
          if (p.opportunities) data.opportunities = p.opportunities;
          if (inst.opts.onDirty) inst.opts.onDirty();
          inst.ui.view = 'all';
          inst.sync();
          alert('导入成功');
        } catch (err) {
          alert('导入失败：' + err.message);
        }
        e.target.value = '';
      });
    });
  };

  FunctionBoard.prototype._html = function (data, st) {
    var o = this.opts;
    var ui = this.ui;
    var active = (data.duties || []).filter(function (d) { return !d.archived; });
    var h = '<div class="fboard-root">';
    if (st.flash) h += '<div class="msg ' + esc(st.flash.kind) + '">' + st.flash.text + '</div>';
    if (st.dirty) h += '<div class="msg info">有未保存的改动，点上方「保存到 GitHub」。</div>';
    h += '<header class="fb-head fb-between"><div><h2>' + esc(o.title) + '</h2><div class="fb-muted">' + esc(o.subtitle || '') + '</div></div>';
    h += '<div class="fb-actions">';
    h += '<button type="button" class="fb-btn" data-fb="export">导出 JSON</button>';
    h += '<button type="button" class="fb-btn" data-fb="import">导入 JSON</button>';
    if (o.allowAddDuty !== false) h += '<button type="button" class="fb-btn fb-primary" data-fb="add-top">＋ 新增职能</button>';
    h += '</div></header>';
    var statRows = o.statRows || [['角色', (data.roles || []).length], ['职能', active.length], ['重点', active.filter(function (d) { return d.priority === '重点'; }).length], ['暂缓/待尝试', active.filter(function (d) { return d.status !== '进行中'; }).length]];
    h += '<div class="fb-stats">';
    statRows.forEach(function (a) { h += '<div class="fb-stat fb-panel"><small class="fb-muted">' + esc(a[0]) + '</small><strong>' + a[1] + '</strong></div>'; });
    h += '</div>';
    if (o.showBusinesses && (data.businesses || []).length) {
      h += '<div class="fb-bizbar fb-muted"><span>业务筛选</span>';
      h += '<button type="button" class="fb-chip' + (ui.biz === '' ? ' fb-on' : '') + '" data-fb-biz="">全部</button>';
      (data.businesses || []).forEach(function (b) {
        h += '<button type="button" class="fb-chip' + (ui.biz === b.id ? ' fb-on' : '') + '" data-fb-biz="' + esc(b.id) + '">' + esc(b.name) + '</button>';
      });
      h += '</div>';
    }
    h += '<div class="fb-layout">';
    h += '<aside class="fb-panel fb-sidebar"><b>业务角色</b><div>';
    (data.roles || []).forEach(function (r) {
      var n = active.filter(function (d) { return d.role_id === r.id; }).length;
      var bot = o.roleBotName ? o.roleBotName(data, r.id) : '';
      h += '<button type="button" class="fb-role' + (ui.view === 'role' && ui.selected === r.id ? ' fb-on' : '') + '" data-fb-role="' + esc(r.id) + '">● ' + esc(r.name);
      if (bot) h += ' <small>' + esc(bot) + '</small>';
      h += '<small>' + n + ' 项职能</small></button>';
    });
    h += '</div><div class="fb-sidefoot">';
    if (o.allowRoleEdit) h += '<button type="button" class="fb-btn" data-fb="add-role">＋ 添加角色</button>';
    h += '<button type="button" class="fb-role' + (ui.view === 'all' ? ' fb-on' : '') + '" data-fb-view="all">▦ 全部职能</button>';
    h += '<button type="button" class="fb-role' + (ui.view === 'archived' ? ' fb-on' : '') + '" data-fb-view="archived">▤ 已归档职能</button>';
    h += '<button type="button" class="fb-role' + (ui.view === 'history' ? ' fb-on' : '') + '" data-fb-view="history">◷ 调整历史 <small>' + (data.logs || []).length + '</small></button>';
    h += '</div></aside><main>';
    if (ui.view === 'history') {
      h += '<section class="fb-panel fb-history">';
      if (!(data.logs || []).length) h += '<div class="fb-empty">暂无调整记录</div>';
      else (data.logs || []).forEach(function (l) {
        h += '<div class="fb-log"><div class="fb-loghead"><b>' + esc(l.action) + ' · ' + esc(l.item) + '</b><small class="fb-muted">' + esc(new Date(l.at).toLocaleString('zh-CN', { hour12: false })) + '</small></div>';
        if (l.detail) h += '<p>' + esc(l.detail) + '</p></div>';
        else h += '</div>';
      });
      h += '</section></main></div>';
      h += this._modals(data);
      h += '</div>';
      return h;
    }
    var title = ui.view === 'all' ? '全部职能' : ui.view === 'archived' ? '已归档职能' : roleName(data, ui.selected);
    var selRole = (data.roles || []).find(function (r) { return r.id === ui.selected; }) || {};
    var desc = ui.view === 'role' ? (selRole.desc || selRole.goal || '') : '跨角色查看与调整职能';
    h += '<section class="fb-panel fb-toolbar"><div class="fb-between"><div><h3>' + esc(title) + '</h3><p class="fb-muted">' + esc(desc) + '</p></div>';
    h += '<div class="fb-actions"><input class="fb-search" data-fb-search placeholder="搜索职能…" value="' + esc(ui.q) + '">';
    if (o.allowAddDuty !== false) h += '<button type="button" class="fb-btn fb-primary" data-fb="add">＋ 添加职能</button>';
    h += '</div></div><div class="fb-filters">';
    var filters = o.filters || ['all', '重点', '进行中', '待尝试', '暂缓'];
    filters.forEach(function (f) {
      var lbl = f === 'all' ? '全部' : f;
      h += '<button type="button" class="fb-chip' + (ui.filter === f ? ' fb-on' : '') + '" data-fb-filter="' + esc(f) + '">' + (f === '重点' ? '★ ' : '') + esc(lbl) + '</button>';
    });
    h += '</div></section>';
    if (o.showOpportunities && (data.opportunities || []).length) {
      var ops = data.opportunities.slice();
      if (ui.biz) ops = ops.filter(function (x) { return x.business_id === ui.biz; });
      h += '<details class="fb-panel fb-opps" open><summary><b>机会池</b>（' + ops.length + '）</summary><ul style="margin:8px 0 0;padding-left:18px">';
      ops.forEach(function (op) {
        h += '<li>' + esc(op.title) + ' · ' + esc(businessName(data, op.business_id)) + ' · ' + esc(op.kind || '') + ' · ' + esc(op.status || '') + '</li>';
      });
      h += '</ul></details>';
    }
    var list = ui.view === 'archived' ? (data.duties || []).filter(function (d) { return d.archived; }) : ui.view === 'all' ? active : active.filter(function (d) { return d.role_id === ui.selected; });
    var q = ui.q.toLowerCase().trim();
    if (q) list = list.filter(function (d) {
      var blob = (d.name + d.description + (d.agent || '') + roleName(data, d.role_id)).toLowerCase();
      return blob.indexOf(q) >= 0;
    });
    if (ui.filter === '重点') list = list.filter(function (d) { return d.priority === '重点'; });
    else if (ui.filter !== 'all') list = list.filter(function (d) { return d.status === ui.filter; });
    if (ui.biz) list = list.filter(function (d) { return !d.business_id || d.business_id === ui.biz; });
    if (!list.length) h += '<div class="fb-panel fb-empty">没有符合条件的职能。</div>';
    else {
      var groups = {};
      list.forEach(function (d) { (groups[d.role_id] = groups[d.role_id] || []).push(d); });
      Object.keys(groups).forEach(function (rid) {
        var ds = groups[rid];
        h += '<section class="fb-group"><div class="fb-between"><b>' + esc(roleName(data, rid)) + '</b><small class="fb-muted">' + ds.length + ' 项</small></div><div class="fb-grid">';
        ds.forEach(function (d) {
          var rb = o.roleBotName ? o.roleBotName(data, d.role_id) : '';
          h += '<article class="fb-card fb-panel' + (d.priority === '重点' ? ' fb-focus' : '') + '"><div class="fb-cardhead fb-between"><div><h4>' + esc(d.name) + '</h4>';
          h += '<span class="fb-badge' + (d.priority === '重点' ? ' fb-focus' : '') + '">' + (d.priority === '重点' ? '★ 重点' : '普通') + '</span>';
          h += '<span class="fb-badge">' + esc(d.status) + '</span>';
          if (ui.view !== 'role') h += '<span class="fb-badge">' + esc(roleName(data, d.role_id)) + '</span>';
          if (rb) h += '<span class="fb-badge">' + esc(rb) + '</span>';
          if (d.business_id) h += '<span class="fb-badge">' + esc(businessName(data, d.business_id)) + '</span>';
          if (o.execMode) h += '<span class="fb-badge fb-exec-' + esc(d.exec_state || 'idle') + '">' + esc(EXEC_LABEL[d.exec_state] || EXEC_LABEL.idle) + '</span>';
          h += '</div><button type="button" class="fb-mini" data-fb-edit="' + esc(d.id) + '">编辑</button></div>';
          h += '<p class="fb-desc">' + esc(d.description) + '</p>';
          if (d.agent || d.collaborators) {
            h += '<div>' + (d.agent ? '<span class="fb-badge">执行：' + esc(d.agent) + '</span>' : '') + (d.collaborators ? '<span class="fb-badge">协作：' + esc(d.collaborators) + '</span>' : '') + '</div>';
          }
          h += '<div class="fb-cardfoot">';
          h += '<button type="button" class="fb-mini" data-fb-focus="' + esc(d.id) + '">' + (d.priority === '重点' ? '取消重点' : '★ 标记重点') + '</button>';
          var statusOpts = o.statusOptions || ['进行中', '待尝试', '暂缓'];
          h += '<select class="fb-status" data-fb-status="' + esc(d.id) + '">';
          statusOpts.forEach(function (s) { h += '<option' + (d.status === s ? ' selected' : '') + '>' + esc(s) + '</option>'; });
          h += '</select>';
          if (o.execMode) {
            h += '<select class="fb-status" data-fb-exec="' + esc(d.id) + '">';
            Object.keys(EXEC_LABEL).forEach(function (k) {
              h += '<option value="' + k + '"' + ((d.exec_state || 'idle') === k ? ' selected' : '') + '>' + esc(EXEC_LABEL[k]) + '</option>';
            });
            h += '</select>';
          }
          if (!d.archived && ui.view !== 'archived') h += '<button type="button" class="fb-mini" data-fb-archive="' + esc(d.id) + '">归档</button>';
          else if (d.archived) h += '<button type="button" class="fb-mini" data-fb-restore="' + esc(d.id) + '">恢复</button>';
          h += '</div>';
          if (o.execMode) {
            h += '<textarea class="fb-exec-note" data-fb-note="' + esc(d.id) + '" placeholder="Bot 回写：进展、阻塞、产出路径…">' + esc(d.exec_note || '') + '</textarea>';
            if (d.exec_at) h += '<p class="fb-muted" style="margin:4px 0 0;font-size:11px">执行更新 ' + esc(new Date(d.exec_at).toLocaleString('zh-CN', { hour12: false })) + '</p>';
          }
          h += '</article>';
        });
        h += '</div></section>';
      });
    }
    h += '</main></div>';
    h += this._modals(data);
    h += '</div>';
    return h;
  };

  FunctionBoard.prototype._modals = function (data) {
    var o = this.opts;
    var statusOpts = (o.statusOptions || ['进行中', '待尝试', '暂缓']).map(function (s) { return '<option>' + esc(s) + '</option>'; }).join('');
    var h = '<motion></motion>'; // placeholder stripped — modals below
    h = '';
    h += '<div class="fb-modal" data-fb-modal="duty"><div class="fb-modalbox"><div class="fb-between"><b data-fb-modal-title>编辑职能</b><button type="button" class="fb-btn" data-fb-close>关闭</button></div>';
    h += '<form data-fb-form="duty"><input type="hidden" data-fb-fid><div class="fb-formrow"><label>职能名称</label><input class="fb-field" data-fb-fname required></div>';
    h += '<div class="fb-formrow"><label>所属角色</label><select class="fb-field" data-fb-frole></select></div>';
    if (o.showBusinesses) h += '<div class="fb-formrow"><label>业务（可选）</label><select class="fb-field" data-fb-fbiz><option value="">通用</option></select></div>';
    h += '<div class="fb-formrow"><label>具体工作 / 预期产出</label><textarea class="fb-field" data-fb-fdesc rows="3"></textarea></div>';
    h += '<div class="fb-two"><div class="fb-formrow"><label>状态</label><select class="fb-field" data-fb-fstatus>' + statusOpts + '</select></div>';
    h += '<div class="fb-formrow"><label>优先级</label><select class="fb-field" data-fb-fprio><option>普通</option><option>重点</option></select></div></div>';
    h += '<div class="fb-two"><div class="fb-formrow"><label>主执行 Bot / 人工</label><input class="fb-field" data-fb-fagent placeholder="例如 base·币圈运营"></div>';
    h += '<div class="fb-formrow"><label>协作者</label><input class="fb-field" data-fb-fcollab></div></div>';
    if (o.execMode) {
      h += '<div class="fb-formrow"><label>执行状态</label><select class="fb-field" data-fb-fexec>';
      Object.keys(EXEC_LABEL).forEach(function (k) { h += '<option value="' + k + '">' + esc(EXEC_LABEL[k]) + '</option>'; });
      h += '</select></div><div class="fb-formrow"><label>执行备注</label><textarea class="fb-field" data-fb-fnote rows="2"></textarea></div>';
    }
    h += '<div class="fb-formrow"><label>调整原因 / 备注</label><input class="fb-field" data-fb-freason></div>';
    h += '<div class="fb-modalfoot"><button type="button" class="fb-btn" data-fb-close>取消</button><button type="submit" class="fb-btn fb-primary">保存</button></div></form></div></div>';
    if (o.allowRoleEdit) {
      h += '<div class="fb-modal" data-fb-modal="role"><div class="fb-modalbox"><div class="fb-between"><b>添加业务角色</b><button type="button" class="fb-btn" data-fb-rclose>关闭</button></div>';
      h += '<form data-fb-form="role"><div class="fb-formrow"><label>角色名称</label><input class="fb-field" data-fb-rname required></div>';
      h += '<div class="fb-formrow"><label>角色使命</label><textarea class="fb-field" data-fb-rdesc rows="2"></textarea></div>';
      h += '<div class="fb-modalfoot"><button type="button" class="fb-btn" data-fb-rclose>取消</button><button type="submit" class="fb-btn fb-primary">创建</button></div></form></div></div>';
    }
    h += '<input type="file" accept=".json" hidden data-fb-file>';
    return h;
  };

  FunctionBoard.prototype._data = function () { return this.opts.getData(); };

  FunctionBoard.prototype._dirty = function () {
    if (this.opts.onDirty) this.opts.onDirty();
    this.sync();
  };

  FunctionBoard.prototype._findDuty = function (id) {
    var data = this._data();
    return data && (data.duties || []).find(function (x) { return x.id === id; });
  };

  FunctionBoard.prototype._openDuty = function (id) {
    var data = this._data();
    var o = this.opts;
    var modal = this.root.querySelector('[data-fb-modal="duty"]');
    if (!modal) return;
    var d = id ? this._findDuty(id) : null;
    modal.querySelector('[data-fb-modal-title]').textContent = d ? '编辑职能' : '新增职能';
    modal.querySelector('[data-fb-fid]').value = d ? d.id : '';
    modal.querySelector('[data-fb-fname]').value = d ? d.name : '';
    modal.querySelector('[data-fb-fdesc]').value = d ? d.description : '';
    modal.querySelector('[data-fb-fstatus]').value = d ? d.status : '待尝试';
    modal.querySelector('[data-fb-fprio]').value = d ? d.priority : '普通';
    modal.querySelector('[data-fb-fagent]').value = d && d.agent ? d.agent : '';
    modal.querySelector('[data-fb-fcollab]').value = d && d.collaborators ? d.collaborators : '';
    modal.querySelector('[data-fb-freason]').value = '';
    if (o.execMode) {
      modal.querySelector('[data-fb-fexec]').value = d && d.exec_state ? d.exec_state : 'idle';
      modal.querySelector('[data-fb-fnote]').value = d && d.exec_note ? d.exec_note : '';
    }
    var sel = modal.querySelector('[data-fb-frole]');
    sel.innerHTML = (data.roles || []).map(function (r) {
      var rid = d ? d.role_id : this.ui.selected;
      return '<option value="' + esc(r.id) + '"' + (rid === r.id ? ' selected' : '') + '>' + esc(r.name) + '</option>';
    }, this).join('');
    if (o.showBusinesses) {
      var bsel = modal.querySelector('[data-fb-fbiz]');
      bsel.innerHTML = '<option value="">通用</option>' + (data.businesses || []).map(function (b) {
        var bid = d && d.business_id ? d.business_id : '';
        return '<option value="' + esc(b.id) + '"' + (bid === b.id ? ' selected' : '') + '>' + esc(b.name) + '</option>';
      }).join('');
    }
    modal.classList.add('fb-show');
  };

  FunctionBoard.prototype._onClick = function (ev) {
    var t = ev.target.closest('[data-fb],[data-fb-role],[data-fb-view],[data-fb-filter],[data-fb-biz],[data-fb-edit],[data-fb-focus],[data-fb-archive],[data-fb-restore],[data-fb-close],[data-fb-rclose]');
    if (!t) return;
    var data = this._data();
    if (!data) return;
    if (t.hasAttribute('data-fb-close')) {
      this.root.querySelectorAll('.fb-modal').forEach(function (m) { m.classList.remove('fb-show'); });
      return;
    }
    if (t.hasAttribute('data-fb-rclose')) {
      var rm = this.root.querySelector('[data-fb-modal="role"]');
      if (rm) rm.classList.remove('fb-show');
      return;
    }
    if (t.getAttribute('data-fb') === 'export') {
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (this.opts.exportName || 'board') + '.json';
      a.click();
      URL.revokeObjectURL(a.href);
      return;
    }
    if (t.getAttribute('data-fb') === 'import') {
      var fi = this.root.querySelector('[data-fb-file]');
      if (fi) fi.click();
      return;
    }
    if (t.getAttribute('data-fb') === 'add' || t.getAttribute('data-fb') === 'add-top') {
      this._openDuty(null);
      return;
    }
    if (t.getAttribute('data-fb') === 'add-role') {
      var rm2 = this.root.querySelector('[data-fb-modal="role"]');
      if (rm2) rm2.classList.add('fb-show');
      return;
    }
    if (t.hasAttribute('data-fb-role')) {
      this.ui.selected = t.getAttribute('data-fb-role');
      this.ui.view = 'role';
      this.sync();
      return;
    }
    if (t.hasAttribute('data-fb-view')) {
      this.ui.view = t.getAttribute('data-fb-view');
      this.sync();
      return;
    }
    if (t.hasAttribute('data-fb-filter')) {
      this.ui.filter = t.getAttribute('data-fb-filter');
      this.sync();
      return;
    }
    if (t.hasAttribute('data-fb-biz')) {
      this.ui.biz = t.getAttribute('data-fb-biz');
      this.sync();
      return;
    }
    if (t.hasAttribute('data-fb-edit')) {
      this._openDuty(t.getAttribute('data-fb-edit'));
      return;
    }
    if (t.hasAttribute('data-fb-focus')) {
      var d = this._findDuty(t.getAttribute('data-fb-focus'));
      if (!d) return;
      d.priority = d.priority === '重点' ? '普通' : '重点';
      log(data, d.priority === '重点' ? '标记重点' : '取消重点', d.name, roleName(data, d.role_id));
      d.exec_at = new Date().toISOString();
      this._dirty();
      return;
    }
    if (t.hasAttribute('data-fb-archive')) {
      var da = this._findDuty(t.getAttribute('data-fb-archive'));
      if (!da) return;
      da.archived = true;
      log(data, '归档职能', da.name, roleName(data, da.role_id));
      this._dirty();
      return;
    }
    if (t.hasAttribute('data-fb-restore')) {
      var dr = this._findDuty(t.getAttribute('data-fb-restore'));
      if (!dr) return;
      dr.archived = false;
      log(data, '恢复职能', dr.name, roleName(data, dr.role_id));
      this._dirty();
      return;
    }
  };

  FunctionBoard.prototype._onChange = function (ev) {
    var data = this._data();
    if (!data) return;
    var sel = ev.target;
    if (sel.hasAttribute('data-fb-status')) {
      var d = this._findDuty(sel.getAttribute('data-fb-status'));
      if (!d || d.status === sel.value) return;
      var old = d.status;
      d.status = sel.value;
      log(data, '调整状态', d.name, old + ' → ' + d.status);
      d.exec_at = new Date().toISOString();
      this._dirty();
      return;
    }
    if (sel.hasAttribute('data-fb-exec')) {
      var d2 = this._findDuty(sel.getAttribute('data-fb-exec'));
      if (!d2 || (d2.exec_state || 'idle') === sel.value) return;
      d2.exec_state = sel.value;
      d2.exec_at = new Date().toISOString();
      this._dirty();
    }
  };

  FunctionBoard.prototype._onInput = function (ev) {
    var ta = ev.target;
    if (!ta.hasAttribute('data-fb-search')) {
      if (ta.hasAttribute('data-fb-note')) {
        var d = this._findDuty(ta.getAttribute('data-fb-note'));
        if (d && d.exec_note !== ta.value) {
          d.exec_note = ta.value;
          d.exec_at = new Date().toISOString();
          this._dirty();
        }
      }
      return;
    }
    this.ui.q = ta.value;
    this.sync();
    var inp = this.root.querySelector('[data-fb-search]');
    if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
  };

  FunctionBoard.prototype._onSubmit = function (ev) {
    var form = ev.target;
    if (!form.hasAttribute('data-fb-form')) return;
    ev.preventDefault();
    var data = this._data();
    if (!data) return;
    if (form.getAttribute('data-fb-form') === 'role' && this.opts.allowRoleEdit) {
      var name = form.querySelector('[data-fb-rname]').value.trim();
      var desc = form.querySelector('[data-fb-rdesc]').value.trim();
      if (!name) return;
      var r = { id: 'r' + uid(), name: name, desc: desc };
      data.roles.push(r);
      log(data, '新增角色', r.name, '');
      this.ui.selected = r.id;
      this.ui.view = 'role';
      form.reset();
      this.root.querySelector('[data-fb-modal="role"]').classList.remove('fb-show');
      this._dirty();
      return;
    }
    if (form.getAttribute('data-fb-form') === 'duty') {
      var id = form.querySelector('[data-fb-fid]').value;
      var d = id ? this._findDuty(id) : null;
      var reason = form.querySelector('[data-fb-freason]').value.trim();
      var patch = {
        role_id: form.querySelector('[data-fb-frole]').value,
        name: form.querySelector('[data-fb-fname]').value.trim(),
        description: form.querySelector('[data-fb-fdesc]').value.trim(),
        status: form.querySelector('[data-fb-fstatus]').value,
        priority: form.querySelector('[data-fb-fprio]').value,
        agent: form.querySelector('[data-fb-fagent]').value.trim(),
        collaborators: form.querySelector('[data-fb-fcollab]').value.trim(),
      };
      if (this.opts.showBusinesses) {
        var bv = form.querySelector('[data-fb-fbiz]').value;
        patch.business_id = bv || null;
      }
      if (this.opts.execMode) {
        patch.exec_state = form.querySelector('[data-fb-fexec]').value;
        patch.exec_note = form.querySelector('[data-fb-fnote]').value.trim();
      }
      if (!patch.name) return;
      if (d) {
        Object.assign(d, patch);
        log(data, '编辑职能', d.name, reason || '更新职能配置');
      } else {
        d = Object.assign({ id: 'd' + uid(), archived: false, exec_state: 'idle', exec_note: '' }, patch);
        if (!data.duties) data.duties = [];
        data.duties.push(d);
        log(data, '新增职能', d.name, reason || roleName(data, d.role_id));
      }
      d.exec_at = new Date().toISOString();
      this.ui.selected = d.role_id;
      this.ui.view = 'role';
      this.root.querySelector('[data-fb-modal="duty"]').classList.remove('fb-show');
      this._dirty();
    }
  };

  var boards = {};

  window.TaskFunctionBoard = {
    mount: function (key, opts) {
      boards[key] = boards[key] || new FunctionBoard(opts);
      boards[key].opts = opts;
      boards[key].root = opts.host;
      boards[key]._key = key;
      boards[key].sync();
      return boards[key];
    },
    get: function (key) { return boards[key]; },
  };
})();