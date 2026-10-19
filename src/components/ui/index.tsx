import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ButtonHTMLAttributes,ReactNode } from 'react';
import { useLocale } from '../../features/i18n';
export const cn=(...inputs:ClassValue[])=>twMerge(clsx(inputs));
export function Button({className,...props}:ButtonHTMLAttributes<HTMLButtonElement>){return <button className={cn('button',className)} {...props}/>;}
export function Modal({trigger,title,children,open,onOpenChange}:{trigger?:ReactNode;title:string;children:ReactNode;open?:boolean;onOpenChange?:(open:boolean)=>void}){const {t}=useLocale();return <Dialog.Root open={open} onOpenChange={onOpenChange}>{trigger&&<Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}<Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="dialog-content" aria-describedby={undefined}><Dialog.Title>{title}</Dialog.Title><Dialog.Close className="icon modal-close" aria-label={t('close')}><X size={20}/></Dialog.Close>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>;}
export function Confirm({trigger,onConfirm,title}:{trigger:ReactNode;onConfirm:()=>void;title?:string}){const {t}=useLocale();return <Modal trigger={trigger} title={title??t('confirmDelete')}><div className="actions"><Dialog.Close asChild><Button className="secondary">{t('cancel')}</Button></Dialog.Close><Dialog.Close asChild><Button onClick={onConfirm}>{t('confirm')}</Button></Dialog.Close></div></Modal>;}
