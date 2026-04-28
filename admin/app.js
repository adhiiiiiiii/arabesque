const { useEffect, useMemo, useRef, useState } = React;

function getCmsBasePath() {
  return window.location.pathname.startsWith('/admin-control') ? '/admin-control' : '/admin';
}

const LOCAL_SESSION_KEY = 'arabesque_cms_local_session';
const LOCAL_CONTENT_KEY = 'arabesque_cms_local_content';

function isLocalMode() {
  return ['localhost', '127.0.0.1'].includes(window.location.hostname) || window.location.protocol === 'file:';
}

function getLocalSession() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

function readLocalContentFallback() {
  try {
    const saved = localStorage.getItem(LOCAL_CONTENT_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // noop
  }
  return null;
}

function writeLocalContentFallback(content) {
  localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(content));
}

function buildDefaultContent() {
  const base = {};

  SECTIONS.forEach((section) => {
    section.fields.forEach((field) => {
      if (getByPath(base, field.path) == null) {
        setByPath(base, field.path, '');
      }
    });

    (section.repeaters || []).forEach((repeater) => {
      if (getByPath(base, repeater.path) == null) {
        const count = Math.max(0, repeater.minItems || 0);
        const items = Array.from({ length: count }, () => repeater.createItem());
        setByPath(base, repeater.path, items);
      }
    });
  });

  return base;
}

function mergeMissingFields(target, fallback) {
  if (!target || typeof target !== 'object' || Array.isArray(target)) {
    return cloneContent(fallback);
  }

  const next = cloneContent(target);

  function walkObject(obj, prefix = '') {
    Object.keys(obj || {}).forEach((key) => {
      const value = obj[key];
      const path = prefix ? `${prefix}.${key}` : key;

      if (Array.isArray(value)) {
        if (getByPath(next, path) == null) {
          setByPath(next, path, cloneContent(value));
        }
        return;
      }

      if (value && typeof value === 'object') {
        walkObject(value, path);
        return;
      }

      if (getByPath(next, path) == null) {
        setByPath(next, path, value);
      }
    });
  }

  walkObject(fallback);
  return next;
}

async function fetchContentFromFile() {
  const candidates = ['/content/site.json', '../content/site.json', './content/site.json', '../../content/site.json'];

  for (const url of candidates) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      return await response.json();
    } catch {
      // try next candidate
    }
  }

  return null;
}

const SECTION_ICONS = {
  site: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
      <path d="M3.5 9.5h17" />
      <path d="M7.5 7h.01M11 7h.01" />
    </svg>
  ),
  hero: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19V8.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2V19" />
      <path d="M4 19h16" />
      <path d="m8 13 2.5-2.5L13 13l3-3 2 2" />
    </svg>
  ),
  portfolio: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7.5h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" />
      <path d="M4 12h16" />
    </svg>
  ),
  about: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19.2a7 7 0 0 1 14 0" />
    </svg>
  ),
  contact: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4.5 6.5h15a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16V8a1.5 1.5 0 0 1 1.5-1.5z" />
      <path d="m4 8 8 5 8-5" />
    </svg>
  )
};

