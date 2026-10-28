import { APPLICATION_URL_LIMIT } from "./project-limits";

/** Only HTTP(S) web links can be used by the Apply button. */
export function applicationUrl(value: string | null | undefined): string | undefined {
  const text = value?.trim();
  if (!text || text.length > APPLICATION_URL_LIMIT || !/^https?:\/\//i.test(text) || /[\s\\]/u.test(text)) return;
  if ([...text].some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) return;
  try {
    const url = new URL(text);
    if (!["https:", "http:"].includes(url.protocol) || !url.hostname || url.username || url.password) return;
    if (url.href.length > APPLICATION_URL_LIMIT) return;
    return url.href;
  } catch { return; }
}
