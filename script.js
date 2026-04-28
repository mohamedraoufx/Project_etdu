/* ============================================================
   نظام إدارة المعهد التعليمي - معهد النور
   script.js - الكود الرئيسي
   ============================================================ */

// ========== INITIAL DATA SEED ==========
const SEED = {
  users: [
    { id: 'u1', username: 'admin', password: 'admin123', role: 'admin', name: 'أحمد المدير', email: 'admin@alnoor.edu' },
    { id: 'u2', username: 'teacher1', password: 'teach123', role: 'teacher', name: 'أستاذ محمد علي', email: 'teacher1@alnoor.edu', subjects: ['s1','s2'], department: 'd1' },
    { id: 'u3', username: 'teacher2', password: 'teach123', role: 'teacher', name: 'أستاذة فاطمة حسن', email: 'teacher2@alnoor.edu', subjects: ['s3','s4'], department: 'd1' },
    { id: 'u4', username: 'student1', password: 'stud123', role: 'student', name: 'أحمد يوسف', email: 'student1@alnoor.edu', department: 'd1', year: 2 },
    { id: 'u5', username: 'student2', password: 'stud123', role: 'student', name: 'سارة أمين', email: 'student2@alnoor.edu', department: 'd1', year: 2 },
    { id: 'u6', username: 'student3', password: 'stud123', role: 'student', name: 'خالد سعيد', email: 'student3@alnoor.edu', department: 'd2', year: 1 },
  ],
  departments: [
    { id: 'd1', name: 'قسم علوم الحاسوب', code: 'CS' },
    { id: 'd2', name: 'قسم الرياضيات', code: 'MATH' },
  ],
  subjects: [
    { id: 's1', name: 'برمجة الحاسوب', code: 'CS101', teacherId: 'u2', department: 'd1', credits: 3 },
    { id: 's2', name: 'قواعد البيانات', code: 'CS102', teacherId: 'u2', department: 'd1', credits: 3 },
    { id: 's3', name: 'الرياضيات التطبيقية', code: 'MATH101', teacherId: 'u3', department: 'd2', credits: 3 },
    { id: 's4', name: 'الإحصاء والتحليل', code: 'MATH102', teacherId: 'u3', department: 'd1', credits: 2 },
  ],
  grades: [
    { id: 'g1', studentId: 'u4', subjectId: 's1', midterm: 18, final: 35, project: 15, notes: 'أداء ممتاز' },
    { id: 'g2', studentId: 'u4', subjectId: 's2', midterm: 16, final: 30, project: 13, notes: '' },
    { id: 'g3', studentId: 'u4', subjectId: 's3', midterm: 14, final: 28, project: 12, notes: 'يحتاج إلى مراجعة' },
    { id: 'g4', studentId: 'u5', subjectId: 's1', midterm: 17, final: 33, project: 14, notes: '' },
    { id: 'g5', studentId: 'u5', subjectId: 's2', midterm: 19, final: 38, project: 16, notes: 'ممتازة' },
    { id: 'g6', studentId: 'u6', subjectId: 's3', midterm: 12, final: 25, project: 10, notes: '' },
  ],
  announcements: [
    { id: 'a1', title: 'بداية الفصل الدراسي الجديد', content: 'نرحب بالطلاب في بداية الفصل الدراسي الربيعي. نتمنى لكم التوفيق والنجاح.', authorId: 'u1', date: '2025-02-01', role: 'all' },
    { id: 'a2', title: 'مواعيد الاختبارات النصفية', content: 'تُعقد الاختبارات النصفية في الفترة من 15 إلى 20 فبراير. يرجى الاستعداد الجيد.', authorId: 'u2', date: '2025-02-10', role: 'student' },
  ],
  schedule: [
    { id: 'sch1', subjectId: 's1', day: 'الأحد', time: '08:00', room: 'A101' },
    { id: 'sch2', subjectId: 's2', day: 'الاثنين', time: '10:00', room: 'A102' },
    { id: 'sch3', subjectId: 's3', day: 'الثلاثاء', time: '09:00', room: 'B201' },
    { id: 'sch4', subjectId: 's4', day: 'الأربعاء', time: '11:00', room: 'B202' },
    { id: 'sch5', subjectId: 's1', day: 'الخميس', time: '08:00', room: 'A101' },
  ],
  notifications: []
};

// ========== STORAGE HELPERS ==========
function loadData(key) {
  try {
    const raw = localStorage.getItem('institute_' + key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveData(key, data) {
  localStorage.setItem('institute_' + key, JSON.stringify(data));
}
function initData() {
  if (!loadData('initialized')) {
    Object.keys(SEED).forEach(k => saveData(k, SEED[k]));
    saveData('initialized', true);
  }
}
function getAll(key) { return loadData(key) || []; }
function saveAll(key, arr) { saveData(key, arr); }
function genId(prefix) { return prefix + Date.now() + Math.floor(Math.random()*1000); }

// ========== SESSION ==========
let currentUser = null;
function getSession() { return loadData('session'); }
function setSession(user) { saveData('session', user); currentUser = user; }
function clearSession() { localStorage.removeItem('institute_session'); currentUser = null; }

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  initData();
  const sess = getSession();
  if (sess) {
    currentUser = sess;
    showApp();
  } else {
    showPage('login-page');
  }
  createToastContainer();
});

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ========== LOGIN ==========
function login() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const err = document.getElementById('login-error');
  if (!username || !password) { showError('يرجى ملء جميع الحقول'); return; }
  const users = getAll('users');
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) { err.classList.remove('hidden'); return; }
  err.classList.add('hidden');
  setSession(user);
  showApp();
}
function logout() {
  clearSession();
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  showPage('login-page');
  document.getElementById('app-page').classList.remove('active');
  closeSidebar();
}
function fillDemo(u, p) {
  document.getElementById('login-username').value = u;
  document.getElementById('login-password').value = p;
}
function togglePassword() {
  const inp = document.getElementById('login-password');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('login-page').classList.contains('active')) login();
});

// ========== SHOW APP ==========
function showApp() {
  showPage('app-page');
  document.getElementById('app-page').classList.add('active');
  renderSidebar();
  renderTopbar();
  renderNotifications();
  loadDefaultPanel();
}

// ========== SIDEBAR ==========
const NAV = {
  admin: [
    { section: 'لوحة التحكم', items: [
      { id: 'dashboard', icon: '📊', label: 'الرئيسية' },
    ]},
    { section: 'إدارة المستخدمين', items: [
      { id: 'admin-students', icon: '👨‍🎓', label: 'إدارة الطلاب' },
      { id: 'admin-teachers', icon: '👨‍🏫', label: 'إدارة الأساتذة' },
    ]},
    { section: 'المحتوى الأكاديمي', items: [
      { id: 'admin-departments', icon: '🏛️', label: 'الأقسام' },
      { id: 'admin-subjects', icon: '📚', label: 'المواد الدراسية' },
      { id: 'admin-grades', icon: '📋', label: 'الدرجات' },
    ]},
    { section: 'التواصل', items: [
      { id: 'admin-announcements', icon: '📢', label: 'الإعلانات' },
    ]},
    { section: 'الإعدادات', items: [
      { id: 'change-password', icon: '🔑', label: 'تغيير كلمة المرور' },
    ]},
  ],
  teacher: [
    { section: 'لوحة التحكم', items: [
      { id: 'dashboard', icon: '📊', label: 'الرئيسية' },
    ]},
    { section: 'الأكاديمي', items: [
      { id: 'teacher-students', icon: '👨‍🎓', label: 'طلابي' },
      { id: 'teacher-grades', icon: '📋', label: 'إدارة الدرجات' },
      { id: 'teacher-subjects', icon: '📚', label: 'موادي' },
    ]},
    { section: 'التواصل', items: [
      { id: 'teacher-announcements', icon: '📢', label: 'الإعلانات' },
    ]},
    { section: 'الإعدادات', items: [
      { id: 'change-password', icon: '🔑', label: 'تغيير كلمة المرور' },
    ]},
  ],
  student: [
    { section: 'لوحة التحكم', items: [
      { id: 'dashboard', icon: '📊', label: 'الرئيسية' },
    ]},
    { section: 'الأكاديمي', items: [
      { id: 'student-profile', icon: '👤', label: 'ملفي الشخصي' },
      { id: 'student-grades', icon: '📋', label: 'درجاتي' },
      { id: 'student-subjects', icon: '📚', label: 'موادي' },
      { id: 'student-schedule', icon: '🗓️', label: 'جدول الدروس' },
    ]},
    { section: 'التواصل', items: [
      { id: 'student-announcements', icon: '📢', label: 'الإعلانات' },
    ]},
    { section: 'الإعدادات', items: [
      { id: 'change-password', icon: '🔑', label: 'تغيير كلمة المرور' },
    ]},
  ]
};

