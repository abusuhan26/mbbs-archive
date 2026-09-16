import { useEffect, useMemo, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import * as THREE from "three";
import { ExternalLink, FileText, Moon, Search, Sun, ArrowUpRight, BookOpen, ShieldCheck, Sparkles, Menu, X } from "lucide-react";

type Subject = { name: string; code: string; count: number; description: string; link: string };

type Shelf = { id: string; label: string; kicker: string; description: string; subjects: Subject[]; accent: string };

const shelves: Shelf[] = [
  { id: "pre", label: "Pre-clinical", kicker: "Years 01—02", description: "The architecture of the human body, from first principles to living systems.", accent: "#e47d54", subjects: [
    { name: "Anatomy", code: "ANAT", count: 18, description: "Dissection guides, atlases, and regional anatomy quick sheets.", link: "https://drive.google.com/" },
    { name: "Physiology", code: "PHYS", count: 14, description: "Mechanisms, cycles, and exam-focused physiology notes.", link: "https://drive.google.com/" },
    { name: "Biochemistry", code: "BIOC", count: 12, description: "Metabolism maps, clinical correlations, and viva cards.", link: "https://drive.google.com/" },
  ] },
  { id: "para", label: "Para-clinical", kicker: "Years 02—03", description: "The bridge between foundational science and the language of disease.", accent: "#c39a4b", subjects: [
    { name: "Pathology", code: "PATH", count: 21, description: "Pattern libraries, specimen notes, and pathology revision PDFs.", link: "https://drive.google.com/" },
    { name: "Pharmacology", code: "PHAR", count: 17, description: "Drug cards, mechanisms, and adverse-effect memory maps.", link: "https://drive.google.com/" },
    { name: "Microbiology", code: "MICR", count: 16, description: "Organism profiles, lab workflows, and infection summaries.", link: "https://drive.google.com/" },
  ] },
  { id: "post", label: "Post-clinical", kicker: "Years 03—05", description: "Where every page becomes a patient, a pattern, and a decision.", accent: "#7f9b87", subjects: [
    { name: "Medicine", code: "MEDI", count: 28, description: "Ward-ready frameworks, clinical cases, and bedside essentials.", link: "https://drive.google.com/" },
    { name: "Surgery", code: "SURG", count: 24, description: "Procedures, differentials, and last-minute theatre notes.", link: "https://drive.google.com/" },
    { name: "Obstetrics & Gynaecology", code: "OBGY", count: 19, description: "Clinical pathways and concise reproductive health references.", link: "https://drive.google.com/" },
    { name: "Paediatrics", code: "PAED", count: 15, description: "Growth charts, common presentations, and paediatric pearls.", link: "https://drive.google.com/" },
  ] },
];

function Particles() {
  const dots = useMemo(() => Array.from({ length: 56 }, (_, i) => ({ left: `${(i * 37) % 100}%`, top: `${(i * 61) % 100}%`, delay: `${(i % 9) * 0.45}s`, size: i % 7 === 0 ? 3 : 1.5 })), []);
  return <div className="particles" aria-hidden="true">{dots.map((dot, i) => <i key={i} style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size, animationDelay: dot.delay }} />)}</div>;
}

function ThreeOrb() {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 10);
    camera.position.z = 3.4;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(160, 160);
    mount.appendChild(renderer.domElement);
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.78, 2), new THREE.MeshStandardMaterial({ color: 0xd9825b, roughness: 0.58, metalness: 0.08, flatShading: true }));
    const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(0.82, 1), new THREE.MeshBasicMaterial({ color: 0xf0b08f, wireframe: true, transparent: true, opacity: 0.28 }));
    group.add(mesh, wire);
    scene.add(group);
    scene.add(new THREE.AmbientLight(0xffe8d0, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 3.4);
    key.position.set(2, 2, 4);
    scene.add(key);
    let frame = 0;
    const loop = () => { group.rotation.x += 0.002; group.rotation.y += 0.005; renderer.render(scene, camera); frame = requestAnimationFrame(loop); };
    loop();
    return () => { cancelAnimationFrame(frame); renderer.dispose(); mesh.geometry.dispose(); wire.geometry.dispose(); (mesh.material as THREE.Material).dispose(); (wire.material as THREE.Material).dispose(); mount.removeChild(renderer.domElement); };
  }, []);
  return <div ref={mountRef} className="three-orb" aria-hidden="true" />;
}

function SubjectCard({ subject, accent, onPreview }: { subject: Subject; accent: string; onPreview: (s: Subject) => void }) {
  return <article className="subject-card" style={{ "--accent": accent } as React.CSSProperties}>
    <div className="card-top"><span className="subject-code">{subject.code}</span><span className="resource-count">{subject.count} files</span></div>
    <h3>{subject.name}</h3>
    <p>{subject.description}</p>
    <div className="card-actions"><button className="preview-button" onClick={() => onPreview(subject)}><FileText size={15} /> Preview</button><a href={subject.link} target="_blank" rel="noreferrer" aria-label={`Open ${subject.name} external resources`}><ArrowUpRight size={18} /></a></div>
  </article>;
}

