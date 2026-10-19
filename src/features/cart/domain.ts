import { findProduct, findVariant, unitPrice } from '../../data/catalog';
import type { CartLine } from '../../types/domain';
export const getStockForVariant=(id:string)=>findVariant(id)?.stock??0;
export function validLine(line:CartLine){return !!findProduct(line.productId)&&findVariant(line.variantId)?.productId===line.productId&&Number.isSafeInteger(line.quantity)&&line.quantity>0&&line.quantity<=getStockForVariant(line.variantId);}
export function mergeCartItems(lines:CartLine[],incoming:CartLine):CartLine[]{
 const existing=lines.find(l=>l.variantId===incoming.variantId);const merged={...incoming,quantity:incoming.quantity+(existing?.quantity??0)};
 if(!validLine(merged))throw new Error('stockError');
 return existing?lines.map(l=>l.variantId===incoming.variantId?merged:l):[...lines,merged];
}
export function updateCartVariant(lines:CartLine[],oldId:string,newId:string){const line=lines.find(l=>l.variantId===oldId);const variant=findVariant(newId);if(!line||!variant||variant.productId!==line.productId)throw new Error('unavailable');return mergeCartItems(lines.filter(l=>l.variantId!==oldId),{...line,variantId:newId});}
export const calculateSubtotal=(lines:CartLine[])=>lines.reduce((sum,line)=>{const product=findProduct(line.productId);return sum+(product?unitPrice(product,line.variantId)*line.quantity:0);},0);
export const consumePurchased=(cart:CartLine[],purchased:CartLine[])=>cart.map(l=>({...l,quantity:Math.max(0,l.quantity-(purchased.find(p=>p.variantId===l.variantId)?.quantity??0))})).filter(l=>l.quantity>0);
