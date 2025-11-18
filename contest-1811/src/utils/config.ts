
export const JWT_SECRET = process.env.JWT_SECRET  || "vasanth"
export const JWT_EXPIRES_IN = '7d';
export const COOKIE_NAME = "auth_token";

export const COOKIE_OPTIONS = {
    httponly: true,
    secure: true,
    samesite: 'strict' as const,
    maxAge: 7*24*60*60*1000
}
