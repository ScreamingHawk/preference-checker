import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import {
  checkImage,
  findTopic,
  loadTopicsIndex,
  readTopicEntries,
  resolveTopicPath,
  type TopicEntry,
} from './check-topic-images.ts';

type WikipediaPage = {
  index?: number;
  title: string;
  thumbnail?: { source: string; width?: number; height?: number };
  original?: { source: string; width?: number; height?: number };
};

async function main() {
  const args = process.argv.slice(2);
  const refresh = args.includes('--refresh');
  const topicInput = args.find((arg) => !arg.startsWith('-'));

  if (!topicInput) {
    console.error(
      'Usage: pnpm data:update-images -- [--refresh] <topic-name>'
    );
    process.exit(1);
  }

  const topicsIndex = await loadTopicsIndex();
  const topicMeta = findTopic(topicsIndex, topicInput);

  if (!topicMeta) {
    console.error(`Topic not found for "${topicInput}". Available topics:`);
    topicsIndex.forEach((topic) => {
      const slug = path.basename(topic.filename, path.extname(topic.filename));
      console.error(`- ${topic.name} (${slug})`);
    });
    process.exit(1);
  }

  const topicPath = resolveTopicPath(topicMeta.filename);
  const topicEntries = await readTopicEntries(topicPath);
  const results = await runWithConcurrency(
    topicEntries,
    5,
    (entry) => processEntry(entry, { refresh })
  );

  results.forEach(({ logs }) => {
    logs.forEach((line) => console.log(line));
  });

  const nextEntries = results
    .map((result) => result.entry)
    .filter((entry): entry is TopicEntry => entry !== null);
  const updated = results.some((result) => result.updated);

  if (updated) {
    await writeTopicEntries(topicPath, nextEntries);
    console.log(`Updated ${topicMeta.filename}`);
  } else {
    console.log('No updates were necessary.');
  }
}

async function processEntry(
  entry: TopicEntry,
  options: { refresh: boolean }
): Promise<{
  logs: string[];
  entry: TopicEntry | null;
  updated: boolean;
}> {
  const logs: string[] = [];
  const result = await checkImage(entry.image);
  const shouldReplace = options.refresh || !result.ok;

  if (!shouldReplace) {
    logs.push(`[OK] ${entry.id} -> ${entry.image}`);
    return { logs, entry, updated: false };
  }

  if (!options.refresh) {
    logs.push(
      `[MISSING] ${entry.id} -> ${entry.image}${
        result.detail ? ` (${result.detail})` : ''
      }`
    );
  } else {
    logs.push(`[REFRESH] ${entry.id} -> ${entry.image}`);
  }

  const replacement = await findReplacementImage(entry);

  if (replacement) {
    logs.push(`[UPDATE] ${entry.id} -> ${replacement}`);
    return {
      logs,
      entry: { ...entry, image: replacement },
      updated: true,
    };
  }

  logs.push(`[REMOVE] No replacement found for ${entry.id}`);
  return { logs, entry: null, updated: true };
}

async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let current = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = current++;
      if (index >= items.length) {
        break;
      }
      results[index] = await worker(items[index], index);
    }
  });

  await Promise.all(runners);
  return results;
}

async function findReplacementImage(entry: TopicEntry) {
  const query = buildQuery(entry);
  const pages = await searchWikipedia(query);

  if (pages.length === 0) {
    return null;
  }

  const sorted = pages.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  for (const page of sorted.slice(0, 5)) {
    const source = page.original?.source ?? page.thumbnail?.source ?? null;

    if (source) {
      return source;
    }
  }

  return null;
}

function buildQuery(entry: TopicEntry) {
  return entry.name;
}

async function searchWikipedia(query: string) {
  const searchUrl = new URL('https://en.wikipedia.org/w/api.php');

  searchUrl.search = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrlimit: '5',
    gsrsearch: query,
    prop: 'pageimages',
    piprop: 'thumbnail|original',
    pilicense: 'any',
    pithumbsize: '1600',
  }).toString();

  try {
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'preference-checker/update-topic-images',
      },
    });

    if (!response.ok) {
      console.warn(
        `Wikipedia search failed (${response.status} ${response.statusText})`
      );
      return [];
    }

    const payload = await response.json();
    const pages = payload?.query?.pages;

    if (!pages) {
      return [];
    }

    return Object.values(pages) as WikipediaPage[];
  } catch (error) {
    console.error('Search error:', (error as Error).message);
    return [];
  }
}

async function writeTopicEntries(targetPath: string, entries: TopicEntry[]) {
  const contents = `${JSON.stringify(entries, null, 2)}\n`;
  await writeFile(targetPath, contents, 'utf8');
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
