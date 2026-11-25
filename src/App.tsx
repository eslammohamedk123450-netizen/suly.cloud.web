import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Robot } from './components/Robot';
import { BackgroundParticles } from './components/BackgroundParticles';
import { CursorGlow } from './components/CursorGlow';
import { i18n, Locale } from './i18n';

function App() {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('locale') as Locale) || 'ar';
    }
    return 'ar';
  });
  const [dir, setDir] = useState<'rtl' | 'ltr'>('rtl');
  const [robotMessage, setRobotMessage] = useState<string>('');
  const [showRobotMessage, setShowRobotMessage] = useState(false);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const t = i18n[locale];

  const toggleLocale = useCallback(() => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    setLocale(newLocale);
    setDir(newLocale === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('locale', newLocale);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const handleRobotClick = useCallback(() => {
    const message = t.robotGreeting;
    setRobotMessage(message);
    setShowRobotMessage(true);
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      setShowRobotMessage(false);
    }, 4000);
  }, [t.robotGreeting]);

  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const glow = document.querySelector('.cursor-glow') as HTMLElement;
    if (glow) {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
      glow.style.opacity = '1';
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <BackgroundParticles />
      <CursorGlow />
      <header className="header" role="banner">
        <div className="header__logo" onClick={() => scrollToSection('home')}>
          {t.logo}
        </div>
        <nav className="header__nav" role="navigation" aria-label="Main navigation">
          <a
            className="header__nav-link"
            href="#about"
            onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}
          >
            {t.navAbout}
          </a>
          <a
            className="header__nav-link"
            href="#services"
            onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}
          >
            {t.navServices}
          </a>
          <a
            className="header__nav-link"
            href="#projects"
            onClick={(e) => { e.preventDefault(); scrollToSection('projects'); }}
          >
            {t.navProjects}
          </a>
        </nav>
        <div className="header__actions">
          <button
            className="lang-toggle"
            onClick={toggleLocale}
            aria-label="Toggle language"
          >
            <span className={`lang-toggle__item ${locale === 'ar' ? 'lang-toggle__item--active' : ''}`}>
              {t.langAr}
            </span>
            <span className={`lang-toggle__item ${locale === 'en' ? 'lang-toggle__item--active' : ''}`}>
              {t.langEn}
            </span>
          </button>
          <button
            className="btn btn--primary"
            onClick={(e) => { createRipple(e); scrollToSection('contact'); }}
            aria-label={t.cta1}
          >
            {t.cta1}
          </button>
        </div>
      </header>

      <main id="home">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__content">
            <h1 id="hero-title" className="hero__title">
              {t.heroTitle}
            </h1>
            <p className="hero__subtitle">{t.heroSub}</p>
            <p className="hero__description">{t.heroDesc}</p>
            <div className="hero__cta-group">
              <motion.button
                className="btn btn--primary"
                onClick={(e) => { createRipple(e); scrollToSection('contact'); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={t.cta1}
              >
                {t.cta1}
              </motion.button>
              <motion.button
                className="btn btn--secondary"
                onClick={(e) => { createRipple(e); scrollToSection('projects'); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={t.cta2}
              >
                {t.cta2}
              </motion.button>
            </div>
          </div>
          <div className="hero__robot-container">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 45 }}
              style={{ width: '100%', height: '100%' }}
              onCreated={({ gl }) => { gl.setPixelRatio(Math.min(window.devicePixelRatio, 2)); }}
            >
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 10, 7]} intensity={1.2} />
              <directionalLight position={[-5, 5, -5]} intensity={0.5} />
              <Robot
                onClick={handleRobotClick}
                onMessageChange={(msg: string, show: boolean) => {
                  setRobotMessage(msg);
                  setShowRobotMessage(show);
                }}
                greeting={t.robotGreeting}
                locale={locale}
              />
            </Canvas>
            <AnimatePresence>
              {showRobotMessage && (
                <motion.div
                  className="speech-bubble speech-bubble--visible"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 8 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.3 }}
                  role="status"
                  aria-live="polite"
                >
                  {robotMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <section id="about" className="about" aria-labelledby="about-title">
          <div className="section-header">
            <h2 id="about-title" className="section-header__title">{t.about}</h2>
            <div className="section-header__divider" />
          </div>
          <p style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', color: 'var(--desc)', fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: '1.8' }}>
            {t.heroDesc}
          </p>
        </section>

        <section id="services" className="services" aria-labelledby="services-title">
          <div className="section-header">
            <h2 id="services-title" className="section-header__title">{t.services}</h2>
            <div className="section-header__divider" />
          </div>
          <div className="services__grid">
            {[
              { title: t.service1Title, desc: t.service1Desc },
              { title: t.service2Title, desc: t.service2Desc },
              { title: t.service3Title, desc: t.service3Desc },
              { title: t.service4Title, desc: t.service4Desc },
              { title: t.service5Title, desc: t.service5Desc },
              { title: t.service6Title, desc: t.service6Desc },
            ].map((service, index) => (
              <motion.article
                key={index}
                className="card"
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 40 }}
                viewport={{ once: true, margin: '-50px' }}
                whileHover={{ y: -8, scale: 1.02, borderColor: '#D4FF4F' }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="card__title">{service.title}</h3>
                <p className="card__description">{service.desc}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="projects" className="projects" aria-labelledby="projects-title">
          <div className="section-header">
            <h2 id="projects-title" className="section-header__title">{t.projects}</h2>
            <div className="section-header__divider" />
          </div>
          <div className="projects__grid">
            {[
              { title: t.project1Title, desc: t.project1Desc, icon: '🛒' },
              { title: t.project2Title, desc: t.project2Desc, icon: '🏥' },
              { title: t.project3Title, desc: t.project3Desc, icon: '💳' },
            ].map((project, index) => (
              <motion.article
                key={index}
                className="project-card"
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 40 }}
                viewport={{ once: true, margin: '-50px' }}
                whileHover={{ y: -8, scale: 1.02, borderColor: '#D4FF4F' }}
                transition={{ duration: 0.3 }}
              >
                <div className="project-card__image" aria-hidden="true">
                  {project.icon}
                </div>
                <div className="project-card__content">
                  <h3 className="project-card__title">{project.title}</h3>
                  <p className="project-card__description">{project.desc}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="contact" className="contact" aria-labelledby="contact-title">
          <div className="section-header">
            <h2 id="contact-title" className="section-header__title">{t.contact}</h2>
            <div className="section-header__divider" />
          </div>
          <div className="contact__buttons">
            <a
              href="https://wa.me/201093629700"
              target="_blank"
              rel="noopener noreferrer"
              className="contact__btn"
              aria-label={t.contactBtn1}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              {t.contactBtn1}
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61560793440078"
              target="_blank"
              rel="noopener noreferrer"
              className="contact__btn"
              aria-label={t.contactBtn2}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 011.141.195v3.325a8.623 8.623 0 00-.653-.036 26.805 26.805 0 00-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 00-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>
              </svg>
              {t.contactBtn2}
            </a>
          </div>
        </section>
      </main>

      <footer className="footer" role="contentinfo">
        <p className="footer__text">{t.footer}</p>
      </footer>
    </>
  );
}

export default App;