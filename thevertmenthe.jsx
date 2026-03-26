import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   TheVertMenthe — Minimalist Artist Portfolio
   ═══════════════════════════════════════════════════════════════ */

// ── Placeholder artwork data (replace with real artwork) ──
const ARTWORKS = [
  { id: 1, title: "Ephemeral Garden", category: "Drawing", year: "2024", src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80" },
  { id: 2, title: "Silent Waves", category: "Painting", year: "2024", src: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&q=80" },
  { id: 3, title: "Urban Fragments", category: "Mixed Media", year: "2023", src: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80" },
  { id: 4, title: "Nocturne in Blue", category: "Drawing", year: "2023", src: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80" },
  { id: 5, title: "Verdant Dreams", category: "Painting", year: "2024", src: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80" },
  { id: 6, title: "Whispered Lines", category: "Drawing", year: "2023", src: "https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=800&q=80" },
  { id: 7, title: "Terracotta Bloom", category: "Painting", year: "2024", src: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80" },
  { id: 8, title: "Abstract Meridian", category: "Mixed Media", year: "2023", src: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80" },
  { id: 9, title: "Mint Passage", category: "Drawing", year: "2024", src: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80" },
  { id: 10, title: "Solstice", category: "Painting", year: "2024", src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80" },
  { id: 11, title: "Liminal Space", category: "Mixed Media", year: "2023", src: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=800&q=80" },
  { id: 12, title: "Emerald Dusk", category: "Drawing", year: "2024", src: "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800&q=80" },
];

const CATEGORIES = ["All", "Drawing", "Painting", "Mixed Media"];

// ── Intersection Observer hook ──
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ── Animated counter ──
function AnimatedCounter({ end, duration = 2000, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useInView(0.5);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// ── FadeIn wrapper ──
function FadeIn({ children, delay = 0, className = "", direction = "up" }) {
  const [ref, v] = useInView(0.08);
  const transforms = {
    up: "translateY(40px)", down: "translateY(-40px)",
    left: "translateX(40px)", right: "translateX(-40px)", none: "none"
  };
  return (
    <div ref={ref} className={className} style={{
      opacity: v ? 1 : 0,
      transform: v ? "none" : transforms[direction],
      transition: `opacity 0.8s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.8s cubic-bezier(.16,1,.3,1) ${delay}s`
    }}>
      {children}
    </div>
  );
}

// ── Horizontal line with animation ──
function AnimatedLine() {
  const [ref, visible] = useInView(0.3);
  return (
    <div ref={ref} className="w-full h-px bg-white/10 relative overflow-hidden">
      <div className={`absolute inset-y-0 left-0 bg-white/30 line-reveal ${visible ? "visible" : ""}`} />
    </div>
  );
}

// ══════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════
function Navigation({ currentSection, onNavigate, menuOpen, setMenuOpen }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Fixed top bar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "backdrop-blur-md bg-[#0a0a0a]/80" : ""}`}>
        <div className="flex items-center justify-between px-6 md:px-12 py-5">
          {/* Logo */}
          <button onClick={() => onNavigate("home")} className="cursor-blend">
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-xl md:text-2xl font-light tracking-[0.2em] uppercase text-white">
              TheVert<span className="text-emerald-400">Menthe</span>
            </h1>
          </button>

          {/* Breadcrumb (desktop) */}
          <nav className="hidden md:flex items-center gap-2 text-xs tracking-widest uppercase text-white/40">
            <button onClick={() => onNavigate("home")} className="hover:text-white/80 transition-colors">Home</button>
            <span>/</span>
            <button onClick={() => onNavigate("gallery")} className="hover:text-white/80 transition-colors">Gallery</button>
            <span>/</span>
            <button onClick={() => onNavigate("about")} className="hover:text-white/80 transition-colors">About</button>
            <span>/</span>
            <button onClick={() => onNavigate("contact")} className="hover:text-white/80 transition-colors">Contact</button>
          </nav>

          {/* Drawings counter + menu toggle */}
          <div className="flex items-center gap-6">
            <span className="hidden md:inline text-xs tracking-widest text-white/30 uppercase">
              {ARTWORKS.length} drawings
            </span>
            <button onClick={() => setMenuOpen(!menuOpen)}
                    className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 group">
              <span className={`block w-6 h-px bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[3.5px]" : "group-hover:w-8"}`} />
              <span className={`block w-6 h-px bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[3.5px]" : "group-hover:w-4"}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl menu-enter">
          <div className="h-full flex flex-col justify-center items-center gap-2">
            {["Home", "Gallery", "About", "Contact"].map((item, i) => (
              <button key={item}
                      onClick={() => { onNavigate(item.toLowerCase()); setMenuOpen(false); }}
                      className="group relative py-4 px-8"
                      style={{ animation: `textReveal 0.6s cubic-bezier(.16,1,.3,1) ${0.1 + i * 0.08}s both` }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      className="text-5xl md:text-7xl font-light tracking-wider text-white/80 group-hover:text-emerald-400 transition-colors duration-300">
                  {item}
                </span>
                <span className="absolute bottom-2 left-8 right-8 h-px bg-emerald-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </button>
            ))}
            <div className="mt-12 flex items-center gap-8 text-xs tracking-widest uppercase text-white/30">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">Instagram</a>
              <span>·</span>
              <a href="mailto:hello@thevertmenthe.fr" className="hover:text-emerald-400 transition-colors">Contact me</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ══════════════════════════════════════════════
//  HERO SECTION
// ══════════════════════════════════════════════
function Hero({ onNavigate }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    setMousePos({
      x: (e.clientX / window.innerWidth - 0.5) * 20,
      y: (e.clientY / window.innerHeight - 0.5) * 20,
    });
  }, []);

  return (
    <section id="home" onMouseMove={handleMouseMove}
             className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-[#0a0a0a] to-[#0a0a0a]" />

      {/* Floating circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl"
             style={{ transform: `translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)` }} />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-emerald-400/5 blur-3xl"
             style={{ transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)` }} />
      </div>

      <div className="relative z-10 text-center px-6">
        <FadeIn delay={0.2}>
          <p className="text-xs md:text-sm tracking-[0.4em] uppercase text-emerald-400/80 mb-8">
            Art & Illustration Portfolio
          </p>
        </FadeIn>

        <FadeIn delay={0.4}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }}
              className="text-6xl sm:text-8xl md:text-[10rem] font-light leading-[0.85] tracking-tight text-white">
            TheVert
            <br />
            <span className="text-emerald-400 italic font-light">Menthe</span>
          </h2>
        </FadeIn>

        <FadeIn delay={0.7}>
          <p className="mt-8 text-sm md:text-base text-white/40 max-w-md mx-auto leading-relaxed font-light">
            Exploring the boundaries between organic forms and abstract expression through drawing, painting, and mixed media.
          </p>
        </FadeIn>

        <FadeIn delay={0.9}>
          <button onClick={() => onNavigate("gallery")}
                  className="mt-12 group inline-flex items-center gap-3 text-xs tracking-[0.3em] uppercase text-white/60 hover:text-emerald-400 transition-colors duration-500">
            <span>View Gallery</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="group-hover:translate-x-2 transition-transform duration-500">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </FadeIn>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <span className="text-[10px] tracking-[0.3em] uppercase text-white/20">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-emerald-400/50" style={{ animation: "marquee 2s ease-in-out infinite alternate" }} />
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════
//  MARQUEE STRIP
// ══════════════════════════════════════════════
function MarqueeStrip() {
  const text = "DRAWINGS · PAINTINGS · ILLUSTRATIONS · MIXED MEDIA · ART PRINTS · COMMISSIONS · ";
  return (
    <div className="py-6 border-y border-white/5 overflow-hidden">
      <div className="marquee-track flex whitespace-nowrap">
        {[...Array(4)].map((_, i) => (
          <span key={i} className="text-xs tracking-[0.5em] uppercase text-white/15 mx-4">{text}</span>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
//  GALLERY SECTION
// ══════════════════════════════════════════════
function Gallery() {
  const [filter, setFilter] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null);

  const filtered = filter === "All" ? ARTWORKS : ARTWORKS.filter(a => a.category === filter);

  return (
    <section id="gallery" className="px-6 md:px-12 py-24 md:py-32">
      <FadeIn>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <p className="text-xs tracking-[0.4em] uppercase text-emerald-400/80 mb-3">Selected Works</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-4xl md:text-6xl font-light text-white">
              Gallery
            </h2>
          </div>
          <div className="flex gap-4">
            {CATEGORIES.map(cat => (
              <button key={cat}
                      onClick={() => setFilter(cat)}
                      className={`text-xs tracking-widest uppercase transition-all duration-300 pb-1 border-b ${
                        filter === cat
                          ? "text-emerald-400 border-emerald-400"
                          : "text-white/30 border-transparent hover:text-white/60"
                      }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Masonry-like grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filtered.map((art, i) => (
          <FadeIn key={art.id} delay={i * 0.06}>
            <div className={`gallery-item rounded-sm ${i % 5 === 0 ? "md:row-span-2" : ""}`}
                 onClick={() => setSelectedImage(art)}>
              <img src={art.src} alt={art.title} loading="lazy"
                   className={`w-full object-cover ${i % 5 === 0 ? "h-[500px] md:h-full" : "h-[300px] md:h-[350px]"}`} />
              <div className="overlay">
                <div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif" }}
                     className="text-xl text-white font-light">{art.title}</p>
                  <p className="text-xs text-white/50 tracking-widest uppercase mt-1">{art.category} · {art.year}</p>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
             onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)}
                    className="absolute -top-12 right-0 text-white/50 hover:text-white text-sm tracking-widest uppercase transition-colors">
              Close ×
            </button>
            <img src={selectedImage.src} alt={selectedImage.title}
                 className="w-full max-h-[80vh] object-contain" />
            <div className="mt-6 flex justify-between items-end">
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    className="text-2xl text-white font-light">{selectedImage.title}</h3>
                <p className="text-xs text-white/40 tracking-widest uppercase mt-1">
                  {selectedImage.category} · {selectedImage.year}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ══════════════════════════════════════════════
//  ABOUT SECTION
// ══════════════════════════════════════════════
function About() {
  return (
    <section id="about" className="px-6 md:px-12 py-24 md:py-32">
      <AnimatedLine />
      <div className="grid md:grid-cols-2 gap-16 md:gap-24 mt-16 md:mt-24">
        <FadeIn direction="right">
          <div>
            <p className="text-xs tracking-[0.4em] uppercase text-emerald-400/80 mb-3">About the Artist</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-4xl md:text-6xl font-light text-white leading-tight">
              Where nature<br />
              meets <span className="italic text-emerald-400">imagination</span>
            </h2>
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="flex flex-col gap-6">
            <p className="text-white/50 leading-relaxed font-light">
              TheVertMenthe is an artistic exploration rooted in the observation of organic forms —
              leaves unfurling, water flowing, light filtering through canopies. Each piece seeks to
              capture the fleeting moment where the natural world dissolves into abstraction.
            </p>
            <p className="text-white/50 leading-relaxed font-light">
              Working primarily with ink, watercolor, and mixed media, the collection spans drawings
              that whisper and paintings that sing. Every stroke is an invitation to look closer,
              to find the patterns hidden in the chaos of nature.
            </p>
            <div className="flex gap-12 mt-8">
              <div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif" }}
                   className="text-4xl text-emerald-400 font-light">
                  <AnimatedCounter end={ARTWORKS.length} />
                </p>
                <p className="text-xs text-white/30 tracking-widest uppercase mt-1">Artworks</p>
              </div>
              <div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif" }}
                   className="text-4xl text-emerald-400 font-light">
                  <AnimatedCounter end={3} />
                </p>
                <p className="text-xs text-white/30 tracking-widest uppercase mt-1">Mediums</p>
              </div>
              <div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif" }}
                   className="text-4xl text-emerald-400 font-light">
                  <AnimatedCounter end={2024} duration={1500} />
                </p>
                <p className="text-xs text-white/30 tracking-widest uppercase mt-1">Since</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════
//  FEATURED HORIZONTAL SCROLL
// ══════════════════════════════════════════════
function FeaturedScroll() {
  return (
    <section className="py-24">
      <FadeIn className="px-6 md:px-12 mb-10">
        <p className="text-xs tracking-[0.4em] uppercase text-emerald-400/80 mb-3">Featured</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-4xl md:text-5xl font-light text-white">Recent Works</h2>
      </FadeIn>
      <div className="horizontal-scroll pl-6 md:pl-12">
        {ARTWORKS.slice(0, 6).map((art, i) => (
          <FadeIn key={art.id} delay={i * 0.1} direction="left">
            <div className="gallery-item w-[320px] md:w-[420px] rounded-sm">
              <img src={art.src} alt={art.title} className="w-full h-[400px] md:h-[520px] object-cover" loading="lazy" />
              <div className="overlay">
                <div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif" }}
                     className="text-xl text-white font-light">{art.title}</p>
                  <p className="text-xs text-white/50 tracking-widest uppercase mt-1">{art.category}</p>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
        {/* Spacer */}
        <div className="w-6 md:w-12 flex-shrink-0" />
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════
//  CONTACT SECTION
// ══════════════════════════════════════════════
function Contact() {
  return (
    <section id="contact" className="px-6 md:px-12 py-24 md:py-32">
      <AnimatedLine />
      <div className="mt-16 md:mt-24 max-w-3xl mx-auto text-center">
        <FadeIn>
          <p className="text-xs tracking-[0.4em] uppercase text-emerald-400/80 mb-6">Get in Touch</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }}
              className="text-4xl md:text-7xl font-light text-white leading-tight">
            Let's create<br />something <span className="italic text-emerald-400">together</span>
          </h2>
          <p className="mt-8 text-white/40 font-light max-w-lg mx-auto leading-relaxed">
            Available for commissions, collaborations, and exhibitions.
            Reach out to discuss your vision.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="mailto:hello@thevertmenthe.fr"
               className="group inline-flex items-center gap-3 px-8 py-4 border border-emerald-400/30 rounded-full text-emerald-400 text-sm tracking-widest uppercase hover:bg-emerald-400 hover:text-black transition-all duration-500">
              <span>Contact me</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                   className="group-hover:translate-x-1 transition-transform duration-300">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer"
               className="inline-flex items-center gap-3 text-sm tracking-widest uppercase text-white/40 hover:text-white transition-colors duration-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              <span>@thevertmenthe</span>
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════
//  FOOTER
// ══════════════════════════════════════════════
function Footer() {
  return (
    <footer className="px-6 md:px-12 py-8 border-t border-white/5">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p style={{ fontFamily: "'Cormorant Garamond', serif" }}
           className="text-sm text-white/20 tracking-widest">
          TheVert<span className="text-emerald-400/40">Menthe</span> © 2024
        </p>
        <div className="flex items-center gap-6 text-xs tracking-widest uppercase text-white/20">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-emerald-400/60 transition-colors">Instagram</a>
          <a href="https://behance.net" target="_blank" rel="noreferrer" className="hover:text-emerald-400/60 transition-colors">Behance</a>
          <a href="mailto:hello@thevertmenthe.fr" className="hover:text-emerald-400/60 transition-colors">Email</a>
        </div>
      </div>
    </footer>
  );
}

// ══════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════
export default function TheVertMenthe() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState("home");

  const navigateTo = useCallback((section) => {
    setCurrentSection(section);
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Close menu on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="noise-overlay min-h-screen">
      <Navigation currentSection={currentSection} onNavigate={navigateTo}
                  menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Hero onNavigate={navigateTo} />
      <MarqueeStrip />
      <FeaturedScroll />
      <Gallery />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}
