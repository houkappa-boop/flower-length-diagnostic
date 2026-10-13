const TEST = 'PUBLIC_TEST_ONLY_0123456789_ABCDEFGHIJKLMNO';
function normalize(value) {
  const trimmed = value.trim();
  const pairs = [['「','」'],['『','』'],['“','”'],['‘','’'],['"','"'],["'","'"],['`','`']];
  return trimmed.length >= 2 && pairs.some(([l,r])=>trimmed.startsWith(l)&&trimmed.endsWith(r)) ? trimmed.slice(1,-1).trim() : trimmed;
}
function allowed(value) { const n = normalize(value); return n.length > 0 && TEST.startsWith(n); }
if (typeof module !== 'undefined') module.exports = {TEST,normalize,allowed};
