// Simple, dependency-free moderation middleware for comments
const leetMap = {
  '0': 'o', '1': 'i', '!': 'i', '3': 'e', '4': 'a',
  '@': 'a', '5': 's', '$': 's', '7': 't', '8': 'b',
};

const normalize = (input = '') => {
  let s = String(input).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  s = s.replace(/[\s\-_\.]+/g, ' ');
  s = s.replace(/[0-9!@$]/g, (ch) => leetMap[ch] || ch);
  s = s.replace(/\s+/g, ' ').trim();
  return s;
};

const BANNED = [
  'fuck', 'fucking', 'motherfucker', 'shit', 'bullshit', 'bastard',
  'asshole', 'dick', 'pussy', 'cunt', 'cum',
  'retard', 'retarded', 'moron', 'idiot',
];

const bannedRegexes = BANNED.map((word) => {
  const pattern = word.split('').map((ch) => ch.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('[^a-z]*');
  return new RegExp(`(?:^|[^a-z])${pattern}(?:[^a-z]|$)`, 'i');
});

export const moderateComment = (req, res, next) => {
  const raw = (req.body?.text || '').toString();
  const norm = normalize(raw);
  const isBanned = bannedRegexes.some((rx) => rx.test(norm));
  if (isBanned) {
    return res.status(400).json({ error: 'Your comment appears to violate our community guidelines.' });
  }
  next();
};

export default moderateComment;