function renderSidebar() {
  const role = currentUser.role;
  document.getElementById('sidebar-role-label').textContent = { admin: 'النظام الإداري', teacher: 'بوابة الأساتذة', student: 'بوابة الطلاب' }[role];
  document.getElementById('sidebar-name').textContent = currentUser.name;
  document.getElementById('sidebar-avatar').textContent = { admin: '👑', teacher: '👨‍🏫', student: '👨‍🎓' }[role];
  const badge = document.getElementById('sidebar-role-badge');
  badge.textContent = { admin: 'مدير', teacher: 'أستاذ', student: 'طالب' }[role];
  badge.className = 'role-badge ' + role;

  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = '';
  (NAV[role] || []).forEach(section => {
    const sec = document.createElement('div');
    sec.className = 'nav-section';
    sec.innerHTML = `<div class="nav-section-title">${section.section}</div>`;
    section.items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'nav-item';
      el.id = 'nav-' + item.id;
      el.innerHTML = `<span class="nav-icon">${item.icon}</span><span>${item.label}</span>`;
      el.onclick = () => { navigate(item.id); closeSidebar(); };
      sec.appendChild(el);
    });
    nav.appendChild(sec);
  });
}
function renderTopbar() {
  document.getElementById('topbar-user').textContent = currentUser.name;
}
function loadDefaultPanel() {
  navigate('dashboard');
}

// ========== SIDEBAR TOGGLE ==========
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebar-overlay');
  const open = sb.classList.toggle('open');
  ov.style.display = open ? 'block' : 'none';
  if (!open) sb.classList.remove('open');
}
function closeSidebar() {
  const sb = document.getElementById('sidebar');
  sb.classList.remove('open');
  document.getElementById('sidebar-overlay').style.display = 'none';
}

// ========== NAVIGATION ==========
let currentPanel = '';
function navigate(panelId) {
  currentPanel = panelId;
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  const navEl = document.getElementById('nav-' + panelId);
  if (navEl) navEl.classList.add('active');

  const titles = {
    dashboard: 'لوحة التحكم',
    'admin-students': 'إدارة الطلاب',
    'admin-teachers': 'إدارة الأساتذة',
    'admin-departments': 'الأقسام',
    'admin-subjects': 'المواد الدراسية',
    'admin-grades': 'الدرجات',
    'admin-announcements': 'الإعلانات',
    'teacher-students': 'طلابي',
    'teacher-grades': 'إدارة الدرجات',
    'teacher-subjects': 'موادي',
    'teacher-announcements': 'الإعلانات',
    'student-profile': 'ملفي الشخصي',
    'student-grades': 'درجاتي',
    'student-subjects': 'موادي',
    'student-schedule': 'جدول الدروس',
    'student-announcements': 'الإعلانات',
    'change-password': 'تغيير كلمة المرور',
  };
  document.getElementById('topbar-title').textContent = titles[panelId] || '';

  const content = document.getElementById('main-content');
  content.innerHTML = '';
  const panel = document.createElement('div');
  panel.className = 'panel active';

  const renders = {
    dashboard: renderDashboard,
    'admin-students': renderAdminStudents,
    'admin-teachers': renderAdminTeachers,
    'admin-departments': renderAdminDepartments,
    'admin-subjects': renderAdminSubjects,
    'admin-grades': renderAdminGrades,
    'admin-announcements': renderAdminAnnouncements,
    'teacher-students': renderTeacherStudents,
    'teacher-grades': renderTeacherGrades,
    'teacher-subjects': renderTeacherSubjects,
    'teacher-announcements': renderTeacherAnnouncements,
    'student-profile': renderStudentProfile,
    'student-grades': renderStudentGrades,
    'student-subjects': renderStudentSubjects,
    'student-schedule': renderStudentSchedule,
    'student-announcements': renderStudentAnnouncements,
    'change-password': renderChangePassword,
  };
  content.appendChild(panel);
  if (renders[panelId]) renders[panelId](panel);
  else panel.innerHTML = `<div class="empty-state"><div class="empty-icon">🚧</div><p>قيد الإنشاء</p></div>`;
}

// ========== DASHBOARD ==========
function renderDashboard(el) {
  const role = currentUser.role;
  if (role === 'admin') renderAdminDashboard(el);
  else if (role === 'teacher') renderTeacherDashboard(el);
  else renderStudentDashboard(el);
}

function renderAdminDashboard(el) {
  const users = getAll('users');
  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');
  const subjects = getAll('subjects');
  const departments = getAll('departments');
  const announces = getAll('announcements');

  el.innerHTML = `
    <div class="page-header">
      <div><h2>مرحباً، ${currentUser.name} 👋</h2><p>لوحة تحكم المدير - نظرة عامة على المعهد</p></div>
    </div>
    <div class="stats-grid">
      <div class="stat-card" style="animation-delay:0.05s">
        <div class="stat-icon blue">👨‍🎓</div>
        <div class="stat-info"><div class="stat-value">${students.length}</div><div class="stat-label">إجمالي الطلاب</div></div>
      </div>
      <div class="stat-card" style="animation-delay:0.1s">
        <div class="stat-icon green">👨‍🏫</div>
        <div class="stat-info"><div class="stat-value">${teachers.length}</div><div class="stat-label">الأساتذة</div></div>
      </div>
      <div class="stat-card" style="animation-delay:0.15s">
        <div class="stat-icon orange">📚</div>
        <div class="stat-info"><div class="stat-value">${subjects.length}</div><div class="stat-label">المواد الدراسية</div></div>
      </div>
      <div class="stat-card" style="animation-delay:0.2s">
        <div class="stat-icon yellow">🏛️</div>
        <div class="stat-info"><div class="stat-value">${departments.length}</div><div class="stat-label">الأقسام</div></div>
      </div>
    </div>
    <div class="two-cols">
      <div class="card">
        <div class="card-header"><div class="card-title">📢 آخر الإعلانات</div></div>
        ${announces.slice(-3).reverse().map(a => `
          <div class="announce-item">
            <h4>${a.title}</h4>
            <p>${a.content.substring(0,100)}...</p>
            <div class="announce-meta"><span>📅 ${a.date}</span><span class="badge badge-blue">${a.role === 'all' ? 'للجميع' : 'للطلاب'}</span></div>
          </div>
        `).join('')}
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">👥 المستخدمون الأخيرون</div></div>
        <div class="table-wrapper"><table>
          <thead><tr><th>الاسم</th><th>الدور</th><th>البريد</th></tr></thead>
          <tbody>${users.slice(-5).map(u => `
            <tr>
              <td>${u.name}</td>
              <td><span class="badge ${u.role==='admin'?'badge-orange':u.role==='teacher'?'badge-green':'badge-blue'}">${u.role==='admin'?'مدير':u.role==='teacher'?'أستاذ':'طالب'}</span></td>
              <td style="direction:ltr">${u.email}</td>
            </tr>
          `).join('')}</tbody>
        </table></div>
      </div>
    </div>
  `;
}

