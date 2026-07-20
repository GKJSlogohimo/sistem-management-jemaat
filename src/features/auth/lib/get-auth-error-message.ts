const authErrorMessages: Record<string, string> = {
  USER_ALREADY_EXISTS: "Email tersebut sudah terdaftar.",
  USER_NOT_FOUND: "Email atau kata sandi salah.",
  INVALID_PASSWORD: "Email atau kata sandi salah.",
  INVALID_EMAIL_OR_PASSWORD: "Email atau kata sandi salah.",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "Email atau kata sandi salah.",
  EMAIL_NOT_VERIFIED: "Email belum diverifikasi.",
  INVALID_EMAIL: "Format email tidak valid.",
  PASSWORD_TOO_SHORT: "Kata sandi terlalu pendek.",
  PASSWORD_TOO_LONG: "Kata sandi terlalu panjang.",
  FAILED_TO_CREATE_USER: "Akun tidak dapat dibuat.",
  FAILED_TO_CREATE_SESSION: "Sesi login tidak dapat dibuat.",
  TOO_MANY_REQUESTS: "Terlalu banyak percobaan. Silakan coba kembali nanti.",
};

export function getAuthErrorMessage(code?: string): string {
  if (!code) {
    return "Terjadi kesalahan autentikasi.";
  }

  return (
    authErrorMessages[code] ?? "Terjadi kesalahan. Periksa data yang dimasukkan lalu coba kembali."
  );
}
