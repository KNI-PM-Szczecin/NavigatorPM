"use client";

import { useLanguage } from '@/context/LanguageContext';

interface AdminLoginClientProps {
    handleLoginAction: (formData: FormData) => Promise<void>;
}

export function AdminLoginClient({ handleLoginAction }: AdminLoginClientProps) {
    const { t } = useLanguage();

    return (
        <div className="centered-flex">
            <h1>{t('ui.adminLogin')}</h1>
            <form action={handleLoginAction} className="form-group">
                <input 
                    type="text" 
                    name="username" 
                    placeholder={t('ui.username')} 
                    required 
                />
                <input 
                    type="password" 
                    name="password" 
                    placeholder={t('ui.password')} 
                    required 
                />
                <button type="submit">{t('ui.login')}</button>
            </form>
        </div>
    );
}
