import * as Dialog from '@radix-ui/react-dialog';
import { Link } from 'react-router';
import { Heart,ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { useLocale,money } from '../features/i18n';
import type { Product,Pricing } from '../types/domain';
import { useOwner } from '../features/auth/store';
import { useWishlist } from '../features/wishlist/store';
import { displayPrice } from '../data/catalog';
import { useState,type ImgHTMLAttributes } from 'react';
import { Modal,Button } from './ui';
export function LocalImage({alt,...props}:ImgHTMLAttributes<HTMLImageElement>){const [failed,setFailed]=useState(false);return failed?<svg className={props.className} role="img" aria-label={alt} viewBox="0 0 400 500"><title>{alt}</title><path fill="#e4e2d6" d="M0 0h400v500H0z"/><path fill="#7d8873" d="M100 140l60-40q40 30 80 0l60 40-25 70-30-20v160h-90V190l-30 20z"/></svg>:<img alt={alt} {...props} onError={()=>setFailed(true)}/>;}
export function DemoNotice(){const {t}=useLocale();return <p className="demo-notice">DEMO · {t('demo')}</p>;}
export function Empty({message='empty'}:{message?:string}){const {t}=useLocale();return <div className="empty"><p>{t(message)}</p><Link className="button" to="/shop">{t('continue')} <ArrowUpRight size={16}/></Link></div>;}
export function Favorite({id}:{id:string}){const {t}=useLocale(),owner=useOwner(),store=useWishlist();const saved=store.lists[owner]?.includes(id)??false;return <button className="icon favorite" aria-label={t('wishlist')} aria-pressed={saved} onClick={()=>{store.toggle(owner,id);toast.success(t('saved'));}}><Heart size={19} fill={saved?'currentColor':'none'}/></button>;}
export function ProductCard({product:p}:{product:Product}){const {t,locale}=useLocale();return <article className="product-card"><div className="product-image"><Link to={`/product/${p.slug}`}><LocalImage width="400" height="500" loading="lazy" src={p.imageUrls[0]} alt={`${p.name[locale]} — ${t('illustration')}`}/></Link><Favorite id={p.id}/>{p.compareAtPriceVnd&&<span className="product-badge">{t('sale')}</span>}<Modal title={p.name[locale]} trigger={<Button className="quick-view">{t('quickView')}</Button>}><LocalImage className="quick-image" src={p.imageUrls[0]} alt={p.name[locale]}/><p>{p.description[locale]}</p><p>{money(displayPrice(p),locale)}</p><Dialog.Close asChild><Link className="button" to={`/product/${p.slug}`}>{t('description')} ↗</Link></Dialog.Close></Modal></div><Link to={`/product/${p.slug}`} className="product-name">{p.name[locale]}</Link><p className="price">{money(displayPrice(p),locale)} {p.compareAtPriceVnd&&<del>{money(p.compareAtPriceVnd,locale)}</del>}</p><p className="muted small">{t('illustration')}</p></article>;}
export function ProductGrid({items}:{items:Product[]}){return items.length?<div className="product-grid">{items.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<Empty/>;}
export function Summary({pricing}:{pricing:Pricing}){const {t,locale}=useLocale();return <dl className="summary">{(['subtotalVnd','discountVnd','shippingFeeVnd','totalVnd'] as const).map((key,i)=><div key={key}><dt>{t(['subtotal','discount','shipping','total'][i])}</dt><dd>{key==='discountVnd'?'− ':''}{money(pricing[key],locale)}</dd></div>)}</dl>;}
export function SizeTable(){const {t}=useLocale();return <><p>{t('measure')}</p><div className="table-wrap"><table><thead><tr>{['size','chest','waist','hips'].map(k=><th key={k}>{t(k)}</th>)}</tr></thead><tbody>{['S','M','L','XL','XXL'].map((s,i)=><tr key={s}><th>{s}</th><td>{88+i*6}–{93+i*6}</td><td>{68+i*6}–{73+i*6}</td><td>{90+i*6}–{95+i*6}</td></tr>)}</tbody></table></div><p className="muted">{t('samplePolicy')}</p></>;}
