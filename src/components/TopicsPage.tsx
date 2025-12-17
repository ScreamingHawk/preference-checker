import { useMemo, useState, type FC } from 'react';
import Button from './Button';
import { useTopic, useTopicsList } from '../context/TopicContext';
import type { Choice } from '../utils/topics';

const TopicsPage: FC<{ onSelect?: () => void }> = ({ onSelect }) => {
  const { topic, setTopic, importTopic } = useTopic();
  const topics = useTopicsList();
  const [importName, setImportName] = useState('');
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const canImport = useMemo(() => importName.trim().length > 0 && importJson.trim().length > 0, [importName, importJson]);

  const parseImportedChoices = (raw: string): Choice[] => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error('Invalid JSON.');
    }

    if (!Array.isArray(parsed)) {
      throw new Error('Expected a JSON array of topic entries.');
    }

    const ids = new Set<string>();
    const choices: Choice[] = parsed.map((entry, index) => {
      if (!entry || typeof entry !== 'object') {
        throw new Error(`Entry ${index + 1} must be an object.`);
      }
      const candidate = entry as Record<string, unknown>;
      const id = candidate.id;
      const name = candidate.name;
      const description = candidate.description;
      const image = candidate.image;
      const type = candidate.type;

      if (typeof id !== 'string' || id.trim().length === 0) throw new Error(`Entry ${index + 1} is missing a string "id".`);
      if (ids.has(id)) throw new Error(`Duplicate id "${id}" found.`);
      ids.add(id);
      if (typeof name !== 'string' || name.trim().length === 0) throw new Error(`Entry ${index + 1} is missing a string "name".`);
      if (typeof description !== 'string') throw new Error(`Entry ${index + 1} is missing a string "description".`);
      if (typeof image !== 'string' || image.trim().length === 0)
        throw new Error(`Entry ${index + 1} is missing a string "image".`);
      if (typeof type !== 'undefined' && typeof type !== 'string') throw new Error(`Entry ${index + 1} has invalid "type".`);

      return { id, name, description, image, ...(type ? { type } : {}) } satisfies Choice;
    });

    if (choices.length < 2) {
      throw new Error('Topic must include at least 2 entries.');
    }

    return choices;
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-transparent p-5 shadow-[0_10px_30px_-12px_rgba(236,72,153,0.25)] backdrop-blur">
      <div className="mb-4">
        <p className="text-xl font-semibold text-white">Pick a topic to explore</p>
      </div>
      <div className="mb-5 rounded-2xl border border-white/5 bg-slate-950/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Import a topic</p>
            <p className="text-xs text-slate-300">Paste a JSON array with the same shape as `data/topics/*.json`.</p>
          </div>
          <Button variant="subtle" className="px-3 py-2 text-sm" onClick={() => setImportOpen((open) => !open)}>
            {importOpen ? 'Hide' : 'Show'}
          </Button>
        </div>

        {importOpen && (
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-medium text-slate-200">Topic name</span>
              <input
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none ring-pink-300/40 placeholder:text-slate-500 focus:border-pink-300/50 focus:ring-2"
                value={importName}
                onChange={(event) => setImportName(event.target.value)}
                placeholder="My custom topic"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-medium text-slate-200">JSON</span>
              <textarea
                className="min-h-28 w-full resize-y rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 font-mono text-xs text-white outline-none ring-pink-300/40 placeholder:text-slate-500 focus:border-pink-300/50 focus:ring-2"
                value={importJson}
                onChange={(event) => setImportJson(event.target.value)}
                placeholder='[{"id":"example","name":"Example","description":"...","image":"https://..."}]'
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="file"
                  accept="application/json,.json"
                  className="block text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-700"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    file
                      .text()
                      .then((text) => {
                        setImportJson(text);
                        setImportError(null);
                      })
                      .catch(() => {
                        setImportError('Unable to read file.');
                      });
                  }}
                />
              </label>

              <Button
                variant={canImport ? 'solid' : 'subtle'}
                className="px-3 py-2 text-sm"
                disabled={!canImport}
                onClick={() => {
                  setImportError(null);
                  const name = importName.trim();
                  if (!name) {
                    setImportError('Topic name is required.');
                    return;
                  }

                  let choices: Choice[];
                  try {
                    choices = parseImportedChoices(importJson);
                  } catch (error) {
                    setImportError(error instanceof Error ? error.message : 'Unable to import topic.');
                    return;
                  }

                  const newTopic = importTopic({ name, description: `Custom topic (${choices.length} entries)` }, choices);
                  setTopic(newTopic);
                  setImportName('');
                  setImportJson('');
                  setImportOpen(false);
                  onSelect?.();
                }}
              >
                Load topic
              </Button>
            </div>

            {importError && <p className="text-xs text-rose-200">{importError}</p>}
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {topics.map((item) => {
          const active = item.filename === topic.filename;
          return (
            <div
              key={item.filename}
              data-topic-card={item.filename}
              className={`rounded-2xl border px-4 py-3 transition ${
                active ? 'border-pink-300/60 bg-pink-200/10' : 'border-white/5 bg-slate-900/60 hover:border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-slate-300">{item.description}</p>
                </div>
                {active && <span className="rounded-full bg-pink-200/30 px-2 py-1 text-xs text-pink-50">Active</span>}
              </div>
              <div className="mt-3">
                <Button
                  variant={active ? 'subtle' : 'solid'}
                  className="px-3 py-2 text-sm"
                  onClick={() => {
                    setTopic(item);
                    onSelect?.();
                  }}
                >
                  {active ? 'Selected' : 'Use this'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopicsPage;
