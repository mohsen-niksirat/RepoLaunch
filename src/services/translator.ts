import type { AIConfig, LandingPageContent, LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from '../types';

// ─── Offline dictionary translations for quick/free i18n ────────────────────

interface LangDictionary {
  eyebrow: string;
  ctaPrimary: string;
  ctaSecondary: string;
  whyPrefix: string;
  howItWorks: string;
  steps: { title: string; desc: string }[];
  quickstart: string;
  starGrowth: string;
  starTrajectory: string;
  changelog: string;
  builtWith: string;
  testimonials: string;
  testimonialsSub: string;
  pricing: string;
  pricingSub: string;
  faq: string;
  newsletterHeading: string;
  newsletterDesc: string;
  newsletterBtn: string;
  readyTitle: string;
  readySub: string;
  starOnGithub: string;
  tiers: {
    community: string;
    communityDesc: string;
    communityCta: string;
    sponsor: string;
    sponsorDesc: string;
    sponsorCta: string;
    enterprise: string;
    enterpriseDesc: string;
    enterpriseCta: string;
  };
}

const DICTIONARIES: Record<LanguageCode, LangDictionary> = {
  en: {
    eyebrow: 'Next-Generation Developer Tool',
    ctaPrimary: 'Get Started',
    ctaSecondary: 'Star on GitHub',
    whyPrefix: 'Why',
    howItWorks: 'How it works',
    steps: [
      { title: 'Install', desc: 'Add to your project in seconds.' },
      { title: 'Configure', desc: 'Drop in your settings and import the API.' },
      { title: 'Ship', desc: 'Deploy to production with confidence.' },
    ],
    quickstart: 'Get started in seconds',
    starGrowth: 'Community Growth & Star Velocity',
    starTrajectory: 'Trajectory across releases and milestones',
    changelog: 'Recent Releases & Changelog',
    builtWith: 'Built with',
    testimonials: 'Loved by developers worldwide',
    testimonialsSub: 'See how teams and open-source contributors build faster.',
    pricing: 'Simple, transparent sponsorship & plans',
    pricingSub: 'Choose the tier that matches your scale — support open-source or get enterprise advisory.',
    faq: 'Frequently Asked Questions',
    newsletterHeading: 'Stay updated',
    newsletterDesc: 'Get notified about new releases, documentation updates, and development progress.',
    newsletterBtn: 'Subscribe',
    readyTitle: 'Ready to build with',
    readySub: 'Free, open source, and loved by developers worldwide.',
    starOnGithub: 'Star on GitHub',
    tiers: {
      community: 'Community',
      communityDesc: 'Everything you need to build, test, and ship.',
      communityCta: 'Get Started',
      sponsor: 'Backer / Sponsor',
      sponsorDesc: 'Directly support maintainers and unlock community perks.',
      sponsorCta: 'Sponsor on GitHub',
      enterprise: 'Enterprise Support',
      enterpriseDesc: 'Dedicated support, architectural reviews, and SLA guarantees.',
      enterpriseCta: 'Contact Maintainers',
    },
  },
  fa: {
    eyebrow: 'نسل جدید ابزارهای توسعه‌دهندگان',
    ctaPrimary: 'شروع به کار',
    ctaSecondary: 'ستاره در گیت‌هاب',
    whyPrefix: 'چرا',
    howItWorks: 'نحوه کارکرد',
    steps: [
      { title: 'نصب', desc: 'در چند ثانیه به پروژه خود اضافه کنید.' },
      { title: 'پیکربندی', desc: 'تنظیمات دلخواه را اعمال و API را فراخوانی کنید.' },
      { title: 'انتشار', desc: 'با اطمینان در محیط پروداکشن دیپلوی کنید.' },
    ],
    quickstart: 'شروع سریع در چند ثانیه',
    starGrowth: 'رشد جامعه کاربری و سرعت جذب ستاره',
    starTrajectory: 'مسیر پیشرفت پروژه در طول نسخه‌ها و رویدادها',
    changelog: 'آخرین انتشارها و لاگ تغییرات',
    builtWith: 'توسعه یافته با',
    testimonials: 'محبوب توسعه‌دهندگان در سراسر جهان',
    testimonialsSub: 'نظرات مهندسان نرم‌افزار و مشارکت‌کنندگان متن‌باز.',
    pricing: 'طرح‌های شفاف و حمایت مالی',
    pricingSub: 'بسته مناسب خود را انتخاب کنید — از حمایت توسعه متن‌باز تا مشاوره‌های اختصاصی سازمانی.',
    faq: 'پرسش‌های متداول',
    newsletterHeading: 'در جریان آخرین تغییرات باشید',
    newsletterDesc: 'از آخرین نسخه‌ها، بروزرسانی مستندات و امکانات جدید باخبر شوید.',
    newsletterBtn: 'عضویت',
    readyTitle: 'آماده شروع کار با',
    readySub: 'رایگان، متن‌باز و محبوب جامعه برنامه‌نویسان.',
    starOnGithub: 'ستاره در گیت‌هاب',
    tiers: {
      community: 'جامعه کاربری',
      communityDesc: 'همه ملزومات برای ساخت، تست و انتشار نرم‌افزار.',
      communityCta: 'شروع رایگان',
      sponsor: 'حامی / اسپانسر',
      sponsorDesc: 'حمایت مستقیم از توسعه‌دهندگان و بهره‌مندی از امتیازات ویژه.',
      sponsorCta: 'حمایت در گیت‌هاب',
      enterprise: 'پشتیبانی سازمانی',
      enterpriseDesc: 'پشتیبانی اختصاصی، بررسی معماری و تضمین قرارداد سطح خدمات (SLA).',
      enterpriseCta: 'ارتباط با تیم',
    },
  },
  es: {
    eyebrow: 'Herramienta de desarrollo de última generación',
    ctaPrimary: 'Comenzar',
    ctaSecondary: 'Destacar en GitHub',
    whyPrefix: 'Por qué',
    howItWorks: 'Cómo funciona',
    steps: [
      { title: 'Instalar', desc: 'Añádelo a tu proyecto en segundos.' },
      { title: 'Configurar', desc: 'Ajusta tu configuración e importa la API.' },
      { title: 'Desplegar', desc: 'Publica en producción con total confianza.' },
    ],
    quickstart: 'Comienza en segundos',
    starGrowth: 'Crecimiento de la comunidad y estrellas',
    starTrajectory: 'Trayectoria a través de versiones e hitos',
    changelog: 'Lanzamientos recientes y cambios',
    builtWith: 'Construido con',
    testimonials: 'Amado por desarrolladores de todo el mundo',
    testimonialsSub: 'Descubre cómo los equipos construyen más rápido.',
    pricing: 'Planes y patrocinio transparentes',
    pricingSub: 'Elige el nivel que mejor se adapte a tus necesidades.',
    faq: 'Preguntas frecuentes',
    newsletterHeading: 'Mantente informado',
    newsletterDesc: 'Recibe avisos sobre nuevas versiones y novedades.',
    newsletterBtn: 'Suscribirse',
    readyTitle: '¿Listo para construir con',
    readySub: 'Gratis, de código abierto y amado por desarrolladores.',
    starOnGithub: 'Dar estrella en GitHub',
    tiers: {
      community: 'Comunidad',
      communityDesc: 'Todo lo necesario para crear, probar y enviar.',
      communityCta: 'Comenzar gratis',
      sponsor: 'Patrocinador',
      sponsorDesc: 'Apoya directamente a los mantenedores del proyecto.',
      sponsorCta: 'Patrocinar en GitHub',
      enterprise: 'Soporte Empresarial',
      enterpriseDesc: 'Soporte dedicado, revisiones de arquitectura y SLA.',
      enterpriseCta: 'Contactar equipo',
    },
  },
  zh: {
    eyebrow: '新一代开发者利器',
    ctaPrimary: '立即开始',
    ctaSecondary: '在 GitHub 上加星',
    whyPrefix: '为什么选择',
    howItWorks: '工作原理',
    steps: [
      { title: '安装', desc: '几秒钟即可添加到你的项目中。' },
      { title: '配置', desc: '应用你的配置并调用 API。' },
      { title: '发布', desc: '自信地部署到生产环境。' },
    ],
    quickstart: '几秒内快速上手',
    starGrowth: '社区增长与 Star 走势',
    starTrajectory: '项目版本演进与重要里程碑',
    changelog: '最新发布与更新日志',
    builtWith: '技术栈',
    testimonials: '深受全球开发者喜爱',
    testimonialsSub: '了解各大团队和开源贡献者如何提效。',
    pricing: '简单透明的赞助与方案',
    pricingSub: '选择适合你的方案 — 支持开源或获取企业级顾问支持。',
    faq: '常见问题解答',
    newsletterHeading: '订阅最新动态',
    newsletterDesc: '第一时间获取版本发布与重要更新通知。',
    newsletterBtn: '订阅',
    readyTitle: '准备好使用',
    readySub: '免费、开源，深受全球开发者推崇。',
    starOnGithub: 'GitHub Star',
    tiers: {
      community: '社区版',
      communityDesc: '构建、测试和交付所需的全部基础功能。',
      communityCta: '免费开始',
      sponsor: '赞助者',
      sponsorDesc: '直接资助核心维护者并解锁专属特权。',
      sponsorCta: 'GitHub 赞助',
      enterprise: '企业顾问与支持',
      enterpriseDesc: '专属 1 对 1 架构咨询与 SLA 保障。',
      enterpriseCta: '联系团队',
    },
  },
  ja: {
    eyebrow: '次世代の開発者向けツール',
    ctaPrimary: '今すぐ始める',
    ctaSecondary: 'GitHub でスター',
    whyPrefix: 'なぜ',
    howItWorks: '使い方',
    steps: [
      { title: 'インストール', desc: 'わずか数秒でプロジェクトに導入可能。' },
      { title: '設定', desc: '設定を適用して API を呼び出すだけ。' },
      { title: 'デプロイ', desc: '本番環境へ安全かつ迅速にリリース。' },
    ],
    quickstart: '数秒でクイックスタート',
    starGrowth: 'コミュニティ成長とスター推移',
    starTrajectory: 'リリースとマイルストーンの軌跡',
    changelog: '最近のリリースと更新履歴',
    builtWith: '採用技術',
    testimonials: '世界中のエンジニアに支持されています',
    testimonialsSub: 'チームやオープンソース開発者が選ぶ理由。',
    pricing: '明瞭なプランとスポンサーシップ',
    pricingSub: '個人開発者からエンタープライズまで最適なプランを選択。',
    faq: 'よくある質問',
    newsletterHeading: '最新情報を受け取る',
    newsletterDesc: '新機能やリリースに関する最新通知をお届けします。',
    newsletterBtn: '登録する',
    readyTitle: '導入する準備はできましたか？',
    readySub: '完全オープンソースで誰でも自由に利用可能。',
    starOnGithub: 'GitHub でスターする',
    tiers: {
      community: 'コミュニティ',
      communityDesc: '開発・テスト・デプロイに必要なすべてを提供。',
      communityCta: '無料で始める',
      sponsor: 'スポンサー',
      sponsorDesc: 'メンテナーを直接支援しコミュニティ特典を獲得。',
      sponsorCta: 'GitHub でスポンサー',
      enterprise: 'エンタープライズ',
      enterpriseDesc: '専用サポート、アーキテクチャレビュー、SLA保証。',
      enterpriseCta: '問い合わせる',
    },
  },
  de: {
    eyebrow: 'Entwickler-Tool der nächsten Generation',
    ctaPrimary: 'Jetzt starten',
    ctaSecondary: 'Star auf GitHub',
    whyPrefix: 'Warum',
    howItWorks: 'So funktioniert es',
    steps: [
      { title: 'Installieren', desc: 'In wenigen Sekunden zu Ihrem Projekt hinzufügen.' },
      { title: 'Konfigurieren', desc: 'Einstellungen anpassen und API einbinden.' },
      { title: 'Ausliefern', desc: 'Sicher und zuverlässig in Produktion bringen.' },
    ],
    quickstart: 'In Sekunden loslegen',
    starGrowth: 'Community-Wachstum & Star-Verlauf',
    starTrajectory: 'Entwicklung über Releases und Meilensteine',
    changelog: 'Neueste Versionen & Changelog',
    builtWith: 'Erstellt mit',
    testimonials: 'Beliebt bei Entwicklern weltweit',
    testimonialsSub: 'Erfahren Sie, wie Teams schneller entwickeln.',
    pricing: 'Transparente Pläne & Sponsoring',
    pricingSub: 'Wählen Sie das passende Modell für Ihre Anforderungen.',
    faq: 'Häufig gestellte Fragen',
    newsletterHeading: 'Auf dem Laufenden bleiben',
    newsletterDesc: 'Erhalten Sie Benachrichtigungen über neue Versionen und Updates.',
    newsletterBtn: 'Abonnieren',
    readyTitle: 'Bereit durchzustarten mit',
    readySub: 'Kostenlos, quelloffen und weltweit geschätzt.',
    starOnGithub: 'Star auf GitHub',
    tiers: {
      community: 'Community',
      communityDesc: 'Alles, was Sie zum Entwickeln und Veröffentlichen benötigen.',
      communityCta: 'Kostenlos starten',
      sponsor: 'Unterstützer / Sponsor',
      sponsorDesc: 'Direkte Unterstützung der Maintainer mit Community-Vorteilen.',
      sponsorCta: 'Auf GitHub sponsern',
      enterprise: 'Enterprise Support',
      enterpriseDesc: 'Dedizierter Support, Architektur-Reviews und SLA.',
      enterpriseCta: 'Team kontaktieren',
    },
  },
  fr: {
    eyebrow: 'Outil pour développeurs nouvelle génération',
    ctaPrimary: 'Démarrer',
    ctaSecondary: 'Étoile sur GitHub',
    whyPrefix: 'Pourquoi',
    howItWorks: 'Comment ça marche',
    steps: [
      { title: 'Installer', desc: 'Ajoutez à votre projet en quelques secondes.' },
      { title: 'Configurer', desc: 'Ajustez vos paramètres et importez l’API.' },
      { title: 'Déployer', desc: 'Passez en production en toute confiance.' },
    ],
    quickstart: 'Démarrer en quelques secondes',
    starGrowth: 'Croissance de la communauté & étoiles',
    starTrajectory: 'Évolution au fil des versions et jalons',
    changelog: 'Dernières versions & Changelog',
    builtWith: 'Conçu avec',
    testimonials: 'Adoré par les développeurs du monde entier',
    testimonialsSub: 'Découvrez comment les équipes créent plus vite.',
    pricing: 'Plans et parrainage transparents',
    pricingSub: 'Choisissez la formule adaptée à vos besoins.',
    faq: 'Foire aux questions',
    newsletterHeading: 'Restez informé',
    newsletterDesc: 'Soyez notifié des nouvelles versions et mises à jour.',
    newsletterBtn: 'S’abonner',
    readyTitle: 'Prêt à construire avec',
    readySub: 'Gratuit, open source et adopté mondialement.',
    starOnGithub: 'Ajouter une étoile',
    tiers: {
      community: 'Communauté',
      communityDesc: 'Tout le nécessaire pour créer, tester et livrer.',
      communityCta: 'Commencer gratuitement',
      sponsor: 'Parrain / Sponsor',
      sponsorDesc: 'Soutenez directement les mainteneurs du projet.',
      sponsorCta: 'Sponsoriser sur GitHub',
      enterprise: 'Support Entreprise',
      enterpriseDesc: 'Support dédié, revue d’architecture et garanties SLA.',
      enterpriseCta: 'Contacter l’équipe',
    },
  },
};

/**
 * Apply instant offline translation for common UI template copy.
 */
export function applyOfflineTranslation(content: LandingPageContent, lang: LanguageCode): LandingPageContent {
  const dict = DICTIONARIES[lang] || DICTIONARIES.en;
  const clone: LandingPageContent = structuredClone(content);

  clone.hero.eyebrow = dict.eyebrow;
  clone.hero.ctaPrimary = dict.ctaPrimary;
  clone.hero.ctaSecondary = dict.ctaSecondary;

  if (clone.howItWorks && clone.howItWorks.length === 3) {
    clone.howItWorks = dict.steps.map((s) => ({ title: s.title, desc: s.desc }));
  }

  if (clone.newsletter) {
    clone.newsletter.heading = dict.newsletterHeading;
    clone.newsletter.description = dict.newsletterDesc;
    clone.newsletter.buttonText = dict.newsletterBtn;
  }

  if (clone.testimonials) {
    clone.testimonials.heading = dict.testimonials;
    clone.testimonials.description = dict.testimonialsSub;
  }

  if (clone.pricing) {
    clone.pricing.heading = dict.pricing;
    clone.pricing.description = dict.pricingSub;
    if (clone.pricing.tiers && clone.pricing.tiers.length >= 3) {
      clone.pricing.tiers[0].name = dict.tiers.community;
      clone.pricing.tiers[0].description = dict.tiers.communityDesc;
      clone.pricing.tiers[0].ctaText = dict.tiers.communityCta;

      clone.pricing.tiers[1].name = dict.tiers.sponsor;
      clone.pricing.tiers[1].description = dict.tiers.sponsorDesc;
      clone.pricing.tiers[1].ctaText = dict.tiers.sponsorCta;

      clone.pricing.tiers[2].name = dict.tiers.enterprise;
      clone.pricing.tiers[2].description = dict.tiers.enterpriseDesc;
      clone.pricing.tiers[2].ctaText = dict.tiers.enterpriseCta;
    }
  }

  return clone;
}

/**
 * Perform a full high-fidelity translation using the user's BYOK LLM (OpenAI, Gemini, Groq, custom).
 */
export async function translateWithAI(
  config: AIConfig,
  content: LandingPageContent,
  targetLang: LanguageCode,
): Promise<LandingPageContent> {
  if (!config.apiKey) {
    // Fall back to instant offline dictionary
    return applyOfflineTranslation(content, targetLang);
  }

  const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang) || { label: 'English', nativeLabel: 'English' };
  const targetName = `${langInfo.label} (${langInfo.nativeLabel})`;

  const payloadToTranslate = {
    hero: {
      eyebrow: content.hero.eyebrow,
      headline: content.hero.headline,
      subheadline: content.hero.subheadline,
      ctaPrimary: content.hero.ctaPrimary,
      ctaSecondary: content.hero.ctaSecondary,
    },
    features: content.features.map((f) => ({ title: f.title, desc: f.desc })),
    howItWorks: content.howItWorks,
    faq: content.faq,
    newsletter: content.newsletter,
    testimonials: content.testimonials,
    pricing: content.pricing,
  };

  const prompt = `You are a professional software localization specialist and product copywriter.
Translate the following JSON structure naturally into ${targetName}.
Maintain developer-friendly idioms, appropriate technical vocabulary, and compelling marketing rhythm.
DO NOT translate code blocks, brand names, repository names, package commands (like npm, pip), or URL links.
Return ONLY valid JSON with identical keys and structure. No markdown fences.

INPUT JSON:
${JSON.stringify(payloadToTranslate, null, 2)}`;

  let text = '';
  const model = config.model || (config.provider === 'gemini' ? 'gemini-1.5-flash' : config.provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini');

  if (config.provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(config.apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
      }),
    });
    if (!res.ok) throw new Error(`Gemini translation failed (HTTP ${res.status}). Check your key.`);
    const data = await res.json();
    text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  } else {
    const url = config.provider === 'custom' && config.baseUrl
      ? config.baseUrl.replace(/\/$/, '') + '/chat/completions'
      : config.provider === 'groq'
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: `You are a professional tech translator. Translate accurately to ${targetName}. Output valid JSON only.` },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) throw new Error(`Translation API failed (HTTP ${res.status}). Check your API key and provider settings.`);
    const data = await res.json();
    text = data?.choices?.[0]?.message?.content ?? '';
  }

  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('AI response was not valid JSON.');
  const parsed = JSON.parse(cleaned.slice(start, end + 1));

  const clone: LandingPageContent = structuredClone(content);
  if (parsed.hero) {
    clone.hero.eyebrow = parsed.hero.eyebrow ?? clone.hero.eyebrow;
    clone.hero.headline = parsed.hero.headline ?? clone.hero.headline;
    clone.hero.subheadline = parsed.hero.subheadline ?? clone.hero.subheadline;
    clone.hero.ctaPrimary = parsed.hero.ctaPrimary ?? clone.hero.ctaPrimary;
    clone.hero.ctaSecondary = parsed.hero.ctaSecondary ?? clone.hero.ctaSecondary;
  }
  if (Array.isArray(parsed.features) && parsed.features.length) {
    clone.features = clone.features.map((f, i) => ({
      ...f,
      title: parsed.features[i]?.title ?? f.title,
      desc: parsed.features[i]?.desc ?? f.desc,
    }));
  }
  if (Array.isArray(parsed.howItWorks) && parsed.howItWorks.length) {
    clone.howItWorks = parsed.howItWorks;
  }
  if (Array.isArray(parsed.faq) && parsed.faq.length) {
    clone.faq = parsed.faq;
  }
  if (parsed.newsletter) {
    clone.newsletter = { ...clone.newsletter, ...parsed.newsletter };
  }
  if (parsed.testimonials) {
    clone.testimonials = {
      ...clone.testimonials,
      heading: parsed.testimonials.heading ?? clone.testimonials?.heading,
      description: parsed.testimonials.description ?? clone.testimonials?.description,
      items: (parsed.testimonials.items || clone.testimonials?.items || []).map((item: any, i: number) => ({
        ...item,
        author: clone.testimonials?.items?.[i]?.author ?? item.author,
        role: item.role ?? clone.testimonials?.items?.[i]?.role,
        handle: clone.testimonials?.items?.[i]?.handle,
      })),
    };
  }
  if (parsed.pricing) {
    clone.pricing = {
      ...clone.pricing,
      heading: parsed.pricing.heading ?? clone.pricing?.heading,
      description: parsed.pricing.description ?? clone.pricing?.description,
      tiers: (clone.pricing?.tiers || []).map((tier, i) => {
        const pt = parsed.pricing.tiers?.[i];
        if (!pt) return tier;
        return {
          ...tier,
          name: pt.name ?? tier.name,
          description: pt.description ?? tier.description,
          ctaText: pt.ctaText ?? tier.ctaText,
          badge: pt.badge ?? tier.badge,
          features: Array.isArray(pt.features) ? pt.features : tier.features,
        };
      }),
    };
  }

  return clone;
}
