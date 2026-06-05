export async function isAuthenticated(): Promise<boolean> {
    return process.env.NODE_ENV === 'development';
}