const SECTIONS = [
  {
    id: 'site',
    label: 'Site',
    eyebrow: 'Search & Sharing',
    title: 'Site Settings',
    description: 'Control how the brand appears in search, social previews, and structured site metadata.',
    fields: [
      { path: 'seo.title', label: 'Site Title', type: 'text', size: 'half' },
      { path: 'seo.siteName', label: 'Site Name', type: 'text', size: 'half' },
      { path: 'seo.description', label: 'Meta Description', type: 'textarea', rows: 4, size: 'full' },
      { path: 'seo.ogTitle', label: 'Open Graph Title', type: 'text', size: 'half' },
      { path: 'seo.locale', label: 'Locale', type: 'text', size: 'half' },
      { path: 'seo.ogDescription', label: 'Open Graph Description', type: 'textarea', rows: 4, size: 'full' },
      { path: 'seo.themeColor', label: 'Theme Color', type: 'text', size: 'half' }
    ]
  },
  {
    id: 'hero',
    label: 'Hero',
    eyebrow: 'Opening Section',
    title: 'Hero Content',
    description: 'Set the first impression on the homepage with supporting copy and micro-labels.',
    fields: [
      { path: 'hero.description', label: 'Hero Description', type: 'textarea', rows: 4, size: 'full' },
      { path: 'hero.filmStripLabel', label: 'Film Strip Label', type: 'text', size: 'half' },
      { path: 'hero.locationLabel', label: 'Location Label', type: 'text', size: 'half' }
    ]
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    eyebrow: 'Featured Work',
    title: 'Portfolio Story',
    description: 'Edit the selected works section and manage the six featured project cards used on the live site.',
    fields: [
      { path: 'portfolio.subtitle', label: 'Section Subtitle', type: 'text', size: 'half' },
      { path: 'portfolio.footerTitle', label: 'Footer Title', type: 'text', size: 'half' },
      { path: 'portfolio.footerLinkLabel', label: 'Footer Link Label', type: 'text', size: 'full' }
    ],
    repeaters: [
      {
        key: 'projects',
        path: 'portfolio.projects',
        label: 'Featured Projects',
        helper: 'The homepage currently renders the first 6 project cards.',
        minItems: 6,
        maxItems: 6,
        titleField: 'titleHtml',
        fields: [
          { path: 'category', label: 'Category', type: 'text', size: 'half' },
          { path: 'year', label: 'Year', type: 'text', size: 'half' },
          { path: 'titleHtml', label: 'Title HTML', type: 'text', size: 'full' },
          { path: 'location', label: 'Location Label', type: 'text', size: 'half' },
          { path: 'imageAlt', label: 'Image Alt', type: 'text', size: 'half' },
          { path: 'image', label: 'Image Path or URL', type: 'text', size: 'full' },
          { path: 'description', label: 'Description', type: 'textarea', rows: 4, size: 'full' }
        ],
        createItem: () => ({
          category: '',
          titleHtml: '',
          location: '',
          year: '',
          description: '',
          image: '',
          imageAlt: ''
        })
      }
    ]
  },
  {
    id: 'about',
    label: 'About',
    eyebrow: 'Legacy Section',
    title: 'About & Trust',
    description: 'Shape the story, workshop message, and supporting proof points that build trust on the homepage.',
    fields: [
      { path: 'about.watermarkPrimary', label: 'Watermark Primary', type: 'text', size: 'half' },
      { path: 'about.watermarkSecondary', label: 'Watermark Secondary', type: 'text', size: 'half' },
      { path: 'about.kicker', label: 'Kicker', type: 'text', size: 'full' },
      { path: 'about.lead', label: 'Lead Paragraph', type: 'textarea', rows: 4, size: 'full' },
      { path: 'about.workshopLabel', label: 'Workshop Label', type: 'text', size: 'half' },
      { path: 'about.image', label: 'Workshop Image', type: 'text', size: 'half' },
      { path: 'about.imageAlt', label: 'Workshop Image Alt', type: 'text', size: 'full' },
      { path: 'about.workshopValue', label: 'Workshop Value', type: 'textarea', rows: 3, size: 'full' },
      { path: 'about.ethos', label: 'Workshop Ethos', type: 'textarea', rows: 5, size: 'full' }
    ],
    repeaters: [
      {
        key: 'pillars',
        path: 'about.pillars',
        label: 'Pillars',
        helper: 'These cards support the trust narrative in the About section.',
        minItems: 3,
        maxItems: 3,
        titleField: 'titleHtml',
        fields: [
          { path: 'titleHtml', label: 'Title HTML', type: 'text', size: 'full' },
          { path: 'description', label: 'Description', type: 'textarea', rows: 4, size: 'full' }
        ],
        createItem: () => ({
          titleHtml: '',
          description: ''
        })
      },
      {
        key: 'metrics',
        path: 'about.metrics',
        label: 'Metrics',
        helper: 'These values appear as quick proof points beneath the story.',
        minItems: 3,
        maxItems: 3,
        titleField: 'value',
        fields: [
          { path: 'value', label: 'Value', type: 'text', size: 'half' },
          { path: 'label', label: 'Label', type: 'textarea', rows: 3, size: 'half' }
        ],
        createItem: () => ({
          value: '',
          label: ''
        })
      }
    ]
  },
  {
    id: 'contact',
    label: 'Contact',
    eyebrow: 'Direct Inquiries',
    title: 'Contact Details',
    description: 'Keep every inquiry point current, from phone and WhatsApp through footer contact copy.',
    fields: [
      { path: 'contact.email', label: 'Email', type: 'text', size: 'half' },
      { path: 'contact.phone', label: 'Phone Label', type: 'text', size: 'half' },
      { path: 'contact.phoneHref', label: 'Phone Href', type: 'text', size: 'half' },
      { path: 'contact.whatsappLabel', label: 'WhatsApp Label', type: 'text', size: 'half' },
      { path: 'contact.whatsappHref', label: 'WhatsApp Href', type: 'text', size: 'full' },
      { path: 'contact.footerCopy', label: 'Footer Copy', type: 'text', size: 'full' }
    ]
  }
];

