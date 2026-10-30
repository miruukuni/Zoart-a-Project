import { APPLICATION_URL_LIMIT } from "./project-limits";
import policy from "../data/application-link-policy.json";

/** HTTPS and an approved host are required; this is not a malware verdict. */
export function applicationUrl(value: string | null | undefined): string | undefined {
  const text = value?.trim();
  if (!text || text.length > APPLICATION_URL_LIMIT || !/^https?:\/\//i.test(text) || /[\s\\]/u.test(text)) return;
  if ([...text].some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) return;
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password || url.port) return;
    if (!policy.some(rule => (url.hostname === rule.host || (rule.subdomains && url.hostname.endsWith(`.${rule.host}`))) && url.pathname.startsWith(rule.pathPrefix))) return;
    if (url.href.length > APPLICATION_URL_LIMIT) return;
    return url.href;
  } catch { return; }
}

export const APPLICATION_LINK_HELP = "Use an HTTPS link to a UCI site, Google Form, or GitHub project.";
