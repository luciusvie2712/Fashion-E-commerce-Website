import { categories, collections, products } from '../data/catalog';
import { localized as l, type Locale } from '../types/domain';
import { routeTitle } from './route-inventory';

export const siteMetadata = {
  title: l(
    'FLUIVIX — Chất riêng, mỗi ngày | Thời trang đương đại',
    'FLUIVIX — Your own rhythm | Contemporary clothing',
    'FLUIVIX — 나만의 리듬 | 컨템포러리 패션',
    'FLUIVIX — 穿出自我 | 当代时装',
    'FLUIVIX — 自分らしく、毎日 | コンテンポラリーファッション',
  ),
  description: l(
    'Khám phá FLUIVIX: trang phục đương đại, phom dáng tinh gọn và sắc màu tự nhiên cho nhịp sống mỗi ngày. Website trải nghiệm, không giao dịch thật.',
    'Explore FLUIVIX: contemporary clothing, clean silhouettes and grounded colors for everyday life. A demo storefront with no real transactions.',
    '간결한 실루엣과 자연스러운 색상으로 일상에 어울리는 FLUIVIX 컨템포러리 패션을 만나보세요. 실제 거래가 없는 데모 스토어입니다.',
    '探索 FLUIVIX 当代时装，以利落廓形与自然色调，搭配每一天的生活节奏。此为演示商店，不进行真实交易。',
    'すっきりしたシルエットと自然な色合いで、日常に寄り添うFLUIVIXの服を。実際の取引を行わないデモストアです。',
  ),
  demo: l(
    'Nội dung demo; không có giao dịch thật.',
    'Demo content; no real transactions.',
    '데모 콘텐츠이며 실제 거래는 없습니다.',
    '演示内容，不进行真实交易。',
    'デモ内容です。実際の取引はありません。',
  ),
};

const socialLocales: Record<Locale, string> = {
  vi: 'vi_VN',
  en: 'en_US',
  ko: 'ko_KR',
  'zh-CN': 'zh_CN',
  ja: 'ja_JP',
};

export function pageMetadata(pathname: string, locale: Locale, translate: (key: string) => string) {
  if (pathname === '/')
    return { title: siteMetadata.title[locale], description: siteMetadata.description[locale] };
  let label = translate(routeTitle(pathname));
  let description = siteMetadata.description[locale];
  const slug = pathname.split('/')[2];
  if (pathname.startsWith('/product/')) {
    const product = products.find((item) => item.slug === slug);
    label = product?.name[locale] ?? translate('notFound');
    if (product) description = `${product.description[locale]} ${siteMetadata.demo[locale]}`;
  } else if (pathname.startsWith('/category/')) {
    label = categories.find((item) => item.id === slug)?.name[locale] ?? translate('notFound');
  } else if (pathname.startsWith('/collections/')) {
    const collection = collections.find((item) => item.id === slug);
    label = collection?.name[locale] ?? translate('notFound');
    if (collection) description = `${collection.description[locale]} ${siteMetadata.demo[locale]}`;
  }
  return { title: `${label} | FLUIVIX`, description: `${label}. ${description}` };
}

export function applyPageMetadata(
  metadata: { title: string; description: string },
  locale: Locale,
) {
  document.title = metadata.title;
  for (const [attribute, key, content] of [
    ['name', 'description', metadata.description],
    ['property', 'og:title', metadata.title],
    ['property', 'og:description', metadata.description],
    ['property', 'og:locale', socialLocales[locale]],
    ['name', 'twitter:title', metadata.title],
    ['name', 'twitter:description', metadata.description],
  ]) {
    document.querySelector(`meta[${attribute}="${key}"]`)?.setAttribute('content', content);
  }
}
