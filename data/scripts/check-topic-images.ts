import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type TopicMeta = {
  name: string;
  description?: string;
  filename: string;
};

type TopicEntry = {
  id: string;
  name: string;
  description?: string;
  image: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');
const dataDir = path.join(repoRoot, 'data');

async function main() {
  const topicInput = process.argv[2];

  if (!topicInput) {
    console.error('Usage: pnpm data:check-images -- <topic-name>');
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

  const topicPath = path.join(dataDir, topicMeta.filename);
  const topicEntries = await readTopicEntries(topicPath);

  let missingCount = 0;

  for (const entry of topicEntries) {
    const result = await checkImage(entry.image);
    const prefix = result.ok ? '[OK]' : '[MISSING]';
    const detail = result.detail ? ` (${result.detail})` : '';

    console.log(`${prefix} ${entry.id} -> ${entry.image}${detail}`);

    if (!result.ok) {
      missingCount += 1;
    }
  }

  console.log(
    `Finished checking ${topicEntries.length} images. Missing: ${missingCount}.`
  );

  if (missingCount > 0) {
    process.exitCode = 1;
  }
}

async function loadTopicsIndex(): Promise<TopicMeta[]> {
  const topicsPath = path.join(dataDir, 'topics.json');
  const contents = await readFile(topicsPath, 'utf8');
  return JSON.parse(contents) as TopicMeta[];
}

function findTopic(topics: TopicMeta[], input: string): TopicMeta | undefined {
  const normalizedInput = input.trim().toLowerCase();

  return topics.find((topic) => {
    const nameMatch = topic.name.trim().toLowerCase() === normalizedInput;
    const slug = path
      .basename(topic.filename, path.extname(topic.filename))
      .toLowerCase();

    return nameMatch || slug === normalizedInput;
  });
}

async function readTopicEntries(topicPath: string): Promise<TopicEntry[]> {
  const contents = await readFile(topicPath, 'utf8');
  return JSON.parse(contents) as TopicEntry[];
}

async function checkImage(imageLocation: string) {
  if (/^https?:\/\//i.test(imageLocation)) {
    return checkRemoteImage(imageLocation);
  }

  return checkLocalImage(imageLocation);
}

async function checkRemoteImage(imageUrl: string) {
  try {
    const headResponse = await fetch(imageUrl, {
      method: 'HEAD',
      redirect: 'follow',
    });

    if (headResponse.ok) {
      return { ok: true, detail: `HEAD ${headResponse.status}` };
    }

    if (headResponse.status === 405) {
      const getResponse = await fetch(imageUrl, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
        redirect: 'follow',
      });

      if (getResponse.ok) {
        return {
          ok: true,
          detail: `GET ${getResponse.status} (fallback)`,
        };
      }

      return {
        ok: false,
        detail: `GET ${getResponse.status} ${getResponse.statusText}`,
      };
    }

    return {
      ok: false,
      detail: `HEAD ${headResponse.status} ${headResponse.statusText}`,
    };
  } catch (error) {
    return { ok: false, detail: (error as Error).message };
  }
}

async function checkLocalImage(imageLocation: string) {
  const resolved = path.isAbsolute(imageLocation)
    ? imageLocation
    : path.join(repoRoot, imageLocation);

  if (await fileExists(resolved)) {
    return { ok: true, detail: resolved };
  }

  const dataRelative = path.join(dataDir, imageLocation);

  if (dataRelative !== resolved && (await fileExists(dataRelative))) {
    return { ok: true, detail: dataRelative };
  }

  const triedPaths =
    dataRelative === resolved
      ? resolved
      : `${resolved}; ${dataRelative}`;

  return { ok: false, detail: `File not found. Tried: ${triedPaths}` };
}

async function fileExists(targetPath: string) {
  try {
    await access(targetPath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