function renderTeacherDashboard(el) {
  const allStudents = getAll('users').filter(u => u.role === 'student');
  const mySubjects = getAll('subjects').filter(s => s.teacherId === currentUser.id);
  const grades = getAll('grades');
  const myGrades = grades.filter(g => mySubjects.some(s => s.id === g.subjectId));
  const avg = myGrades.length ? (myGrades.reduce((a, g) => a + (g.midterm + g.final + g.project), 0) / myGrades.length).toFixed(1) : 0;

  el.innerHTML = `
    <div class="page-header"><div><h2>مرحباً، ${currentUser.name} 👋</h2><p>لوحة تحكم الأستاذ</p></div></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon blue">📚</div><div class="stat-info"><div class="stat-value">${mySubjects.length}</div><div class="stat-label">موادي</div></div></div>
      <div class="stat-card"><div class="stat-icon green">👨‍🎓</div><div class="stat-info"><div class="stat-value">${allStudents.length}</div><div class="stat-label">الطلاب الكلي</div></div></div>
      <div class="stat-card"><div class="stat-icon orange">📋</div><div class="stat-info"><div class="stat-value">${myGrades.length}</div><div class="stat-label">الدرجات المدخلة</div></div></div>
      <div class="stat-card"><div class="stat-icon yellow">📈</div><div class="stat-info"><div class="stat-value">${avg}</div><div class="stat-label">متوسط الدرجات</div></div></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">📊 إحصائيات المواد</div></div>
      <div class="table-wrapper"><table>
        <thead><tr><th>المادة</th><th>الكود</th><th>عدد الطلاب</th><th>متوسط الدرجة</th></tr></thead>
        <tbody>${mySubjects.map(s => {
          const sGrades = grades.filter(g => g.subjectId === s.id);
          const sAvg = sGrades.length ? (sGrades.reduce((a,g) => a + g.midterm + g.final + g.project, 0) / sGrades.length).toFixed(1) : '-';
          return `<tr><td>${s.name}</td><td><span class="badge badge-blue">${s.code}</span></td><td>${sGrades.length}</td><td>${sAvg}</td></tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>
  `;
}

function renderStudentDashboard(el) {
  const grades = getAll('grades').filter(g => g.studentId === currentUser.id);
  const subjects = getAll('subjects');
  const mySubjects = subjects.filter(s => {
    const dept = currentUser.department;
    return s.department === dept;
  });
  const totalScore = grades.reduce((a,g) => a + g.midterm + g.final + g.project, 0);
  const avg = grades.length ? (totalScore / grades.length).toFixed(1) : 0;

  el.innerHTML = `
    <div class="page-header"><div><h2>مرحباً، ${currentUser.name} 👨‍🎓</h2><p>بوابة الطالب - نظرة عامة</p></div></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon blue">📚</div><div class="stat-info"><div class="stat-value">${mySubjects.length}</div><div class="stat-label">مواد مسجلة</div></div></div>
      <div class="stat-card"><div class="stat-icon green">✅</div><div class="stat-info"><div class="stat-value">${grades.length}</div><div class="stat-label">مواد مكتملة</div></div></div>
      <div class="stat-card"><div class="stat-icon orange">📊</div><div class="stat-info"><div class="stat-value">${avg}</div><div class="stat-label">متوسط الدرجات</div></div></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">📋 ملخص درجاتي</div></div>
      ${grades.length === 0 ? '<div class="empty-state"><div class="empty-icon">📭</div><p>لا توجد درجات بعد</p></div>' : `
      <div class="table-wrapper"><table>
        <thead><tr><th>المادة</th><th>نصفي</th><th>نهائي</th><th>مشروع</th><th>المجموع</th><th>التقدير</th></tr></thead>
        <tbody>${grades.map(g => {
          const sub = subjects.find(s => s.id === g.subjectId);
          const total = g.midterm + g.final + g.project;
          const pct = (total / 68 * 100).toFixed(0);
          const grade = getLetterGrade(total);
          return `<tr>
            <td>${sub ? sub.name : '-'}</td>
            <td>${g.midterm}/20</td><td>${g.final}/40</td><td>${g.project}/20</td>
            <td><strong>${total}/80</strong> <div class="progress-bar" style="margin-top:4px"><div class="progress-fill ${pct>=80?'green':pct>=60?'':'red'}" style="width:${pct}%"></div></div></td>
            <td><span class="badge ${getGradeBadge(grade)}">${grade}</span></td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>`}
    </div>
  `;
}

// ========== ADMIN: STUDENTS ==========
function renderAdminStudents(el) {
  const users = getAll('users');
  const departments = getAll('departments');
  let students = users.filter(u => u.role === 'student');
  
  el.innerHTML = `
    <div class="page-header">
      <div><h2>👨‍🎓 إدارة الطلاب</h2><p>إضافة وتعديل وحذف الطلاب</p></div>
      <button class="btn btn-primary" onclick="openAddUserModal('student')">➕ إضافة طالب</button>
    </div>
    <div class="card">
      <div class="card-header">
        <div class="card-title">قائمة الطلاب (${students.length})</div>
        <div class="search-bar">
          <div class="search-input-wrapper"><input type="text" id="student-search" placeholder="بحث..." oninput="filterTable('student-search','students-tbody')" /></div>
        </div>
      </div>
      <div class="table-wrapper"><table>
        <thead><tr><th>#</th><th>الاسم</th><th>اسم المستخدم</th><th>البريد</th><th>القسم</th><th>السنة</th><th>الإجراءات</th></tr></thead>
        <tbody id="students-tbody">
          ${students.map((s, i) => {
            const dept = departments.find(d => d.id === s.department);
            return `<tr>
              <td>${i+1}</td>
              <td><strong>${s.name}</strong></td>
              <td><span class="badge badge-gray">${s.username}</span></td>
              <td style="direction:ltr">${s.email}</td>
              <td>${dept ? dept.name : '-'}</td>
              <td><span class="badge badge-blue">السنة ${s.year || 1}</span></td>
              <td>
                <button class="btn btn-sm btn-outline" onclick="openEditUserModal('${s.id}')">✏️ تعديل</button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser('${s.id}')">🗑️ حذف</button>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table></div>
    </div>
  `;
}

// ========== ADMIN: TEACHERS ==========
function renderAdminTeachers(el) {
  const users = getAll('users');
  const departments = getAll('departments');
  const subjects = getAll('subjects');
  let teachers = users.filter(u => u.role === 'teacher');
  
  el.innerHTML = `
    <div class="page-header">
      <div><h2>👨‍🏫 إدارة الأساتذة</h2><p>إضافة وتعديل وحذف الأساتذة</p></div>
      <button class="btn btn-primary" onclick="openAddUserModal('teacher')">➕ إضافة أستاذ</button>
    </div>
    <div class="card">
      <div class="card-header">
        <div class="card-title">قائمة الأساتذة (${teachers.length})</div>
      </div>
      <div class="table-wrapper"><table>
        <thead><tr><th>#</th><th>الاسم</th><th>اسم المستخدم</th><th>البريد</th><th>القسم</th><th>المواد</th><th>الإجراءات</th></tr></thead>
        <tbody>${teachers.map((t, i) => {
          const dept = departments.find(d => d.id === t.department);
          const teacherSubjects = subjects.filter(s => s.teacherId === t.id);
          return `<tr>
            <td>${i+1}</td>
            <td><strong>${t.name}</strong></td>
            <td><span class="badge badge-gray">${t.username}</span></td>
            <td style="direction:ltr">${t.email}</td>
            <td>${dept ? dept.name : '-'}</td>
            <td>${teacherSubjects.map(s => `<span class="badge badge-green">${s.name}</span>`).join(' ') || '-'}</td>
            <td>
              <button class="btn btn-sm btn-outline" onclick="openEditUserModal('${t.id}')">✏️ تعديل</button>
              <button class="btn btn-sm btn-danger" onclick="deleteUser('${t.id}')">🗑️ حذف</button>
            </td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>
  `;
}

// ========== ADMIN: DEPARTMENTS ==========
function renderAdminDepartments(el) {
  const departments = getAll('departments');
  const subjects = getAll('subjects');
  const users = getAll('users');
  
  el.innerHTML = `
    <div class="page-header">
      <div><h2>🏛️ إدارة الأقسام</h2><p>إنشاء وإدارة الأقسام الدراسية</p></div>
      <button class="btn btn-primary" onclick="openDeptModal()">➕ إضافة قسم</button>
    </div>
    <div class="stats-grid">
      ${departments.map(d => {
        const dSubjects = subjects.filter(s => s.department === d.id);
        const dStudents = users.filter(u => u.role === 'student' && u.department === d.id);
        return `<div class="stat-card">
          <div class="stat-icon blue">🏛️</div>
          <div class="stat-info">
            <div class="stat-value">${d.name}</div>
            <div class="stat-label">${dStudents.length} طالب · ${dSubjects.length} مادة</div>
            <div style="margin-top:8px;display:flex;gap:6px">
              <button class="btn btn-sm btn-outline" onclick="openEditDeptModal('${d.id}')">✏️</button>
              <button class="btn btn-sm btn-danger" onclick="deleteDept('${d.id}')">🗑️</button>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>
  `;
}

// ========== ADMIN: SUBJECTS ==========
function renderAdminSubjects(el) {
  const subjects = getAll('subjects');
  const departments = getAll('departments');
  const teachers = getAll('users').filter(u => u.role === 'teacher');
  
  el.innerHTML = `
    <div class="page-header">
      <div><h2>📚 المواد الدراسية</h2><p>إدارة جميع المواد والمقررات</p></div>
      <button class="btn btn-primary" onclick="openSubjectModal()">➕ إضافة مادة</button>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">قائمة المواد (${subjects.length})</div></div>
      <div class="table-wrapper"><table>
        <thead><tr><th>#</th><th>اسم المادة</th><th>الكود</th><th>الأستاذ</th><th>القسم</th><th>الساعات</th><th>الإجراءات</th></tr></thead>
        <tbody>${subjects.map((s, i) => {
          const teacher = teachers.find(t => t.id === s.teacherId);
          const dept = departments.find(d => d.id === s.department);
          return `<tr>
            <td>${i+1}</td>
            <td><strong>${s.name}</strong></td>
            <td><span class="badge badge-blue">${s.code}</span></td>
            <td>${teacher ? teacher.name : '-'}</td>
            <td>${dept ? dept.name : '-'}</td>
            <td>${s.credits} ساعة</td>
            <td>
              <button class="btn btn-sm btn-outline" onclick="openEditSubjectModal('${s.id}')">✏️ تعديل</button>
              <button class="btn btn-sm btn-danger" onclick="deleteSubject('${s.id}')">🗑️ حذف</button>
            </td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>
  `;
}

// ========== ADMIN: GRADES ==========
function renderAdminGrades(el) {
  const grades = getAll('grades');
  const users = getAll('users');
  const subjects = getAll('subjects');
  
  el.innerHTML = `
    <div class="page-header">
      <div><h2>📋 الدرجات</h2><p>عرض وإدارة جميع الدرجات</p></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">جميع الدرجات (${grades.length})</div></div>
      <div class="table-wrapper"><table>
        <thead><tr><th>#</th><th>الطالب</th><th>المادة</th><th>نصفي/20</th><th>نهائي/40</th><th>مشروع/20</th><th>المجموع</th><th>التقدير</th><th>ملاحظات</th></tr></thead>
        <tbody>${grades.map((g, i) => {
          const student = users.find(u => u.id === g.studentId);
          const subject = subjects.find(s => s.id === g.subjectId);
          const total = g.midterm + g.final + g.project;
          const letter = getLetterGrade(total);
          return `<tr>
            <td>${i+1}</td>
            <td>${student ? student.name : '-'}</td>
            <td>${subject ? subject.name : '-'}</td>
            <td>${g.midterm}</td>
            <td>${g.final}</td>
            <td>${g.project}</td>
            <td><strong>${total}/80</strong></td>
            <td><span class="badge ${getGradeBadge(letter)}">${letter}</span></td>
            <td>${g.notes || '-'}</td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>
  `;
}

// ========== ADMIN: ANNOUNCEMENTS ==========
function renderAdminAnnouncements(el) {
  renderAnnouncementsPanel(el, true);
}

// ========== TEACHER: STUDENTS ==========
function renderTeacherStudents(el) {
  const mySubjects = getAll('subjects').filter(s => s.teacherId === currentUser.id);
  const allStudents = getAll('users').filter(u => u.role === 'student');
  const grades = getAll('grades');
  const depts = getAll('departments');
  
  el.innerHTML = `
    <div class="page-header"><div><h2>👨‍🎓 طلابي</h2><p>قائمة الطلاب المسجلين في موادي</p></div></div>
    ${mySubjects.map(sub => {
      const subGrades = grades.filter(g => g.subjectId === sub.id);
      const subStudentIds = subGrades.map(g => g.studentId);
      const subStudents = allStudents.filter(s => subStudentIds.includes(s.id));
      return `<div class="card">
        <div class="card-header">
          <div class="card-title">📚 ${sub.name} <span class="badge badge-blue">${sub.code}</span></div>
          <span>${subStudents.length} طالب</span>
        </div>
        ${subStudents.length === 0 ? '<div class="empty-state"><div class="empty-icon">👥</div><p>لا يوجد طلاب بعد</p></div>' : `
        <div class="table-wrapper"><table>
          <thead><tr><th>الاسم</th><th>القسم</th><th>الدرجة الكلية</th><th>التقدير</th><th>ملاحظات</th></tr></thead>
          <tbody>${subStudents.map(s => {
            const g = subGrades.find(gr => gr.studentId === s.id);
            const total = g ? g.midterm + g.final + g.project : '-';
            const letter = total !== '-' ? getLetterGrade(total) : '-';
            const dept = depts.find(d => d.id === s.department);
            return `<tr>
              <td><strong>${s.name}</strong></td>
              <td>${dept ? dept.name : '-'}</td>
              <td>${total !== '-' ? total + '/80' : '-'}</td>
              <td>${letter !== '-' ? `<span class="badge ${getGradeBadge(letter)}">${letter}</span>` : '-'}</td>
              <td>${g && g.notes ? g.notes : '-'}</td>
            </tr>`;
          }).join('')}</tbody>
        </table></div>`}
      </div>`;
    }).join('')}
    ${mySubjects.length === 0 ? '<div class="empty-state"><div class="empty-icon">📚</div><p>لم يتم تعيين مواد لك بعد</p></div>' : ''}
  `;
}

// ========== TEACHER: GRADES ==========
function renderTeacherGrades(el) {
  const mySubjects = getAll('subjects').filter(s => s.teacherId === currentUser.id);
  const allStudents = getAll('users').filter(u => u.role === 'student');
  
  el.innerHTML = `
    <div class="page-header">
      <div><h2>📋 إدارة الدرجات</h2><p>إدخال وتعديل درجات الطلاب</p></div>
      <button class="btn btn-primary" onclick="openGradeModal()">➕ إضافة درجة</button>
    </div>
    ${mySubjects.map(sub => {
      const grades = getAll('grades').filter(g => g.subjectId === sub.id);
      return `<div class="card">
        <div class="card-header">
          <div class="card-title">📚 ${sub.name}</div>
          <button class="btn btn-sm btn-primary" onclick="openGradeModal('${sub.id}')">➕ إضافة درجة</button>
        </div>
        ${grades.length === 0 ? '<div class="empty-state"><div class="empty-icon">📭</div><p>لا توجد درجات مدخلة</p></div>' : `
        <div class="table-wrapper"><table>
          <thead><tr><th>الطالب</th><th>نصفي/20</th><th>نهائي/40</th><th>مشروع/20</th><th>المجموع</th><th>ملاحظات</th><th>إجراءات</th></tr></thead>
          <tbody>${grades.map(g => {
            const student = allStudents.find(s => s.id === g.studentId);
            const total = g.midterm + g.final + g.project;
            return `<tr>
              <td>${student ? student.name : '-'}</td>
              <td>${g.midterm}</td><td>${g.final}</td><td>${g.project}</td>
              <td><strong>${total}</strong></td>
              <td>${g.notes || '-'}</td>
              <td>
                <button class="btn btn-sm btn-outline" onclick="openEditGradeModal('${g.id}')">✏️</button>
                <button class="btn btn-sm btn-danger" onclick="deleteGrade('${g.id}')">🗑️</button>
              </td>
            </tr>`;
          }).join('')}</tbody>
        </table></div>`}
      </div>`;
    }).join('')}
  `;
}

// ========== TEACHER: SUBJECTS ==========
function renderTeacherSubjects(el) {
  const mySubjects = getAll('subjects').filter(s => s.teacherId === currentUser.id);
  const depts = getAll('departments');
  const schedule = getAll('schedule');
  
  el.innerHTML = `
    <div class="page-header"><div><h2>📚 موادي</h2><p>المواد الدراسية المعينة لي</p></div></div>
    <div class="stats-grid">
      ${mySubjects.map(s => {
        const dept = depts.find(d => d.id === s.department);
        const sch = schedule.filter(sc => sc.subjectId === s.id);
        return `<div class="stat-card">
          <div class="stat-icon blue">📘</div>
          <div class="stat-info">
            <div style="font-weight:800;font-size:1rem;margin-bottom:4px">${s.name}</div>
            <div class="stat-label"><span class="badge badge-blue">${s.code}</span></div>
            <div class="stat-label">${dept ? dept.name : '-'} · ${s.credits} ساعات</div>
            <div style="margin-top:8px">${sch.map(sc => `<div class="lesson-chip">${sc.day} ${sc.time}</div>`).join('')}</div>
          </div>
        </div>`;
      }).join('')}
    </div>
    ${mySubjects.length === 0 ? '<div class="empty-state"><div class="empty-icon">📚</div><p>لم يتم تعيين مواد لك بعد</p></div>' : ''}
  `;
}

// ========== TEACHER: ANNOUNCEMENTS ==========
function renderTeacherAnnouncements(el) {
  renderAnnouncementsPanel(el, true, 'teacher');
}

// ========== STUDENT: PROFILE ==========
function renderStudentProfile(el) {
  const depts = getAll('departments');
  const dept = depts.find(d => d.id === currentUser.department);
  const grades = getAll('grades').filter(g => g.studentId === currentUser.id);
  const subjects = getAll('subjects');
  const totalScore = grades.reduce((a,g) => a + g.midterm + g.final + g.project, 0);
  const avg = grades.length ? (totalScore / grades.length).toFixed(1) : 0;
  
  el.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar">👨‍🎓</div>
      <div>
        <div class="profile-name">${currentUser.name}</div>
        <div class="profile-sub">${currentUser.email}</div>
        <div class="profile-badges">
          <span>📚 ${dept ? dept.name : 'غير محدد'}</span>
          <span>🎓 السنة ${currentUser.year || 1}</span>
          <span>📊 ${grades.length} مادة</span>
        </div>
      </div>
    </div>
    <div class="two-cols">
      <div class="card">
        <div class="card-header"><div class="card-title">📋 معلومات الحساب</div></div>
        <table><tbody>
          <tr><td style="color:var(--text-muted);width:140px">اسم المستخدم</td><td><span class="badge badge-gray">${currentUser.username}</span></td></tr>
          <tr><td style="color:var(--text-muted)">البريد الإلكتروني</td><td>${currentUser.email}</td></tr>
          <tr><td style="color:var(--text-muted)">القسم</td><td>${dept ? dept.name : '-'}</td></tr>
          <tr><td style="color:var(--text-muted)">السنة الدراسية</td><td>السنة ${currentUser.year || 1}</td></tr>
        </tbody></table>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">📈 ملخص الأداء</div></div>
        <div style="padding:16px 0">
          <div style="display:flex;justify-content:space-between;margin-bottom:12px">
            <span>متوسط الدرجات</span><strong>${avg}/80</strong>
          </div>
          <div class="progress-bar" style="height:12px;margin-bottom:20px">
            <div class="progress-fill ${avg>=60?'green':avg>=40?'':'red'}" style="width:${(avg/80*100).toFixed(0)}%"></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px">
            <span>المواد المكتملة</span><strong>${grades.length}</strong>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span>التقدير العام</span><strong><span class="badge ${getGradeBadge(getLetterGrade(avg))}">${getLetterGrade(parseFloat(avg))}</span></strong>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ========== STUDENT: GRADES ==========
function renderStudentGrades(el) {
  const grades = getAll('grades').filter(g => g.studentId === currentUser.id);
  const subjects = getAll('subjects');
  
  el.innerHTML = `
    <div class="page-header"><div><h2>📋 درجاتي</h2><p>عرض جميع درجاتك في المواد الدراسية</p></div></div>
    ${grades.length === 0 ? '<div class="empty-state"><div class="empty-icon">📭</div><p>لا توجد درجات بعد</p></div>' : `
    <div class="card">
      <div class="card-header"><div class="card-title">تفاصيل الدرجات</div></div>
      <div class="table-wrapper"><table>
        <thead><tr><th>المادة</th><th>نصفي/20</th><th>نهائي/40</th><th>مشروع/20</th><th>المجموع/80</th><th>النسبة</th><th>التقدير</th><th>ملاحظات</th></tr></thead>
        <tbody>${grades.map(g => {
          const sub = subjects.find(s => s.id === g.subjectId);
          const total = g.midterm + g.final + g.project;
          const pct = (total / 80 * 100).toFixed(1);
          const letter = getLetterGrade(total);
          return `<tr>
            <td><strong>${sub ? sub.name : '-'}</strong></td>
            <td>${g.midterm}</td><td>${g.final}</td><td>${g.project}</td>
            <td><strong>${total}</strong></td>
            <td>
              <div style="display:flex;align-items:center;gap:8px">
                <div class="progress-bar"><div class="progress-fill ${pct>=80?'green':pct>=50?'':'red'}" style="width:${pct}%"></div></div>
                ${pct}%
              </div>
            </td>
            <td><span class="badge ${getGradeBadge(letter)}">${letter}</span></td>
            <td>${g.notes || '-'}</td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>`}
  `;
}

// ========== STUDENT: SUBJECTS ==========
function renderStudentSubjects(el) {
  const subjects = getAll('subjects').filter(s => s.department === currentUser.department);
  const teachers = getAll('users').filter(u => u.role === 'teacher');
  const schedule = getAll('schedule');
  
  el.innerHTML = `
    <div class="page-header"><div><h2>📚 موادي</h2><p>المواد الدراسية في قسمك</p></div></div>
    <div class="stats-grid">
      ${subjects.map(s => {
        const teacher = teachers.find(t => t.id === s.teacherId);
        const sch = schedule.filter(sc => sc.subjectId === s.id);
        return `<div class="stat-card">
          <div class="stat-icon blue">📘</div>
          <div class="stat-info">
            <div style="font-weight:800;font-size:0.95rem;margin-bottom:4px">${s.name}</div>
            <div><span class="badge badge-blue">${s.code}</span> <span class="badge badge-gray">${s.credits} ساعة</span></div>
            <div class="stat-label" style="margin-top:6px">👨‍🏫 ${teacher ? teacher.name : '-'}</div>
            <div style="margin-top:6px">${sch.map(sc => `<div class="lesson-chip">${sc.day} - ${sc.time} - ${sc.room}</div>`).join('')}</div>
          </div>
        </div>`;
      }).join('')}
    </div>
    ${subjects.length === 0 ? '<div class="empty-state"><div class="empty-icon">📚</div><p>لا توجد مواد في قسمك</p></div>' : ''}
  `;
}

// ========== STUDENT: SCHEDULE ==========
function renderStudentSchedule(el) {
  const schedule = getAll('schedule');
  const subjects = getAll('subjects').filter(s => s.department === currentUser.department);
  const days = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس'];
  const colors = ['','green','orange','yellow',''];
  
  el.innerHTML = `
    <div class="page-header"><div><h2>🗓️ جدول الدروس</h2><p>جدولك الأسبوعي الدراسي</p></div></div>
    <div class="card">
      <div class="card-header"><div class="card-title">الجدول الأسبوعي</div></div>
      <div class="schedule-grid">
        ${days.map((day, di) => {
          const daySchedule = schedule.filter(sc => {
            const sub = subjects.find(s => s.id === sc.subjectId);
            return sc.day === day && sub;
          });
          return `<div class="day-col">
            <div class="day-header">${day}</div>
            <div class="day-lessons">
              ${daySchedule.map(sc => {
                const sub = subjects.find(s => s.id === sc.subjectId);
                return `<div class="lesson-chip ${colors[di % colors.length]}">
                  <div>${sub ? sub.name : '-'}</div>
                  <div style="font-size:0.65rem;opacity:0.7">${sc.time}</div>
                  <div style="font-size:0.65rem;opacity:0.7">${sc.room}</div>
                </div>`;
              }).join('') || '<div style="color:var(--text-light);font-size:0.75rem;text-align:center;padding:6px">لا دروس</div>'}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
}

// ========== STUDENT/TEACHER: ANNOUNCEMENTS ==========
function renderStudentAnnouncements(el) {
  renderAnnouncementsPanel(el, false, 'student');
}

function renderAnnouncementsPanel(el, canAdd, viewRole) {
  const announcements = getAll('announcements');
  const users = getAll('users');
  const filtered = viewRole ? announcements.filter(a => a.role === 'all' || a.role === viewRole) : announcements;
  
  el.innerHTML = `
    <div class="page-header">
      <div><h2>📢 الإعلانات</h2><p>آخر الأخبار والإعلانات</p></div>
      ${canAdd ? `<button class="btn btn-primary" onclick="openAnnounceModal()">➕ إضافة إعلان</button>` : ''}
    </div>
    <div class="announce-list" id="announce-list">
      ${filtered.length === 0 ? '<div class="empty-state"><div class="empty-icon">📭</div><p>لا توجد إعلانات</p></div>' :
        filtered.reverse().map(a => {
          const author = users.find(u => u.id === a.authorId);
          return `<div class="announce-item">
            <div style="display:flex;justify-content:space-between;align-items:start">
              <h4>📌 ${a.title}</h4>
              ${canAdd ? `<div style="display:flex;gap:6px">
                <button class="btn btn-sm btn-danger" onclick="deleteAnnounce('${a.id}')">🗑️</button>
              </div>` : ''}
            </div>
            <p>${a.content}</p>
            <div class="announce-meta">
              <span>👤 ${author ? author.name : 'النظام'}</span>
              <span>📅 ${a.date}</span>
              <span class="badge badge-blue">${a.role === 'all' ? '🌐 للجميع' : '👨‍🎓 للطلاب'}</span>
            </div>
          </div>`;
        }).join('')}
    </div>
  `;
}

// ========== CHANGE PASSWORD ==========
function renderChangePassword(el) {
  el.innerHTML = `
    <div class="page-header"><div><h2>🔑 تغيير كلمة المرور</h2><p>قم بتحديث كلمة مرورك</p></div></div>
    <div class="card" style="max-width:460px">
      <div class="form-grid" style="grid-template-columns:1fr">
        <div class="field-group">
          <label>كلمة المرور الحالية</label>
          <input type="password" id="cur-pw" placeholder="أدخل كلمة المرور الحالية" />
        </div>
        <div class="field-group">
          <label>كلمة المرور الجديدة</label>
          <input type="password" id="new-pw" placeholder="أدخل كلمة المرور الجديدة" />
        </div>
        <div class="field-group">
          <label>تأكيد كلمة المرور</label>
          <input type="password" id="confirm-pw" placeholder="أعد كتابة كلمة المرور" />
        </div>
        <div>
          <button class="btn btn-primary" onclick="changePassword()">💾 حفظ التغييرات</button>
        </div>
      </div>
    </div>
  `;
}
function changePassword() {
  const cur = document.getElementById('cur-pw').value;
  const newP = document.getElementById('new-pw').value;
  const conf = document.getElementById('confirm-pw').value;
  if (!cur || !newP || !conf) { showToast('يرجى ملء جميع الحقول', 'error'); return; }
  if (cur !== currentUser.password) { showToast('كلمة المرور الحالية غير صحيحة', 'error'); return; }
  if (newP !== conf) { showToast('كلمتا المرور غير متطابقتان', 'error'); return; }
  if (newP.length < 5) { showToast('كلمة المرور يجب أن تكون 5 أحرف على الأقل', 'error'); return; }
  const users = getAll('users');
  const idx = users.findIndex(u => u.id === currentUser.id);
  users[idx].password = newP;
  saveAll('users', users);
  currentUser.password = newP;
  setSession(currentUser);
  document.getElementById('cur-pw').value = '';
  document.getElementById('new-pw').value = '';
  document.getElementById('confirm-pw').value = '';
  showToast('✅ تم تغيير كلمة المرور بنجاح', 'success');
}

// ========== MODALS ==========
function createModal(title, content, actions) {
  let overlay = document.getElementById('global-modal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'global-modal';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = '<div class="modal"><div class="modal-header"><h3 id="modal-title"></h3><button class="modal-close" onclick="closeModal()">✕</button></div><div id="modal-body"></div><div class="modal-footer" id="modal-footer"></div></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  }
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = content;
  document.getElementById('modal-footer').innerHTML = actions;
  overlay.classList.add('open');
}
function closeModal() {
  const m = document.getElementById('global-modal');
  if (m) m.classList.remove('open');
}

// ========== ADD/EDIT USER MODAL ==========
function openAddUserModal(role) {
  const depts = getAll('departments');
  const content = `
    <div class="form-grid">
      <div class="field-group"><label>الاسم الكامل</label><input id="m-name" type="text" placeholder="أدخل الاسم" /></div>
      <div class="field-group"><label>اسم المستخدم</label><input id="m-username" type="text" placeholder="اسم الدخول" /></div>
      <div class="field-group"><label>البريد الإلكتروني</label><input id="m-email" type="email" placeholder="example@mail.com" /></div>
      <div class="field-group"><label>كلمة المرور</label><input id="m-password" type="password" placeholder="كلمة المرور" /></div>
      <div class="field-group"><label>القسم</label>
        <select id="m-dept"><option value="">اختر القسم</option>${depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}</select>
      </div>
      ${role === 'student' ? `<div class="field-group"><label>السنة الدراسية</label><select id="m-year"><option value="1">السنة 1</option><option value="2">السنة 2</option><option value="3">السنة 3</option><option value="4">السنة 4</option></select></div>` : ''}
    </div>
  `;
  createModal(`➕ إضافة ${role === 'student' ? 'طالب' : 'أستاذ'}`, content,
    `<button class="btn btn-outline" onclick="closeModal()">إلغاء</button>
     <button class="btn btn-primary" onclick="saveNewUser('${role}')">💾 حفظ</button>`);
}

function saveNewUser(role) {
  const name = document.getElementById('m-name').value.trim();
  const username = document.getElementById('m-username').value.trim();
  const email = document.getElementById('m-email').value.trim();
  const password = document.getElementById('m-password').value;
  const dept = document.getElementById('m-dept').value;
  const yearEl = document.getElementById('m-year');
  const year = yearEl ? parseInt(yearEl.value) : 1;
  if (!name || !username || !email || !password) { showToast('يرجى ملء جميع الحقول المطلوبة', 'error'); return; }
  const users = getAll('users');
  if (users.some(u => u.username === username)) { showToast('اسم المستخدم مستخدم بالفعل', 'error'); return; }
  const newUser = { id: genId('u'), username, password, role, name, email, department: dept, year };
  users.push(newUser);
  saveAll('users', users);
  closeModal();
  showToast('✅ تم إضافة المستخدم بنجاح', 'success');
  navigate(currentPanel);
}

function openEditUserModal(userId) {
  const users = getAll('users');
  const user = users.find(u => u.id === userId);
  const depts = getAll('departments');
  if (!user) return;
  const content = `
    <div class="form-grid">
      <div class="field-group"><label>الاسم الكامل</label><input id="m-name" type="text" value="${user.name}" /></div>
      <div class="field-group"><label>اسم المستخدم</label><input id="m-username" type="text" value="${user.username}" /></div>
      <div class="field-group"><label>البريد الإلكتروني</label><input id="m-email" type="email" value="${user.email}" /></div>
      <div class="field-group"><label>القسم</label>
        <select id="m-dept"><option value="">بدون قسم</option>${depts.map(d => `<option value="${d.id}" ${d.id === user.department ? 'selected' : ''}>${d.name}</option>`).join('')}</select>
      </div>
      ${user.role === 'student' ? `<div class="field-group"><label>السنة</label><select id="m-year"><option value="1" ${user.year==1?'selected':''}>1</option><option value="2" ${user.year==2?'selected':''}>2</option><option value="3" ${user.year==3?'selected':''}>3</option><option value="4" ${user.year==4?'selected':''}>4</option></select></div>` : ''}
    </div>
  `;
  createModal('✏️ تعديل المستخدم', content,
    `<button class="btn btn-outline" onclick="closeModal()">إلغاء</button>
     <button class="btn btn-primary" onclick="saveEditUser('${userId}')">💾 حفظ</button>`);
}
function saveEditUser(userId) {
  const users = getAll('users');
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return;
  users[idx].name = document.getElementById('m-name').value.trim() || users[idx].name;
  users[idx].username = document.getElementById('m-username').value.trim() || users[idx].username;
  users[idx].email = document.getElementById('m-email').value.trim() || users[idx].email;
  users[idx].department = document.getElementById('m-dept').value;
  const yearEl = document.getElementById('m-year');
  if (yearEl) users[idx].year = parseInt(yearEl.value);
  saveAll('users', users);
  closeModal();
  showToast('✅ تم تحديث البيانات بنجاح', 'success');
  navigate(currentPanel);
}
function deleteUser(userId) {
  if (!confirm('هل تريد حذف هذا المستخدم؟')) return;
  const users = getAll('users').filter(u => u.id !== userId);
  saveAll('users', users);
  showToast('🗑️ تم حذف المستخدم', 'info');
  navigate(currentPanel);
}

// ========== DEPT MODALS ==========
function openDeptModal() {
  createModal('➕ إضافة قسم',
    `<div class="form-grid">
      <div class="field-group"><label>اسم القسم</label><input id="d-name" type="text" placeholder="مثال: قسم الفيزياء" /></div>
      <div class="field-group"><label>الرمز</label><input id="d-code" type="text" placeholder="مثال: PHY" /></div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">إلغاء</button>
     <button class="btn btn-primary" onclick="saveDept()">💾 حفظ</button>`);
}
function saveDept() {
  const name = document.getElementById('d-name').value.trim();
  const code = document.getElementById('d-code').value.trim();
  if (!name || !code) { showToast('يرجى ملء جميع الحقول', 'error'); return; }
  const depts = getAll('departments');
  depts.push({ id: genId('d'), name, code });
  saveAll('departments', depts);
  closeModal(); showToast('✅ تم إضافة القسم', 'success'); navigate(currentPanel);
}
function openEditDeptModal(id) {
  const dept = getAll('departments').find(d => d.id === id);
  if (!dept) return;
  createModal('✏️ تعديل القسم',
    `<div class="form-grid">
      <div class="field-group"><label>اسم القسم</label><input id="d-name" type="text" value="${dept.name}" /></div>
      <div class="field-group"><label>الرمز</label><input id="d-code" type="text" value="${dept.code}" /></div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">إلغاء</button>
     <button class="btn btn-primary" onclick="saveEditDept('${id}')">💾 حفظ</button>`);
}
function saveEditDept(id) {
  const depts = getAll('departments');
  const idx = depts.findIndex(d => d.id === id);
  if (idx === -1) return;
  depts[idx].name = document.getElementById('d-name').value.trim() || depts[idx].name;
  depts[idx].code = document.getElementById('d-code').value.trim() || depts[idx].code;
  saveAll('departments', depts);
  closeModal(); showToast('✅ تم تحديث القسم', 'success'); navigate(currentPanel);
}
function deleteDept(id) {
  if (!confirm('حذف هذا القسم؟')) return;
  saveAll('departments', getAll('departments').filter(d => d.id !== id));
  showToast('🗑️ تم حذف القسم', 'info'); navigate(currentPanel);
}

// ========== SUBJECT MODALS ==========
function openSubjectModal() {
  const depts = getAll('departments');
  const teachers = getAll('users').filter(u => u.role === 'teacher');
  createModal('➕ إضافة مادة',
    `<div class="form-grid">
      <div class="field-group"><label>اسم المادة</label><input id="s-name" type="text" placeholder="مثال: برمجة الحاسوب" /></div>
      <div class="field-group"><label>الكود</label><input id="s-code" type="text" placeholder="مثال: CS101" /></div>
      <div class="field-group"><label>الأستاذ</label><select id="s-teacher"><option value="">اختر الأستاذ</option>${teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}</select></div>
      <div class="field-group"><label>القسم</label><select id="s-dept"><option value="">اختر القسم</option>${depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}</select></div>
      <div class="field-group"><label>الساعات</label><input id="s-credits" type="number" min="1" max="6" value="3" /></div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">إلغاء</button>
     <button class="btn btn-primary" onclick="saveSubject()">💾 حفظ</button>`);
}
function saveSubject() {
  const name = document.getElementById('s-name').value.trim();
  const code = document.getElementById('s-code').value.trim();
  const teacherId = document.getElementById('s-teacher').value;
  const department = document.getElementById('s-dept').value;
  const credits = parseInt(document.getElementById('s-credits').value);
  if (!name || !code) { showToast('يرجى ملء الاسم والكود', 'error'); return; }
  const subjects = getAll('subjects');
  subjects.push({ id: genId('s'), name, code, teacherId, department, credits });
  saveAll('subjects', subjects);
  closeModal(); showToast('✅ تم إضافة المادة', 'success'); navigate(currentPanel);
}
function openEditSubjectModal(id) {
  const sub = getAll('subjects').find(s => s.id === id);
  const depts = getAll('departments');
  const teachers = getAll('users').filter(u => u.role === 'teacher');
  if (!sub) return;
  createModal('✏️ تعديل المادة',
    `<div class="form-grid">
      <div class="field-group"><label>اسم المادة</label><input id="s-name" type="text" value="${sub.name}" /></div>
      <div class="field-group"><label>الكود</label><input id="s-code" type="text" value="${sub.code}" /></div>
      <div class="field-group"><label>الأستاذ</label><select id="s-teacher"><option value="">اختر</option>${teachers.map(t => `<option value="${t.id}" ${t.id===sub.teacherId?'selected':''}>${t.name}</option>`).join('')}</select></div>
      <div class="field-group"><label>القسم</label><select id="s-dept"><option value="">اختر</option>${depts.map(d => `<option value="${d.id}" ${d.id===sub.department?'selected':''}>${d.name}</option>`).join('')}</select></div>
      <div class="field-group"><label>الساعات</label><input id="s-credits" type="number" value="${sub.credits}" /></div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">إلغاء</button>
     <button class="btn btn-primary" onclick="saveEditSubject('${id}')">💾 حفظ</button>`);
}
function saveEditSubject(id) {
  const subjects = getAll('subjects');
  const idx = subjects.findIndex(s => s.id === id);
  if (idx === -1) return;
  subjects[idx].name = document.getElementById('s-name').value.trim() || subjects[idx].name;
  subjects[idx].code = document.getElementById('s-code').value.trim() || subjects[idx].code;
  subjects[idx].teacherId = document.getElementById('s-teacher').value;
  subjects[idx].department = document.getElementById('s-dept').value;
  subjects[idx].credits = parseInt(document.getElementById('s-credits').value);
  saveAll('subjects', subjects);
  closeModal(); showToast('✅ تم تحديث المادة', 'success'); navigate(currentPanel);
}
function deleteSubject(id) {
  if (!confirm('حذف هذه المادة؟')) return;
  saveAll('subjects', getAll('subjects').filter(s => s.id !== id));
  showToast('🗑️ تم حذف المادة', 'info'); navigate(currentPanel);
}

// ========== GRADE MODALS ==========
function openGradeModal(preSubjectId) {
  const mySubjects = getAll('subjects').filter(s => s.teacherId === currentUser.id);
  const students = getAll('users').filter(u => u.role === 'student');
  createModal('➕ إضافة درجة',
    `<div class="form-grid">
      <div class="field-group"><label>الطالب</label><select id="g-student"><option value="">اختر الطالب</option>${students.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}</select></div>
      <div class="field-group"><label>المادة</label><select id="g-subject"><option value="">اختر المادة</option>${mySubjects.map(s => `<option value="${s.id}" ${s.id===preSubjectId?'selected':''}>${s.name}</option>`).join('')}</select></div>
      <div class="field-group"><label>درجة النصفي (من 20)</label><input id="g-mid" type="number" min="0" max="20" value="0" /></div>
      <div class="field-group"><label>درجة النهائي (من 40)</label><input id="g-final" type="number" min="0" max="40" value="0" /></div>
      <div class="field-group"><label>درجة المشروع (من 20)</label><input id="g-proj" type="number" min="0" max="20" value="0" /></div>
      <div class="field-group" style="grid-column:1/-1"><label>ملاحظات</label><textarea id="g-notes" placeholder="ملاحظات اختيارية"></textarea></div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">إلغاء</button>
     <button class="btn btn-primary" onclick="saveGrade()">💾 حفظ</button>`);
}
function saveGrade() {
  const studentId = document.getElementById('g-student').value;
  const subjectId = document.getElementById('g-subject').value;
  const midterm = parseInt(document.getElementById('g-mid').value);
  const final = parseInt(document.getElementById('g-final').value);
  const project = parseInt(document.getElementById('g-proj').value);
  const notes = document.getElementById('g-notes').value.trim();
  if (!studentId || !subjectId) { showToast('يرجى اختيار الطالب والمادة', 'error'); return; }
  const grades = getAll('grades');
  if (grades.some(g => g.studentId === studentId && g.subjectId === subjectId)) {
    showToast('تم إدخال درجة لهذا الطالب في هذه المادة بالفعل', 'error'); return;
  }
  grades.push({ id: genId('g'), studentId, subjectId, midterm, final, project, notes });
  saveAll('grades', grades);
  closeModal(); showToast('✅ تم إضافة الدرجة', 'success'); navigate(currentPanel);
}
function openEditGradeModal(id) {
  const grade = getAll('grades').find(g => g.id === id);
  const student = getAll('users').find(u => u.id === grade.studentId);
  const subject = getAll('subjects').find(s => s.id === grade.subjectId);
  if (!grade) return;
  createModal('✏️ تعديل الدرجة',
    `<div style="margin-bottom:12px;padding:10px;background:var(--surface2);border-radius:var(--radius-sm)">
      <strong>${student ? student.name : ''}</strong> - ${subject ? subject.name : ''}
    </div>
    <div class="form-grid">
      <div class="field-group"><label>درجة النصفي (من 20)</label><input id="g-mid" type="number" min="0" max="20" value="${grade.midterm}" /></div>
      <div class="field-group"><label>درجة النهائي (من 40)</label><input id="g-final" type="number" min="0" max="40" value="${grade.final}" /></div>
      <div class="field-group"><label>درجة المشروع (من 20)</label><input id="g-proj" type="number" min="0" max="20" value="${grade.project}" /></div>
      <div class="field-group" style="grid-column:1/-1"><label>ملاحظات</label><textarea id="g-notes">${grade.notes || ''}</textarea></div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">إلغاء</button>
     <button class="btn btn-primary" onclick="saveEditGrade('${id}')">💾 حفظ</button>`);
}
function saveEditGrade(id) {
  const grades = getAll('grades');
  const idx = grades.findIndex(g => g.id === id);
  if (idx === -1) return;
  grades[idx].midterm = parseInt(document.getElementById('g-mid').value);
  grades[idx].final = parseInt(document.getElementById('g-final').value);
  grades[idx].project = parseInt(document.getElementById('g-proj').value);
  grades[idx].notes = document.getElementById('g-notes').value.trim();
  saveAll('grades', grades);
  closeModal(); showToast('✅ تم تحديث الدرجة', 'success'); navigate(currentPanel);
}
function deleteGrade(id) {
  if (!confirm('حذف هذه الدرجة؟')) return;
  saveAll('grades', getAll('grades').filter(g => g.id !== id));
  showToast('🗑️ تم حذف الدرجة', 'info'); navigate(currentPanel);
}

// ========== ANNOUNCEMENT MODAL ==========
function openAnnounceModal() {
  createModal('📢 إضافة إعلان',
    `<div class="form-grid" style="grid-template-columns:1fr">
      <div class="field-group"><label>عنوان الإعلان</label><input id="a-title" type="text" placeholder="أدخل العنوان" /></div>
      <div class="field-group"><label>محتوى الإعلان</label><textarea id="a-content" placeholder="أدخل نص الإعلان هنا..."></textarea></div>
      <div class="field-group"><label>الجمهور المستهدف</label>
        <select id="a-role"><option value="all">للجميع</option><option value="student">للطلاب فقط</option></select>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">إلغاء</button>
     <button class="btn btn-primary" onclick="saveAnnounce()">📢 نشر</button>`);
}
function saveAnnounce() {
  const title = document.getElementById('a-title').value.trim();
  const content = document.getElementById('a-content').value.trim();
  const role = document.getElementById('a-role').value;
  if (!title || !content) { showToast('يرجى ملء جميع الحقول', 'error'); return; }
  const announces = getAll('announcements');
  announces.push({ id: genId('a'), title, content, authorId: currentUser.id, date: new Date().toISOString().split('T')[0], role });
  saveAll('announcements', announces);
  addNotification(`إعلان جديد: ${title}`);
  closeModal(); showToast('✅ تم نشر الإعلان', 'success'); navigate(currentPanel);
}
function deleteAnnounce(id) {
  if (!confirm('حذف هذا الإعلان؟')) return;
  saveAll('announcements', getAll('announcements').filter(a => a.id !== id));
  showToast('🗑️ تم حذف الإعلان', 'info'); navigate(currentPanel);
}

// ========== NOTIFICATIONS ==========
function addNotification(msg) {
  const notifs = getAll('notifications');
  notifs.push({ id: genId('n'), message: msg, time: new Date().toLocaleTimeString('ar'), read: false });
  saveAll('notifications', notifs);
  renderNotifications();
}
function renderNotifications() {
  const notifs = getAll('notifications').filter(n => !n.read);
  const count = document.getElementById('notif-count');
  count.textContent = notifs.length;
  count.style.display = notifs.length > 0 ? 'flex' : 'none';
  const list = document.getElementById('notif-list');
  list.innerHTML = notifs.length === 0
    ? '<div class="empty-state"><div class="empty-icon">🔔</div><p>لا توجد إشعارات</p></div>'
    : notifs.map(n => `<div class="notif-item"><div>${n.message}</div><div class="notif-time">${n.time}</div></div>`).join('');
}
function toggleNotifications() {
  const panel = document.getElementById('notif-panel');
  panel.classList.toggle('hidden');
}
function clearNotifications() {
  const notifs = getAll('notifications').map(n => ({ ...n, read: true }));
  saveAll('notifications', notifs);
  renderNotifications();
  document.getElementById('notif-panel').classList.add('hidden');
}

// ========== HELPERS ==========
function getLetterGrade(total) {
  if (total >= 70) return 'ممتاز';
  if (total >= 60) return 'جيد جداً';
  if (total >= 50) return 'جيد';
  if (total >= 40) return 'مقبول';
  return 'راسب';
}
function getGradeBadge(letter) {
  const map = { 'ممتاز': 'badge-green', 'جيد جداً': 'badge-blue', 'جيد': 'badge-yellow', 'مقبول': 'badge-orange', 'راسب': 'badge-red' };
  return map[letter] || 'badge-gray';
}

function filterTable(inputId, tbodyId) {
  const q = document.getElementById(inputId).value.toLowerCase();
  const rows = document.querySelectorAll('#' + tbodyId + ' tr');
  rows.forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function showError(msg) {
  const err = document.getElementById('login-error');
  if (err) { err.textContent = msg; err.classList.remove('hidden'); }
}

// ========== TOAST ==========
function createToastContainer() {
  const c = document.createElement('div');
  c.className = 'toast-container';
  c.id = 'toast-container';
  document.body.appendChild(c);
}
function showToast(msg, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-30px)'; t.style.transition = '0.3s'; setTimeout(() => t.remove(), 300); }, 3000);
}