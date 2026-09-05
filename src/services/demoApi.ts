export type Role = 'Student' | 'Faculty' | 'Industry' | 'Admin'
export type User = { id: string; name: string; email: string; password: string; role: Role; college?: string; department?: string; bio?: string; skills?: string[]; careerGoal?: string }
export type Opportunity = { id: string; company: string; role: string; skills: string[]; location: string; mode: string; stipend: string; deadline: string; match: number }
export type Workspace = { id: string; project: string; company: string; description: string; progress: number; deadline: string; status: string; tasks: string[]; members: string[] }
export type Notification = { id: string; text: string; read: boolean; createdAt: string }
export type Resume = { name: string; size: number; type: string; uploadedAt: string; analysis?: { ats: number; found: string[]; missing: string[]; suggestions: string[] } }

type Store = { users: User[]; opportunities: Opportunity[]; workspaces: Workspace[]; saved: string[]; applications: string[]; notifications: Notification[]; resumes: Record<string, Resume>; roadmap: { id: string; title: string; progress: number; status: string }[] }
const key = 'nexora-store-v2'
const sessionKey = 'nexora-session-v2'
const seed: Store = {
  users: [
    { id: 'student-demo', name: 'Alex Morgan', email: 'student@nexora.demo', password: 'student123', role: 'Student', college: 'Northbridge University', department: 'Computer Science', skills: ['Python', 'SQL', 'React'], careerGoal: 'Backend Engineer' },
    { id: 'faculty-demo', name: 'Dr. Mira Rao', email: 'faculty@nexora.demo', password: 'faculty123', role: 'Faculty', college: 'Northbridge University', department: 'Computer Science' },
    { id: 'industry-demo', name: 'Jordan Lee', email: 'industry@nexora.demo', password: 'industry123', role: 'Industry' },
  ],
  opportunities: [
    { id: 'opp-1', company: 'TechNova', role: 'Backend Engineer Intern', skills: ['Python', 'Flask', 'MongoDB'], location: 'Remote', mode: 'Remote', stipend: '₹35,000/mo', deadline: 'Sep 28, 2026', match: 92 },
    { id: 'opp-2', company: 'CloudSphere', role: 'Cloud Automation Project', skills: ['Docker', 'AWS', 'Python'], location: 'Bengaluru', mode: 'Hybrid', stipend: '₹45,000/mo', deadline: 'Oct 4, 2026', match: 86 },
    { id: 'opp-3', company: 'FinEdge', role: 'Data Product Challenge', skills: ['SQL', 'Analytics', 'React'], location: 'Online', mode: 'Remote', stipend: '₹50,000 prize', deadline: 'Sep 24, 2026', match: 81 },
    { id: 'opp-4', company: 'DataForge', role: 'ML Platform Fellow', skills: ['Python', 'ML', 'Docker'], location: 'Pune', mode: 'On-site', stipend: '₹40,000/mo', deadline: 'Oct 12, 2026', match: 78 },
  ],
  workspaces: [{ id: 'workspace-1', project: 'AI Support Triage System', company: 'TechNova', description: 'Build a classifier that routes support tickets to the right team.', progress: 42, deadline: 'Oct 18, 2026', status: 'In progress', tasks: ['Define intent taxonomy', 'Build Flask API', 'Evaluate model'], members: ['Alex Morgan', 'Samir Patel'] }],
  saved: [], applications: [], notifications: [{ id: 'n-1', text: 'New project matching your Python skills', read: false, createdAt: 'Today' }, { id: 'n-2', text: 'Complete your REST API proof to unlock 4 roles', read: false, createdAt: 'Yesterday' }],
  resumes: {}, roadmap: [{ id: 'r-1', title: 'Current assessment', progress: 100, status: 'Complete' }, { id: 'r-2', title: 'Skill building', progress: 60, status: 'In progress' }, { id: 'r-3', title: 'Project building', progress: 20, status: 'Next' }, { id: 'r-4', title: 'Industry challenge', progress: 0, status: 'Locked' }, { id: 'r-5', title: 'Job readiness', progress: 0, status: 'Locked' }],
}
function load(): Store { const raw = localStorage.getItem(key); if (!raw) { localStorage.setItem(key, JSON.stringify(seed)); return seed } return JSON.parse(raw) as Store }
function save(store: Store) { localStorage.setItem(key, JSON.stringify(store)); return store }
export const api = {
  currentUser: (): User | null => { const id = sessionStorage.getItem(sessionKey); return id ? load().users.find((user) => user.id === id) || null : null },
  login: (email: string, password: string) => { const user = load().users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password); if (!user) throw new Error('Invalid email or password'); sessionStorage.setItem(sessionKey, user.id); return user },
  register: (input: Omit<User, 'id'>) => { const store = load(); if (store.users.some((user) => user.email.toLowerCase() === input.email.toLowerCase())) throw new Error('An account with this email already exists'); const user = { ...input, id: `user-${Date.now()}` }; store.users.push(user); save(store); sessionStorage.setItem(sessionKey, user.id); return user },
  logout: () => sessionStorage.removeItem(sessionKey),
  updateUser: (patch: Partial<User>) => { const store = load(); const user = api.currentUser(); if (!user) throw new Error('Please sign in again'); const updated = { ...user, ...patch }; store.users = store.users.map((item) => item.id === user.id ? updated : item); save(store); return updated },
  opportunities: () => load().opportunities,
  apply: (id: string) => { const store = load(); if (!store.applications.includes(id)) store.applications.push(id); store.notifications.unshift({ id: `n-${Date.now()}`, text: `Application submitted for ${store.opportunities.find((item) => item.id === id)?.role || 'opportunity'}`, read: false, createdAt: 'Just now' }); save(store) },
  saveOpportunity: (id: string) => { const store = load(); if (!store.saved.includes(id)) store.saved.push(id); save(store) },
  applications: () => load().applications,
  saved: () => load().saved,
  workspaces: () => load().workspaces,
  addWorkspace: (workspace: Omit<Workspace, 'id'>) => { const store = load(); const created = { ...workspace, id: `workspace-${Date.now()}` }; store.workspaces.push(created); store.notifications.unshift({ id: `n-${Date.now()}`, text: `${created.project} was added to your workspace`, read: false, createdAt: 'Just now' }); save(store); return created },
  updateWorkspace: (id: string, patch: Partial<Workspace>) => { const store = load(); store.workspaces = store.workspaces.map((item) => item.id === id ? { ...item, ...patch } : item); save(store) },
  resume: () => { const user = api.currentUser(); return user ? load().resumes[user.id] || null : null },
  uploadResume: (file: File) => { const user = api.currentUser(); if (!user) throw new Error('Please sign in first'); const resume = { name: file.name, size: file.size, type: file.type, uploadedAt: new Date().toISOString() }; const store = load(); store.resumes[user.id] = resume; save(store); return resume },
  analyzeResume: () => { const user = api.currentUser(); const store = load(); if (!user || !store.resumes[user.id]) throw new Error('Upload a resume before analyzing it'); const analysis = { ats: 82, found: ['Python', 'Flask', 'SQL', 'REST APIs'], missing: ['Docker', 'AWS', 'System design'], suggestions: ['Add measurable project outcomes', 'Surface backend keywords near the top', 'Link your industry project proof'] }; store.resumes[user.id].analysis = analysis; store.notifications.unshift({ id: `n-${Date.now()}`, text: 'Resume analysis completed', read: false, createdAt: 'Just now' }); save(store); return analysis },
  roadmap: () => load().roadmap,
  completeRoadmap: (id: string) => { const store = load(); const index = store.roadmap.findIndex((item) => item.id === id); if (index >= 0) { store.roadmap[index].progress = 100; store.roadmap[index].status = 'Complete'; const next = store.roadmap[index + 1]; if (next && next.status === 'Locked') next.status = 'Next' } save(store); return store.roadmap },
  notifications: () => load().notifications,
  readNotification: (id: string) => { const store = load(); store.notifications = store.notifications.map((item) => item.id === id ? { ...item, read: true } : item); save(store) },
  reset: () => { localStorage.setItem(key, JSON.stringify(seed)) },
}