export default function Home() {
  const [dark, setDark] = useState(true);
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<Subject | null>(null);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => { document.documentElement.classList.toggle("light-mode", !dark); animate(".hero-content > *", { translateY: [18, 0], opacity: [0, 1], delay: stagger(90), duration: 850, ease: "outExpo" }); }, [dark]);
  const visibleShelves = shelves.filter(s => active === "all" || active === s.id).map(s => ({ ...s, subjects: s.subjects.filter(x => `${x.name} ${x.description}`.toLowerCase().includes(query.toLowerCase())) })).filter(s => s.subjects.length);

  return <div className="app-shell"><Particles />
    <header className="site-header"><a className="brand" href="#top"><span className="brand-mark"><BookOpen size={17} /></span><span>MBBS <em>Archive</em></span></a><nav className={mobileNav ? "nav-links open" : "nav-links"}><a href="#library" onClick={() => setMobileNav(false)}>The library</a><a href="#about" onClick={() => setMobileNav(false)}>About</a><a href="#policies" onClick={() => setMobileNav(false)}>Policies</a></nav><div className="header-actions"><button className="mode-toggle" onClick={() => setDark(!dark)} aria-label="Toggle light and dark mode">{dark ? <Sun size={17} /> : <Moon size={17} />}</button><button className="menu-toggle" onClick={() => setMobileNav(!mobileNav)}>{mobileNav ? <X /> : <Menu />}</button></div></header>

    <main id="top"><section className="hero-section"><div className="hero-content"><div className="eyebrow"><span /> The student-built index <span /></div><h1>All your years.<br /><i>One quiet place.</i></h1><p className="hero-copy">A considered home for the books, notes, and links that carry you through five years of medicine.</p><div className="hero-cta"><a className="primary-button" href="#library">Open the archive <ArrowUpRight size={16} /></a><span className="hero-note">Curated for the long haul<br /><b>Est. 2024 · Batch 01</b></span></div></div><div className="orbit-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit-core"><ThreeOrb /><span>MB<br /><small>01</small></span></div><div className="orbit-label label-a">Read. Revise. Repeat.</div><div className="orbit-label label-b">Notes in orbit</div></div><div className="scroll-cue"><span /> Scroll to explore</div></section>

    <section className="intro-section" id="about"><div className="section-label"></div><div className="intro-grid"><h2>The syllabus is vast.<br /><i>Your system doesn't have to be.</i></h2><div><p>MBBS Archive brings scattered Google Drive folders, handwritten PDFs, and trusted tools into one calm, navigable index. No noise. Just the right resource, when you need it.</p><div className="stat-row"><div><strong>05</strong><span>years mapped</span></div><div><strong>03</strong><span>clinical eras</span></div><div><strong>∞</strong><span>late-night saves</span></div></div></div></div></section>

    <section className="library-section" id="library"><div className="library-heading"><div><div className="section-label"></div><h2>Choose your <i>chapter.</i></h2></div><div className="search-box"><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search subjects or notes" /></div></div><div className="filter-row">{[{ id: "all", label: "All years" }, ...shelves.map(s => ({ id: s.id, label: s.label }))].map(item => <button key={item.id} className={active === item.id ? "filter active" : "filter"} onClick={() => setActive(item.id)}>{item.label}</button>)}</div><div className="shelves">{visibleShelves.map(shelf => <div className="shelf" key={shelf.id}><div className="shelf-intro"><span className="shelf-kicker" style={{ color: shelf.accent }}>{shelf.kicker}</span><h3>{shelf.label}</h3><p>{shelf.description}</p></div><div className="subject-grid">{shelf.subjects.map(subject => <SubjectCard key={subject.name} subject={subject} accent={shelf.accent} onPreview={setPreview} />)}</div></div>)}</div>{!visibleShelves.length && <div className="empty-state">No notes found in this chapter. Try another search.</div>}</section>

    <section className="ad-section"><div className="ad-label">Advertisement</div><div className="ad-slot">A quiet space for a relevant resource</div></section>
    <section className="principles-section"><div className="section-label"></div><div className="principles-grid"><div><Sparkles size={22} /><h3>Less hunting.</h3><p>Spend your energy learning, not opening twelve tabs to find the same PDF.</p></div><div><ShieldCheck size={22} /><h3>More context.</h3><p>Every link comes with a short note so you know what you're opening before you leave.</p></div><div><BookOpen size={22} /><h3>Built to share.</h3><p>Pass the archive on to your batch. Add your own trusted resources over time.</p></div></div></section>
    </main>

    <footer id="policies"><div className="footer-brand"><a className="brand" href="#top"><span className="brand-mark"><BookOpen size={17} /></span><span>MBBS <em>Archive</em></span></a><p>A small index for a long journey.</p></div><div className="footer-links"><a href="#policies">Privacy</a><a href="#policies">Terms</a><a href="mailto:hello@mbbsarchive.example">Suggest a resource</a></div><div className="footer-meta">© 2024 MBBS Archive<br />Made for curious clinicians.</div></footer>

    {preview && <div className="modal-backdrop" onClick={() => setPreview(null)}><div className="preview-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setPreview(null)}><X size={17} /></button><span className="subject-code">{preview.code} / RESOURCE PREVIEW</span><h2>{preview.name}</h2><p>{preview.description}</p><div className="preview-sheet"><FileText size={19} /><div><strong>Archive preview</strong><span>Sample PDF index · {preview.count} linked files</span></div><span className="preview-pill">PDF</span></div><a className="primary-button" href={preview.link} target="_blank" rel="noreferrer">Open external resource <ExternalLink size={15} /></a><small>You'll be taken to the shared resource in a new tab.</small></div></div>}
  </div>;
}
