/** Địa chỉ web app Google Apps Script của Lành. Khi deploy bản mới vẫn giữ link /exec này. */
export const WEB_URL =
  'https://script.google.com/macros/s/AKfycbxT7ZIf-TXhCK5MnaY7c7bb88S3w_71qO7g21Lw4bFP5NP92_p23QF6tdt8nDG2NUOhNQ/exec';

/** Các trang được mở ngay trong app. Link khác (Google Sheet, Zalo…) mở bằng trình duyệt / app ngoài. */
export const IN_APP_HOSTS = [/(^|\.)script\.google\.com$/, /(^|\.)googleusercontent\.com$/, /^accounts\.google\.com$/];

export const COLORS = {
  bg: '#F7F8F9',
  paper: '#FFFFFF',
  ink: '#172B4D',
  ink2: '#626F86',
  accent: '#1F845A',
  bad: '#C9372C',
  line: '#DCDFE4',
};

export function isInApp(url: string): boolean {
  if (url.startsWith('about:') || url.startsWith('data:') || url.startsWith('blob:')) return true;
  const m = /^https?:\/\/([^/:?#]+)/i.exec(url);
  return !!m && IN_APP_HOSTS.some((re) => re.test(m[1].toLowerCase()));
}
