import { useLocation } from 'react-router';
import { AboutPage } from '../features/about/AboutPage';
import { ContactPage } from '../features/contact/ContactPage';
import { FaqPage } from '../features/faq/FaqPage';
import { InformationPage, type InformationKind } from '../features/information/InformationPage';
import { LookbookPage } from '../features/information/LookbookPage';

const informationRoutes: Record<string, InformationKind> = {
  '/shipping-policy': 'shippingPolicy',
  '/return-policy': 'returnPolicy',
  '/privacy-policy': 'privacyPolicy',
  '/terms': 'terms',
  '/size-guide': 'sizeGuide',
};

export function ContentPage() {
  const { pathname } = useLocation();
  if (pathname === '/about') return <AboutPage />;
  if (pathname === '/contact') return <ContactPage />;
  if (pathname === '/faq') return <FaqPage />;
  if (pathname === '/lookbook') return <LookbookPage />;
  const kind = informationRoutes[pathname];
  return kind ? <InformationPage key={kind} kind={kind} /> : null;
}
