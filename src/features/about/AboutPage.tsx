import { ArrowDown, ArrowUpRight, Layers3, Palette, ScanLine } from 'lucide-react';
import { Link } from 'react-router';
import { DemoNotice, LocalImage } from '../../components/shared';
import { stories } from '../../data/content';
import { aboutPhoto, campaignHero } from '../../data/photography';
import { useLocale } from '../i18n';
import { aboutCopy as copy } from './content';

const valueIcons = [ScanLine, Palette, Layers3];

export function AboutPage() {
  const { t, locale } = useLocale();
  const story = stories.about;
  return (
    <div className="about-page">
      <section className="about-intro container" aria-labelledby="about-title">
        <div className="about-intro-top">
          <p className="eyebrow">FLUIVIX / {t('about')}</p>
          <span className="about-edition" aria-hidden="true">
            01 — FLUIVIX
          </span>
        </div>
        <div className="about-intro-grid">
          <h1 id="about-title">{story[0][locale]}</h1>
          <div className="about-intro-aside">
            <p>{copy.intro[locale]}</p>
            <a className="about-story-link" href="#about-story">
              {copy.story[locale]} <ArrowDown size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
        <figure className="about-atelier">
          <LocalImage
            src={aboutPhoto}
            alt={t('atelierImageAlt')}
            width="1600"
            height="1000"
            fetchPriority="high"
          />
          <figcaption>
            <span>{copy.atelier[locale]}</span>
            <span aria-hidden="true">FLUIVIX / 01</span>
          </figcaption>
        </figure>
      </section>

      <section
        className="about-story container"
        id="about-story"
        aria-labelledby="about-philosophy"
      >
        <div className="about-section-label">
          <span aria-hidden="true">01 /</span>
          <p className="eyebrow">{copy.philosophy[locale]}</p>
        </div>
        <div className="about-story-copy">
          <h2 id="about-philosophy">{story[2][locale]}</h2>
          <p className="about-lead">{story[1][locale]}</p>
          <p>{story[3][locale]}</p>
          <Link className="about-story-link" to="/lookbook">
            {t('lookbook')} <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="about-values" aria-labelledby="about-values-title">
        <div className="container">
          <div className="about-section-label">
            <span aria-hidden="true">02 /</span>
            <p className="eyebrow">FLUIVIX</p>
          </div>
          <h2 id="about-values-title">{copy.details[locale]}</h2>
          <div className="about-values-grid">
            {copy.values.map((value, i) => {
              const Icon = valueIcons[i];
              return (
                <article key={i}>
                  <div className="about-value-top">
                    <Icon size={27} strokeWidth={1.25} aria-hidden="true" />
                    <span aria-hidden="true">0{i + 1}</span>
                  </div>
                  <h3>{value.title[locale]}</h3>
                  <p>{value.body[locale]}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="about-invitation container" aria-labelledby="about-invitation-title">
        <div className="about-invitation-photo">
          <LocalImage
            src={campaignHero}
            alt={t('campaignImageAlt')}
            width="1600"
            height="1000"
            loading="lazy"
          />
        </div>
        <div className="about-invitation-copy">
          <p className="eyebrow">FLUIVIX / {t('collections')}</p>
          <h2 id="about-invitation-title">{copy.invitation[locale]}</h2>
          <p>{copy.invitationBody[locale]}</p>
          <Link className="button light" to="/collections">
            {t('explore')} <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <div className="about-disclosure container">
        <DemoNotice />
      </div>
    </div>
  );
}
