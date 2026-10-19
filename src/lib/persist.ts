import { createJSONStorage, type PersistOptions } from 'zustand/middleware';
import { z } from 'zod';
import { safeStorage } from './storage';
export function persistOptions<T extends object,P extends object>(name:string,schema:z.ZodType<P>,partialize:(state:T)=>P):PersistOptions<T,P>{return {name:`fluivix:v1:${name}`,version:1,storage:createJSONStorage(()=>safeStorage),partialize,merge:(persisted,current)=>{const result=schema.safeParse(persisted);if(!result.success){window.dispatchEvent(new Event('fluivix:storage-error'));return current;}return {...current,...result.data};},migrate:()=>({} as P)};}
export const lineSchema=z.object({productId:z.string(),variantId:z.string(),quantity:z.number().int().positive()});
export const addressSchema=z.object({id:z.string(),ownerId:z.string(),recipient:z.string(),phone:z.string(),province:z.string(),district:z.string(),street:z.string(),isDefault:z.boolean()});
export const localizedSchema=z.object({vi:z.string(),en:z.string(),ko:z.string(),'zh-CN':z.string(),ja:z.string()});
