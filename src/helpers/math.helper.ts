export function toScale(v: number, scale = 2) {
  return Number(v.toFixed(scale))
}

export function divide(a: number, b: number) {
  if (b === 0) return 0
  return a / b
}

// Compute the edit distance between the two given strings
export function getLevenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  var matrix = []

  // increment along the first column of each row
  var i
  for (i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  // increment each column in the first row
  var j
  for (j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  // Fill in the rest of the matrix
  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1,
          ),
        ) // deletion
      }
    }
  }

  return matrix[b.length][a.length]
}

// Return
export function getJaroWinklerDistance(a: string, b: string): number {
  if (a.length === 0 || b.length === 0) return 0

  const t = getLevenshteinDistance(a, b)
  const m = Math.max(a.length, b.length) - t
  if (m === 0) return 0

  return (m / a.length + m / b.length + (m - t / 2) / m) / 3
}

// Function to compute the Damerau-Levenshtein Distance between two strings
export function getDamerauLevenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  var matrix = [];

  // Initialize the matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = new Array(a.length + 1);
    matrix[i][0] = i;
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Compute Damerau-Levenshtein distance
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      let cost = a.charAt(j - 1) === b.charAt(i - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
      
      if (i > 1 && j > 1 && a.charAt(j - 1) === b.charAt(i - 2) && a.charAt(j - 2) === b.charAt(i - 1)) {
        matrix[i][j] = Math.min(
          matrix[i][j],
          matrix[i - 2][j - 2] + cost // transposition
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Jaro Similarity
export function getJaroSimilarity(s1: string, s2: string): number {
  const s1Len: number = s1.length;
  const s2Len: number = s2.length;

  if (s1Len === 0 && s2Len === 0) return 1;

  const matchDistance: number = Math.floor(Math.max(s1Len, s2Len) / 2) - 1;
  let matches: number = 0;
  const s1Matches: boolean[] = new Array(s1Len).fill(false);
  const s2Matches: boolean[] = new Array(s2Len).fill(false);

  for (let i = 0; i < s1Len; i++) {
    const start: number = Math.max(0, i - matchDistance);
    const end: number = Math.min(i + matchDistance + 1, s2Len);

    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  let t: number = 0;
  let point: number = 0;

  for (let i = 0; i < s1Len; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[point]) point++;
    if (s1[i] !== s2[point]) t++;
    point++;
  }

  t /= 2;

  return (matches / s1Len + matches / s2Len + (matches - t) / matches) / 3;
}

// Match Rating Approach Comparison
export function getMatchRatingComparison(s1: string, s2: string): boolean {
  const preprocess = (str: string): string => {
    return str.toUpperCase().replace(/[^A-Z]/g, '');
  };

  s1 = preprocess(s1);
  s2 = preprocess(s2);

  // Placeholder for actual Match Rating Approach logic
  return s1 === s2; // Modify according to actual comparison logic
}

// Hamming Distance
export function getHammingDistance(s1: string, s2: string): number {
  if (s1.length !== s2.length) {
    throw new Error('Strings must be of equal length');
  }

  let distance: number = 0;
  for (let i = 0; i < s1.length; i++) {
    if (s1[i] !== s2[i]) {
      distance++;
    }
  }
  return distance;
}
