import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import { persistOptions } from '../../lib/persist';
interface State {lists:Record<string,string[]>;recent:Record<string,string[]>;toggle:(owner:string,id:string)=>void;view:(owner:string,id:string)=>void;mergeGuest:(guest:string,user:string)=>void;}
export const useWishlist=create<State>()(persist((set)=>({lists:{},recent:{},toggle:(owner,id)=>set(s=>({lists:{...s.lists,[owner]:(s.lists[owner]??[]).includes(id)?s.lists[owner].filter(x=>x!==id):[...(s.lists[owner]??[]),id]}})),view:(owner,id)=>set(s=>({recent:{...s.recent,[owner]:[id,...(s.recent[owner]??[]).filter(x=>x!==id)].slice(0,12)}})),mergeGuest:(guest,user)=>set(s=>({lists:{...s.lists,[user]:[...new Set([...(s.lists[user]??[]),...(s.lists[guest]??[])])],[guest]:[]}}))}),persistOptions('favorites',z.object({lists:z.record(z.string(),z.array(z.string())),recent:z.record(z.string(),z.array(z.string()))}),s=>({lists:s.lists,recent:s.recent}))));