function getByPath(object, path) {
  return path.split('.').reduce((acc, segment) => {
    if (acc == null) return undefined;
    const key = Number.isNaN(Number(segment)) ? segment : Number(segment);
    return acc[key];
  }, object);
}

function setByPath(object, path, value) {
  const segments = path.split('.');
  let cursor = object;

  segments.forEach((segment, index) => {
    const key = Number.isNaN(Number(segment)) ? segment : Number(segment);
    const isLast = index === segments.length - 1;

    if (isLast) {
      cursor[key] = value;
      return;
    }

    if (cursor[key] == null) {
      const nextKey = segments[index + 1];
      cursor[key] = Number.isNaN(Number(nextKey)) ? {} : [];
    }

    cursor = cursor[key];
  });
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const raw = await response.text();
  let payload = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || raw || `Request failed (${response.status}).`);
  }
  return payload || {};
}

async function fetchJsonWithFallback(urls, options) {
  let lastError = null;
  for (const url of urls) {
    try {
      return await fetchJson(url, options);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Request failed.');
}

function cloneContent(content) {
  return JSON.parse(JSON.stringify(content));
}

function stripHtml(value) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function countSectionFields(section, content) {
  let count = section.fields.length;

  (section.repeaters || []).forEach((repeater) => {
    const items = getByPath(content, repeater.path) || [];
    count += items.length * repeater.fields.length;
  });

  return count;
}

function SidebarItem({ section, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-transparent px-4 py-3 text-left transition-all duration-200',
        active
          ? 'bg-accentSoft text-ink shadow-glow'
          : 'text-zinc-300 hover:border-white/10 hover:bg-white/[0.03] hover:text-white'
      ].join(' ')}
    >
      <span className={['absolute inset-y-2 left-0 w-1 rounded-r-full transition-all', active ? 'bg-accent' : 'bg-transparent group-hover:bg-white/10'].join(' ')} />
      <span className={['flex h-10 w-10 items-center justify-center rounded-2xl border transition-all', active ? 'border-accent/30 bg-accent/15 text-accent' : 'border-white/10 bg-white/[0.03] text-zinc-400'].join(' ')}>
        {SECTION_ICONS[section.id]}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{section.label}</span>
        <span className="block text-xs text-zinc-500">{section.eyebrow}</span>
      </span>
    </button>
  );
}

function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-white/10 bg-white/[0.04] text-zinc-300',
    accent: 'border-accent/30 bg-accentSoft text-accent',
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    danger: 'border-red-500/20 bg-red-500/10 text-red-300'
  };

  return (
    <span className={['inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase', tones[tone]].join(' ')}>
      {children}
    </span>
  );
}

