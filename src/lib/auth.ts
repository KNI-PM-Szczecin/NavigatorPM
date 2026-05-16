import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import db from './db';

const SESSION_COOKIE = 'admin_session';

export async function login(username: string, password: string): Promise<boolean> {
    const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get(username) as any;
    if (!admin) return false;

    const isValid = bcrypt.compareSync(password, admin.password_hash);
    if (isValid) {
                        (await cookies()).set(SESSION_COOKIE, 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24,             path: '/',
        });
        return true;
    }
    return false;
}

export async function isAuthenticated(): Promise<boolean> {
    return (await cookies()).has(SESSION_COOKIE);
}

export async function logout() {
    (await cookies()).delete(SESSION_COOKIE);
}

export async function updatePassword(newPassword: string) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);
    db.prepare('UPDATE admin SET password_hash = ? WHERE username = ?').run(hash, 'admin');
}
