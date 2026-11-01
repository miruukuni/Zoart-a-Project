export const CONTACT_LINK_HELP = "Use an email address, phone number or @handle. Put website links in the application / project link field instead.";

export function contactHasLink(input: string): boolean {
  let value = input.normalize("NFKC");
  try { value = decodeURIComponent(value); } catch { /* Check malformed input as written. */ }
  if (/(?:[a-z][a-z0-9+.-]*:\/\/|www\.|(?:mailto|tel|javascript|data):|\/\/\S)/i.test(value)) return true;
  value = value.replace(/[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+/g, " ");
  return /(?<![@\p{L}\p{N}_-])(?:[\p{L}\p{N}][\p{L}\p{N}-]*\.)+[\p{L}]{2,63}(?![\p{L}\p{N}_-])/u.test(value)
    || /(?<![\w.])(?:\d{1,3}\.){3}\d{1,3}(?![\w.])/.test(value)
    || /\[[0-9a-f]*:[0-9a-f:]+\]/i.test(value);
}
