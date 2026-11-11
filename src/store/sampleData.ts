import type { AppData } from '../lib/types';

function daysAgo(days: number, hour = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function dateOnly(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Editable starter content shown on first launch. Timestamps are relative to "now". */
export function createSampleData(): AppData {
  const t = daysAgo(14);
  return {
    version: 1,
    paths: [
      {
        id: 'path-ai',
        title: 'الذكاء الاصطناعي والتقنية والأتمتة',
        description: 'فهم أدوات الذكاء الاصطناعي واستخدامها عمليًا لأتمتة المهام اليومية وبناء حلول بسيطة.',
        color: '#1f4f8f',
        order: 0,
        createdAt: t,
        updatedAt: t,
      },
      {
        id: 'path-comm',
        title: 'التواصل والقيادة ومهارات الأعمال',
        description: 'تطوير مهارات العرض والإقناع وإدارة الفرق واتخاذ القرار في بيئة العمل.',
        color: '#0f766e',
        order: 1,
        createdAt: t,
        updatedAt: t,
      },
    ],
    topics: [
      { id: 'topic-prompting', pathId: 'path-ai', title: 'هندسة الأوامر (Prompt Engineering)', notes: 'كتابة تعليمات واضحة مع أمثلة وسياق محدد.', order: 0, createdAt: t, updatedAt: t },
      { id: 'topic-automation', pathId: 'path-ai', title: 'أتمتة سير العمل', notes: 'أدوات بلا كود مثل n8n و Zapier، ثم سكربتات بسيطة.', order: 1, createdAt: t, updatedAt: t },
      { id: 'topic-python', pathId: 'path-ai', title: 'أساسيات بايثون', notes: '', order: 2, createdAt: t, updatedAt: t },
      { id: 'topic-presenting', pathId: 'path-comm', title: 'العرض والتقديم', notes: 'هيكل العرض: المشكلة ← الفكرة ← الدليل ← الطلب.', order: 0, createdAt: t, updatedAt: t },
      { id: 'topic-feedback', pathId: 'path-comm', title: 'تقديم الملاحظات البنّاءة', notes: '', order: 1, createdAt: t, updatedAt: t },
      { id: 'topic-negotiation', pathId: 'path-comm', title: 'التفاوض', notes: '', order: 2, createdAt: t, updatedAt: t },
    ],
    resources: [
      {
        id: 'res-prompt-guide',
        title: 'دليل هندسة الأوامر',
        type: 'article',
        url: 'https://www.promptingguide.ai/',
        topicId: 'topic-prompting',
        status: 'in_progress',
        notes: 'قرأت قسم التقنيات الأساسية. التالي: Chain-of-Thought.',
        createdAt: daysAgo(10),
        updatedAt: daysAgo(2, 20),
      },
      {
        id: 'res-python-course',
        title: 'Python for Everybody',
        type: 'course',
        url: 'https://www.py4e.com/',
        topicId: 'topic-python',
        status: 'planned',
        notes: '',
        createdAt: daysAgo(9),
        updatedAt: daysAgo(9),
      },
      {
        id: 'res-n8n',
        title: 'توثيق n8n — البدء السريع',
        type: 'link',
        url: 'https://docs.n8n.io/',
        topicId: 'topic-automation',
        status: 'planned',
        notes: '',
        createdAt: daysAgo(6),
        updatedAt: daysAgo(6),
      },
      {
        id: 'res-ted',
        title: 'كيف تتحدث بحيث يرغب الناس في الاستماع — Julian Treasure',
        type: 'video',
        url: 'https://www.ted.com/talks/julian_treasure_how_to_speak_so_that_people_want_to_listen',
        topicId: 'topic-presenting',
        status: 'completed',
        notes: 'أهم فكرة: تجنّب "الخطايا السبع" في الكلام، والتدرّب على نبرة الصوت والوتيرة.',
        createdAt: daysAgo(12),
        updatedAt: daysAgo(4, 21),
      },
      {
        id: 'res-crucial',
        title: 'Crucial Conversations',
        type: 'book',
        url: '',
        topicId: 'topic-feedback',
        status: 'planned',
        notes: '',
        createdAt: daysAgo(8),
        updatedAt: daysAgo(8),
      },
    ],
    projects: [
      {
        id: 'proj-email',
        title: 'أتمتة تلخيص البريد اليومي',
        description: 'سير عمل يجمع رسائل البريد المهمة ويرسل ملخصًا صباحيًا.',
        pathId: 'path-ai',
        status: 'active',
        createdAt: daysAgo(7),
        updatedAt: daysAgo(1, 18),
      },
      {
        id: 'proj-talk',
        title: 'عرض تقديمي لمدة 5 دقائق',
        description: 'إعداد عرض قصير عن مشروع حالي وتقديمه أمام الفريق.',
        pathId: 'path-comm',
        status: 'active',
        createdAt: daysAgo(5),
        updatedAt: daysAgo(3),
      },
    ],
    tasks: [
      { id: 'task-1', projectId: 'proj-email', title: 'تحديد معايير الرسائل "المهمة"', done: true, topicId: null, order: 0, createdAt: daysAgo(7), updatedAt: daysAgo(1, 18), completedAt: daysAgo(1, 18) },
      { id: 'task-2', projectId: 'proj-email', title: 'كتابة أمر (Prompt) للتلخيص وتجربته على 5 رسائل', done: false, topicId: 'topic-prompting', order: 1, createdAt: daysAgo(7), updatedAt: daysAgo(7), completedAt: null },
      { id: 'task-3', projectId: 'proj-email', title: 'بناء سير العمل في n8n', done: false, topicId: 'topic-automation', order: 2, createdAt: daysAgo(7), updatedAt: daysAgo(7), completedAt: null },
      { id: 'task-4', projectId: 'proj-talk', title: 'كتابة الهيكل في 4 نقاط', done: true, topicId: 'topic-presenting', order: 0, createdAt: daysAgo(5), updatedAt: daysAgo(3), completedAt: daysAgo(3) },
      { id: 'task-5', projectId: 'proj-talk', title: 'التدرّب مع تسجيل صوتي مرتين', done: false, topicId: 'topic-presenting', order: 1, createdAt: daysAgo(5), updatedAt: daysAgo(5), completedAt: null },
    ],
    journal: [
      {
        id: 'journal-1',
        date: dateOnly(1),
        learned: 'إعطاء النموذج أمثلة على الناتج المطلوب يحسّن التنسيق بشكل كبير.',
        practiced: 'جرّبت ثلاث صيغ مختلفة لأمر التلخيص.',
        problems: 'الملخصات طويلة أحيانًا رغم تحديد عدد الكلمات.',
        next: 'تجربة تحديد عدد النقاط بدل عدد الكلمات.',
        topicId: 'topic-prompting',
        createdAt: daysAgo(1, 21),
        updatedAt: daysAgo(1, 21),
      },
      {
        id: 'journal-2',
        date: dateOnly(4),
        learned: 'الوقفات القصيرة أثناء الكلام تجعل الرسالة أوضح.',
        practiced: 'سجّلت مقدمة العرض وأعدت الاستماع إليها.',
        problems: 'أتحدث بسرعة في البداية.',
        next: 'التدرّب على أول 30 ثانية ببطء.',
        topicId: 'topic-presenting',
        createdAt: daysAgo(4, 22),
        updatedAt: daysAgo(4, 22),
      },
    ],
  };
}

export function createEmptyData(): AppData {
  return { version: 1, paths: [], topics: [], resources: [], projects: [], tasks: [], journal: [] };
}