function FloatingField({ label, value, onChange, type = 'text', rows = 4 }) {
  const [focused, setFocused] = useState(false);
  const active = focused || Boolean(String(value || '').length);
  const isTextarea = type === 'textarea';
  const baseClasses = 'peer w-full rounded-2xl border border-white/10 bg-field px-4 pb-3 pt-6 text-sm text-ink outline-none transition duration-200 placeholder:text-zinc-500 focus:border-accent/70 focus:ring-4 focus:ring-accent/10';

  return (
    <label className="group relative block">
      {isTextarea ? (
        <textarea
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={[baseClasses, 'min-h-[120px] resize-y'].join(' ')}
          placeholder={active ? '' : ' '}
        />
      ) : (
        <input
          type={type}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={baseClasses}
          placeholder={active ? '' : ' '}
        />
      )}
      <span
        className={[
          'pointer-events-none absolute left-4 transition-all duration-200',
          active ? 'top-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent' : 'top-1/2 -translate-y-1/2 text-sm text-zinc-500'
        ].join(' ')}
      >
        {label}
      </span>
    </label>
  );
}

function FieldGrid({ fields, content, onFieldChange }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {fields.map((field) => (
        <div key={field.path} className={field.size === 'full' ? 'md:col-span-2' : ''}>
          <FloatingField
            label={field.label}
            type={field.type}
            rows={field.rows}
            value={getByPath(content, field.path)}
            onChange={(nextValue) => onFieldChange(field.path, nextValue)}
          />
        </div>
      ))}
    </div>
  );
}

function DragHandleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <circle cx="8" cy="6.5" r="1.2" />
      <circle cx="8" cy="12" r="1.2" />
      <circle cx="8" cy="17.5" r="1.2" />
      <circle cx="16" cy="6.5" r="1.2" />
      <circle cx="16" cy="12" r="1.2" />
      <circle cx="16" cy="17.5" r="1.2" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={['h-4 w-4 transition-transform duration-200', open ? 'rotate-180' : 'rotate-0'].join(' ')}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function RepeaterCard({
  repeater,
  items,
  onUpdateItem,
  onReorder,
  onRemove,
  onAdd,
  collapsed,
  onToggle,
  dragState,
  setDragState
}) {
  const canAdd = items.length < repeater.maxItems;

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.02] p-4 md:p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{repeater.label}</div>
          <p className="mt-2 text-sm text-zinc-400">{repeater.helper}</p>
        </div>
        <Badge tone="accent">{items.length} items</Badge>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const isOpen = collapsed[`${repeater.key}-${index}`] !== false;
          const titleSource = repeater.titleField ? stripHtml(item[repeater.titleField]) : '';
          const title = titleSource || `${repeater.label.slice(0, -1) || 'Item'} ${index + 1}`;
          const removeDisabled = items.length <= repeater.minItems;

          return (
            <article
              key={`${repeater.key}-${index}`}
              draggable
              onDragStart={() => setDragState({ repeaterKey: repeater.key, index })}
              onDragOver={(event) => {
                if (dragState?.repeaterKey === repeater.key) {
                  event.preventDefault();
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (dragState?.repeaterKey === repeater.key && dragState.index !== index) {
                  onReorder(repeater.path, dragState.index, index);
                }
                setDragState(null);
              }}
              onDragEnd={() => setDragState(null)}
              className="overflow-hidden rounded-[24px] border border-white/10 bg-panel transition-all duration-200 hover:border-accent/20 hover:bg-white/[0.045]"
            >
              <div className="flex flex-col gap-3 border-b border-white/8 px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 cursor-grab items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-400 active:cursor-grabbing">
                    <DragHandleIcon />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{title}</div>
                    <div className="text-xs text-zinc-500">Item {index + 1}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onRemove(repeater.path, index)}
                    disabled={removeDisabled}
                    className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:border-red-400/30 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggle(`${repeater.key}-${index}`)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-accent/30 hover:text-white"
                  >
                    {isOpen ? 'Collapse' : 'Expand'}
                    <ChevronIcon open={isOpen} />
                  </button>
                </div>
              </div>

              <div
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
                    {repeater.fields.map((field) => (
                      <div key={`${repeater.path}-${index}-${field.path}`} className={field.size === 'full' ? 'md:col-span-2' : ''}>
                        <FloatingField
                          label={field.label}
                          type={field.type}
                          rows={field.rows}
                          value={item[field.path]}
                          onChange={(nextValue) => onUpdateItem(repeater.path, index, field.path, nextValue)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        <button
          type="button"
          onClick={() => canAdd && onAdd(repeater.path, repeater.createItem())}
          disabled={!canAdd}
          className={[
            'flex w-full items-center justify-center rounded-[24px] border border-dashed px-5 py-5 text-sm font-semibold transition-all duration-200',
            canAdd
              ? 'border-accent/40 bg-accent/5 text-accent hover:bg-accent/10 hover:text-amber-200'
              : 'cursor-not-allowed border-white/10 bg-white/[0.02] text-zinc-500'
          ].join(' ')}
        >
          {canAdd ? `+ Add ${repeater.label.slice(0, -1) || 'Item'}` : `Maximum of ${repeater.maxItems} items in use`}
        </button>
      </div>
    </section>
  );
}

function App() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [sessionUser, setSessionUser] = useState('');
  const [content, setContent] = useState(null);
  const [initialSnapshot, setInitialSnapshot] = useState('');
  const [status, setStatus] = useState({ message: 'Checking session...', tone: 'neutral' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const [dragState, setDragState] = useState(null);
  const sectionRefs = useRef({});

  const serialized = useMemo(() => (content ? JSON.stringify(content) : ''), [content]);
  const isDirty = Boolean(content) && serialized !== initialSnapshot;
  const activeConfig = SECTIONS.find((section) => section.id === activeSection) || SECTIONS[0];
  const fieldCount = content ? countSectionFields(activeConfig, content) : 0;

  useEffect(() => {
    async function init() {
      try {
        const cmsBasePath = getCmsBasePath();
        const localMode = isLocalMode();
        let session = null;
        try {
          session = await fetchJsonWithFallback(['/api/session', '/api/session.js']);
        } catch {
          session = null;
        }
        const localSession = getLocalSession();

        if (!session?.cmsAuthenticated && !localSession?.cmsAuthenticated) {
          window.location.replace(`${cmsBasePath}/`);
          return;
        }

        let nextContent = null;
        try {
          nextContent = await fetchJsonWithFallback(['/api/content', '/api/content.js']);
        } catch {
          const cached = readLocalContentFallback();
          if (cached) {
            nextContent = cached;
          } else {
            nextContent = await fetchContentFromFile();
          }

          if (!nextContent) {
            nextContent = buildDefaultContent();
          }
        }
        nextContent = mergeMissingFields(nextContent, buildDefaultContent());
        setSessionUser(session?.user || localSession?.user || 'Local admin');
        setContent(nextContent);
        setInitialSnapshot(JSON.stringify(nextContent));
        writeLocalContentFallback(nextContent);
        setStatus({
          message: localMode
            ? 'Local mode active. Changes save to browser storage when API is unavailable.'
            : 'Content loaded. Changes save directly to GitHub and trigger the Vercel redeploy flow.',
          tone: 'success'
        });
      } catch (error) {
        setStatus({ message: error.message || 'Failed to load CMS.', tone: 'danger' });
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  function updateField(path, value) {
    setContent((current) => {
      const next = cloneContent(current);
      setByPath(next, path, value);
      return next;
    });
  }

  function updateRepeaterItem(arrayPath, index, fieldPath, value) {
    setContent((current) => {
      const next = cloneContent(current);
      const items = getByPath(next, arrayPath) || [];
      if (!items[index]) return current;
      items[index][fieldPath] = value;
      return next;
    });
  }

  function addRepeaterItem(arrayPath, itemTemplate) {
    setContent((current) => {
      const next = cloneContent(current);
      const items = getByPath(next, arrayPath) || [];
      items.push(itemTemplate);
      setByPath(next, arrayPath, items);
      return next;
    });
  }

  function removeRepeaterItem(arrayPath, index) {
    setContent((current) => {
      const next = cloneContent(current);
      const items = [...(getByPath(next, arrayPath) || [])];
      items.splice(index, 1);
      setByPath(next, arrayPath, items);
      return next;
    });
  }

  function reorderRepeater(arrayPath, fromIndex, toIndex) {
    setContent((current) => {
      const next = cloneContent(current);
      const items = [...(getByPath(next, arrayPath) || [])];
      const [moved] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, moved);
      setByPath(next, arrayPath, items);
      return next;
    });
  }

  function toggleCard(key) {
    setCollapsed((current) => ({
      ...current,
      [key]: current[key] === false ? true : false
    }));
  }

  async function handleSave() {
    if (!content || saving) return;

    try {
      setSaving(true);
      setStatus({ message: 'Saving changes to GitHub...', tone: 'accent' });

      try {
        await fetchJsonWithFallback(['/api/content', '/api/content.js'], {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(content)
        });
      } catch {
        writeLocalContentFallback(content);
        const nextSnapshot = JSON.stringify(content);
        setInitialSnapshot(nextSnapshot);
        setStatus({
          message: 'Saved locally in your browser (API not available in local mode).',
          tone: 'success'
        });
        return;
      }

      const nextSnapshot = JSON.stringify(content);
      setInitialSnapshot(nextSnapshot);
      setStatus({
        message: 'Saved. GitHub has been updated and Vercel should redeploy shortly.',
        tone: 'success'
      });
    } catch (error) {
      setStatus({ message: error.message || 'Failed to save content.', tone: 'danger' });
    } finally {
      setSaving(false);
    }
  }

  async function handleSyncFromFile() {
    try {
      setStatus({ message: 'Syncing from content/site.json...', tone: 'accent' });
      const remoteContent = await fetchContentFromFile();
      if (!remoteContent) throw new Error('Could not load content/site.json from local paths.');
      const synced = mergeMissingFields(remoteContent, buildDefaultContent());
      setContent(synced);
      setInitialSnapshot(JSON.stringify(synced));
      writeLocalContentFallback(synced);
      setStatus({ message: 'Synced from content/site.json.', tone: 'success' });
    } catch (error) {
      setStatus({ message: error.message || 'Failed to sync from file.', tone: 'danger' });
    }
  }

  function jumpToSection(sectionId) {
    setActiveSection(sectionId);
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="min-h-screen bg-grain">
      <div className="mx-auto flex min-h-screen max-w-[1700px] flex-col lg:flex-row">
        <aside className="border-b border-white/8 bg-black/20 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:w-[320px] lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col px-4 py-5 md:px-6 lg:px-7">
            <div className="mb-5 flex items-center justify-between lg:block">
              <div>
                <div className="font-display text-3xl tracking-[0.08em] text-white md:text-4xl">ARABESQUE</div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">Content Studio</div>
              </div>
              <Badge tone={isDirty ? 'accent' : 'neutral'}>{isDirty ? 'Unsaved' : 'Synced'}</Badge>
            </div>

            <p className="hidden text-sm leading-7 text-zinc-400 lg:block">
              A tailored content workspace for the live marketing site, with a calmer editing flow and Git-backed publishing.
            </p>

            <nav className="mt-5 hidden space-y-2 lg:block">
              {SECTIONS.map((section) => (
                <SidebarItem
                  key={section.id}
                  section={section}
                  active={activeSection === section.id}
                  onClick={() => jumpToSection(section.id)}
                />
              ))}
            </nav>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => jumpToSection(section.id)}
                  className={[
                    'whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition',
                    activeSection === section.id
                      ? 'border-accent/30 bg-accentSoft text-accent'
                      : 'border-white/10 bg-white/[0.03] text-zinc-300'
                  ].join(' ')}
                >
                  {section.label}
                </button>
              ))}
            </div>

            <div className="mt-auto hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 lg:block">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Session</div>
              <div className="mt-3 text-sm font-medium text-white">{sessionUser || 'Checking access...'}</div>
              <a
                href="/api/auth/logout"
                className="mt-5 inline-flex items-center rounded-full border border-accent/30 bg-accentSoft px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/15"
              >
                Log Out
              </a>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 pb-28 pt-5 md:px-6 lg:px-10 lg:pt-8">
          <div className="mx-auto max-w-6xl">
            <header className="mb-6 rounded-[32px] border border-white/8 bg-black/20 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">{activeConfig.eyebrow}</div>
                  <div>
                    <h1 className="font-display text-4xl text-white md:text-5xl">{activeConfig.title}</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">{activeConfig.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="accent">{fieldCount} fields</Badge>
                  <Badge tone={isDirty ? 'accent' : 'success'}>{isDirty ? 'Pending changes' : 'All changes saved'}</Badge>
                </div>
              </div>

              <div
                className={[
                  'mt-5 rounded-2xl border px-4 py-3 text-sm transition',
                  status.tone === 'danger'
                    ? 'border-red-500/20 bg-red-500/10 text-red-200'
                    : status.tone === 'success'
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
                      : status.tone === 'accent'
                        ? 'border-accent/25 bg-accentSoft text-amber-100'
                        : 'border-white/10 bg-white/[0.04] text-zinc-300'
                ].join(' ')}
              >
                {status.message}
              </div>
            </header>

            {loading ? (
              <div className="rounded-[32px] border border-white/8 bg-panel p-8 text-zinc-400">Loading dashboard...</div>
            ) : !content ? (
              <div className="rounded-[32px] border border-red-500/20 bg-red-500/10 p-8 text-red-200">
                The dashboard could not load the site content. Refresh the page or re-authenticate.
              </div>
            ) : (
              <div className="space-y-8">
                {SECTIONS.map((section) => (
                  <section
                    key={section.id}
                    ref={(node) => {
                      sectionRefs.current[section.id] = node;
                    }}
                    className={[
                      'rounded-[32px] border p-5 transition-all duration-300 md:p-7',
                      activeSection === section.id
                        ? 'border-accent/20 bg-panel shadow-glow'
                        : 'border-white/8 bg-panel/90'
                    ].join(' ')}
                  >
                    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{section.label}</div>
                        <h2 className="mt-2 text-2xl font-semibold text-white">{section.title}</h2>
                      </div>
                      <Badge tone="neutral">{countSectionFields(section, content)} fields</Badge>
                    </div>

                    <FieldGrid fields={section.fields} content={content} onFieldChange={updateField} />

                    {(section.repeaters || []).length > 0 && (
                      <div className="mt-6 space-y-5">
                        {section.repeaters.map((repeater) => (
                          <RepeaterCard
                            key={repeater.key}
                            repeater={repeater}
                            items={getByPath(content, repeater.path) || []}
                            onUpdateItem={updateRepeaterItem}
                            onReorder={reorderRepeater}
                            onRemove={removeRepeaterItem}
                            onAdd={addRepeaterItem}
                            collapsed={collapsed}
                            onToggle={toggleCard}
                            dragState={dragState}
                            setDragState={setDragState}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <button
        type="button"
        onClick={handleSyncFromFile}
        className="fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-full border border-white/20 bg-panel px-5 py-3 text-sm font-semibold text-zinc-200 shadow-2xl transition hover:border-accent/40 hover:text-white md:bottom-8 md:left-8"
      >
        Sync From File
      </button>

      <button
        type="button"
        onClick={handleSave}
        disabled={!content || saving || !isDirty}
        className={[
          'fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-full px-6 py-4 text-sm font-semibold shadow-2xl transition-all duration-200 md:bottom-8 md:right-8',
          !content || saving || !isDirty
            ? 'cursor-not-allowed bg-zinc-700 text-zinc-300'
            : 'bg-accent text-obsidian hover:-translate-y-0.5 hover:bg-amber-300'
        ].join(' ')}
      >
        <span className={saving ? 'inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-obsidian/80' : 'inline-block h-2.5 w-2.5 rounded-full bg-obsidian'} />
        {saving ? 'Saving Changes...' : isDirty ? 'Save Changes' : 'All Changes Saved'}
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
