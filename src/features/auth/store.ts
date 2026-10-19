import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import { persistOptions,addressSchema } from '../../lib/persist';
import type { Profile,Address } from '../../types/domain';
import { useCart } from '../cart/store';
import { useWishlist } from '../wishlist/store';
const profileSchema=z.object({id:z.string(),fullName:z.string(),email:z.email(),phone:z.string(),createdAt:z.string()});
interface State {guestId:string;session:string|null;profiles:Profile[];addresses:Address[];login:(email:string)=>void;register:(name:string,email:string)=>void;logout:()=>void;update:(profile:Profile)=>void;saveAddress:(address:Address)=>void;removeAddress:(id:string)=>void;}
export const useAuth=create<State>()(persist((set,get)=>({guestId:`guest-${crypto.randomUUID()}`,session:null,profiles:[{id:'demo-user',fullName:'Demo',email:'demo@fluivix.local',phone:'',createdAt:'2026-01-01'}],addresses:[],
 login:(email)=>{const s=get(),user=s.profiles.find(p=>p.email===email.trim().toLowerCase());if(!user)throw new Error('noProfile');useCart.getState().mergeGuest(s.guestId,user.id);useWishlist.getState().mergeGuest(s.guestId,user.id);set({session:user.id});},
 register:(fullName,email)=>{email=email.trim().toLowerCase();if(get().profiles.some(p=>p.email===email))throw new Error('duplicate');const profile={id:crypto.randomUUID(),fullName:fullName.trim(),email,phone:'',createdAt:new Date().toISOString()};set(s=>({profiles:[...s.profiles,profile]}));get().login(email);},logout:()=>{set({session:null});useCart.setState({intent:null});},update:(profile)=>set(s=>({profiles:s.profiles.map(p=>p.id===profile.id?profile:p)})),
 saveAddress:(address)=>set(s=>({addresses:[...s.addresses.filter(a=>a.id!==address.id).map(a=>a.ownerId===address.ownerId&&address.isDefault?{...a,isDefault:false}:a),address]})),removeAddress:(id)=>set(s=>({addresses:s.addresses.filter(a=>a.id!==id)}))
}),persistOptions('identity',z.object({guestId:z.string(),session:z.string().nullable(),profiles:z.array(profileSchema),addresses:z.array(addressSchema)}),s=>({guestId:s.guestId,session:s.session,profiles:s.profiles,addresses:s.addresses}))));
export function useOwner(){const s=useAuth();return s.session&&s.profiles.some(p=>p.id===s.session)?s.session:s.guestId;}
// Persist the initial guest identity before the first full-page navigation.
useAuth.setState(s=>({guestId:s.guestId,session:s.profiles.some(p=>p.id===s.session)?s.session:null}));
