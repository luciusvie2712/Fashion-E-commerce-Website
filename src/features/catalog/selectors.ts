import { displayPrice } from '../../data/catalog';
import type { Product,Locale } from '../../types/domain';
import { normalizeVietnameseSearch } from '../../lib/urls';
export function filterCatalog(products:Product[],params:URLSearchParams,locale:Locale){
 const q=normalizeVietnameseSearch(params.get('q')??'');const sizes=params.getAll('size'),colors=params.getAll('color');const min=Math.max(0,Number(params.get('min'))||0),max=Math.max(min,Number(params.get('max'))||Infinity);
 const filtered=products.filter(p=>{const price=displayPrice(p);return normalizeVietnameseSearch(`${p.name.vi} ${p.name[locale]} ${p.description.vi} ${p.sku}`).includes(q)&&(!params.get('category')||p.categoryId===params.get('category'))&&price>=min&&price<=max&&(!params.has('sale')||!!p.compareAtPriceVnd)&&p.variants.some(v=>(!sizes.length||sizes.includes(v.size))&&(!colors.length||colors.includes(v.colorId))&&(!params.has('stock')||v.stock>0));});
 const sort=params.get('sort');return filtered.sort((a,b)=>sort==='price_asc'?displayPrice(a)-displayPrice(b):sort==='price_desc'?displayPrice(b)-displayPrice(a):sort==='name'?a.name[locale].localeCompare(b.name[locale],locale):sort==='best'?b.popularity-a.popularity:b.createdAt.localeCompare(a.createdAt)||a.id.localeCompare(b.id));
}
