export const locales = ['vi','en','ko','zh-CN','ja'] as const;
export type Locale = typeof locales[number];
export type Localized = Record<Locale,string>;
export const localized = (vi:string,en:string,ko:string,zh:string,ja:string):Localized => ({vi,en,ko,'zh-CN':zh,ja});
export interface Variant { id:string; productId:string; sku:string; colorId:string; size:string; stock:number; priceOverrideVnd?:number }
export interface Product { id:string; slug:string; sku:string; categoryId:string; collectionIds:string[]; name:Localized; description:Localized; materials:Localized; care:Localized; basePriceVnd:number; compareAtPriceVnd?:number; popularity:number; createdAt:string; imageUrls:string[]; variants:Variant[] }
export interface CartLine { productId:string; variantId:string; quantity:number }
export interface Profile { id:string; fullName:string; email:string; phone:string; createdAt:string }
export interface Address { id:string; ownerId:string; recipient:string; phone:string; province:string; district:string; street:string; isDefault:boolean }
export type Shipping = 'STANDARD'|'EXPRESS';
export type Payment = 'COD'|'ONLINE_DEMO';
export type Fulfillment = 'AWAITING_PAYMENT'|'PENDING_CONFIRMATION'|'CONFIRMED'|'PREPARING'|'SHIPPING'|'DELIVERED'|'DELIVERY_FAILED'|'CANCELLED';
export type ReturnStatus = 'NONE'|'REQUESTED'|'REVIEWING'|'APPROVED'|'REJECTED'|'REFUNDED';
export interface Pricing { subtotalVnd:number; discountVnd:number; shippingFeeVnd:number; totalVnd:number; couponCode?:string; error?:string }
export interface Intent { id:string; ownerId:string; source:'CART'|'BUY_NOW'; items:CartLine[]; orderId?:string }
export interface OrderItem extends CartLine { nameAtPurchase:Localized; colorNameAtPurchase:Localized; sku:string; size:string; imageUrl:string; unitPriceVnd:number }
export interface Order { id:string; intentId:string; ownerId:string; ownerType:'GUEST'|'USER'; items:OrderItem[]; addressSnapshot:Address; pricingSnapshot:Pricing; shippingMethod:Shipping; paymentMethod:Payment; paymentStatus:'UNPAID'|'PENDING'|'PAID'|'FAILED'|'REFUNDED'; fulfillmentStatus:Fulfillment; returnStatus:ReturnStatus; timeline:{status:string;at:string}[]; createdAt:string; deliveredAt?:string; source:'CART'|'BUY_NOW'; consumed:boolean }
export interface Review { id:string; productId:string; author:string; rating:number; body:string; ownerId:string }
