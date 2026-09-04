import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Download,
  Minus,
  Package,
  Plus,
  RefreshCw,
  Upload,
  X,
} from 'lucide-react';

const INITIAL_CSV = "入庫日,品名,数量,使用日,数量,購入店,残り\n2026/1/17,\"額材料　えぞ松\",5,,,\"エンチョー\",5\n,,,2026/1/17,5,,0\n,,,,,,\n2026/1/17,\"ヒノキ\",8,,,\"17\",8\n,,,2026/01/17,8,,0\n,,,,,,\n2026/1/17,\"ラワン\",1,,,\"カインズ\",1\n,,,2026/1/17,1,,0\n,,,,,,\n2026/1/17,\"手袋\",1,,,\"カインズ\",1\n,,,2026/1/17,1,,0\n,,,,,,\n2026/1/12,\"木製パネル　F4\",6,,,\"世界堂\",6\n,,,2026/1/20,6,,0\n,,,,,,\n2026/2/20,\"筆インターロン2/0号\",10,,,\"世界堂\",10\n,,,2026/3/1,1,,9\n,,,2026/08/05,9,,0\n2026/08/21,,20,,,,20\n,,,2026/08/05,1,,19\n,,,,,,\n2026/1/12,\"絵具チタニウムホワイト\",2,,,\"世界堂\",2\n,,,2026/3/18,1,,1\n,,,,,,\n2026/1/28,\"木製パネル　A5\",3,,,\"世界堂\",3\n,,,2026/3/0,3,,0\n,,,,,,\n2026/07/09,\"木枠　M10\",1,,,\"世界堂\",1\n,,,,,,\n2026/2/9,\"マスキング液\",5,,,\"アマゾン\",5\n,,,2026/2/11,1,,4\n,,,2026/2/15,1,,3\n,,,,,,\n2026/2/11,\"斎藤様ポスター\",11,,,\"ラクスル\",11\n,,,2026/2/13,11,,0\n,,,,,,\n2026/2/12,\"斎藤様額縁\",11,,,\"マルニ画材\",11\n,,,2026/2/13,11,,0\n,,,,,,\n2026/2/20,\"木製パネル M20\",2,,,\"世界堂\",2\n,,,,,,\n2026/2/26,\"木製パネルM15\",5,,,\"世界堂\",5\n,,,2026/03/03,5,,0\n,,,,,,\n2026/3/7,\"額材料（ねじ、紙やすり等）\",1,,,\"エンチョー\",1\n,,,2026/3/7,1,,0\n,,,,,,\n2026/3/7,\"桧\",10,,,\"エンチョー\",10\n,,,2026/3/7,10,,0\n,,,,,,\n2026/3/7,\"エゾ松\",10,,,\"エンチョー\",10\n,,,2026/3/7,10,,0\n,,,,,,\n2026/3/15,\"パーマネントイエローオレンジ\",1,,,\"マルニ画材\",1\n,,,,,,\n2026/3/15,\"コバルトブルー\",1,,,\"マルニ画材\",1\n,,,,,,\n2026/3/15,\"ウルトラマリン\",1,,,\"マルニ画材\",1\n,,,,,,\n2026/3/15,\"コバルトバイオレット\",1,,,\"マルニ画材\",1\n,,,,,,\n2026/3/15,\"アイボリブラック\",2,,,\"マルニ画材\",2\n,,,,,,\n2026/3/15,\"額（SDP ANI作品用)\",1,,,\"マルニ画材\",1\n,,,2026/3/23,1,,0\n,,,,,,\n2026/3/15,\"マット\",1,,,\"マルニ画材\",1\n,,,2026/3/23,1,,0\n,,,,,,\n2026/3/15,\"かぶせ箱(小川様用)\",1,,,\"マルニ画材\",1\n,,,2026/2/23,1,,0\n,,,,,,\n2026/04/06,\"額用ヒノキ\",10,,,\"カインズ\",10\n,,,2026/04/07,10,,0\n2026/04/05,,8,,,,8\n,,,2026/04/07,8,,0\n2026/04/17,,20,,,,20\n,,,2026/05/02,2,,18\n,,,,,,\n2026/04/05,\"額用エゾ松\",10,,,\"エンチョー\",10\n,,,2026/04/07,10,,0\n2026/04/17,,20,,,,20\n,,,2026/05/02,2,,18\n,,,,,,\n2026/04/05,\"額用ネジ\",6,,,\"カインズ\",6\n,,,2026/04/07,6,,0\n,,,,,,\n2026/04/05,\"耐水ペーパー\",1,,,\"カインズ\",1\n,,,,,,\n2026/04/20,\"水性塗料　オーク\",1,,,\"カインズ\",1\n,,,2026/04/20,1,,0\n,,,,,,\n2026/05/01,\"かぶせ箱\",47,,,\"マルニ画材\",47\n,,,2026/05/06,28,,19\n,,,2026/05/13,2,,17\n2026/05/15,,1,,,,18\n,,,2026/05/15,1,,17\n2026/05/19,,9,,,,26\n,,,2026/05/19,2,,24\n,,,,,,\n2026/04/26,\"板ダンボール180\",15,,,\"楽天\",15\n,,,2026/05/06,8,,7\n,,,2026/05/15,2,,5\n,,,,,,\n2026/05/15,\"ブラシクリーナー\",1,,,\"マルニ画材\",1\n,,,,,,\n2026/05/15,\"ターコイズブルー\",1,,,\"マルニ画材\",1\n2026/07/09,,1,,,,2\n,,,,,,\n2026/05/15,\"ブルーコンポーゼ\",1,,,\"マルニ画材\",1\n,,,,,,\n2026/07/09,\"木枠　F10\",5,,,\"世界堂\",5\n,,,,,,\n2026/07/09,\"シナバーグリーン　110ml\",1,,,\"世界堂\",1\n,,,,,,\n2026/07/09,\"ブルーコンポーゼ　110ml\",1,,,\"世界堂\",1\n,,,,,,\n";

const STORAGE_KEY = 'art_inventory_v5';
const CATEGORIES = [
  'すべて',
  '絵具',
  '支持体・紙',
  '筆・道具',
  'メディウム',
  'その他',
];
const ITEM_CATEGORIES = CATEGORIES.slice(1);

const CATEGORY_STYLES = {
  絵具: {
    dot: 'bg-blue-600',
    badge: 'bg-blue-50 text-blue-700',
  },
  '支持体・紙': {
    dot: 'bg-amber-700',
    badge: 'bg-amber-50 text-amber-800',
  },
  '筆・道具': {
    dot: 'bg-emerald-700',
    badge: 'bg-emerald-50 text-emerald-800',
  },
  メディウム: {
    dot: 'bg-violet-600',
    badge: 'bg-violet-50 text-violet-800',
  },
  その他: {
    dot: 'bg-stone-500',
    badge: 'bg-stone-100 text-stone-700',
  },
};

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const today = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const normalizeDate = (value) => {
  if (!value) return '';

  const parts = value
    .trim()
    .replaceAll('.', '/')
    .replaceAll('-', '/')
    .split('/');

  if (parts.length !== 3) return value;

  return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
};

const categoryFor = (name) => {
  if (
    /絵具|ホワイト|イエロー|ブルー|バイオレット|ブラック|グリーン|ウルトラマリン|水性塗料/.test(
      name,
    )
  ) {
    return '絵具';
  }

  if (/木製パネル|木枠|ポスター/.test(name)) {
    return '支持体・紙';
  }

  if (/筆|インターロン|手袋/.test(name)) {
    return '筆・道具';
  }

  if (/マスキング液|ブラシクリーナー/.test(name)) {
    return 'メディウム';
  }

  return 'その他';
};

const parseCsvRows = (text) => {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') {
        index += 1;
      }

      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
};

const inventoryFromCsv = (text) => {
  const rows = parseCsvRows(text.replace(/^\uFEFF/, ''));
  const items = [];

  let current = null;
  let headerFound = false;

  for (const sourceRow of rows) {
    const columns = [
      ...sourceRow,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ]
      .slice(0, 7)
      .map((cell) => cell.trim());

    if (columns.includes('品名') && columns.includes('入庫日')) {
      headerFound = true;
      continue;
    }

    if (!headerFound) continue;

    if (!columns.some(Boolean)) {
      current = null;
      continue;
    }

    const [
      inDate,
      name,
      inQty,
      useDate,
      useQty,
      store,
    ] = columns;

    if (name) {
      current = {
        id: newId(),
        name,
        category: categoryFor(name),
        store,
        logs: [],
      };

      items.push(current);
    }

    if (!current) continue;

    if (inDate && Number(inQty) > 0) {
      current.logs.push({
        id: newId(),
        type: 'in',
        date: normalizeDate(inDate),
        qty: Number(inQty),
      });
    }

    if (useDate && Number(useQty) > 0) {
      current.logs.push({
        id: newId(),
        type: 'out',
        date: normalizeDate(useDate),
        qty: Number(useQty),
      });
    }
  }

  return items;
};

const normalizeSavedItems = (value) => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((candidate) => {
    if (
      !candidate ||
      typeof candidate !== 'object' ||
      !candidate.name ||
      !Array.isArray(candidate.logs)
    ) {
      return [];
    }

    const logs = candidate.logs.flatMap((log) => {
      const qty = Number(log?.qty);

      if (
        !['in', 'out'].includes(log?.type) ||
        !Number.isInteger(qty) ||
        qty < 1
      ) {
        return [];
      }

      return [
        {
          id: log.id || newId(),
          type: log.type,
          date: normalizeDate(log.date || today()),
          qty,
        },
      ];
    });

    return [
      {
        id: candidate.id || newId(),
        name: String(candidate.name).trim(),
        category: ITEM_CATEGORIES.includes(candidate.category)
          ? candidate.category
          : categoryFor(String(candidate.name)),
        store: String(candidate.store || ''),
        logs,
      },
    ];
  });
};

const getStock = (item) =>
  item.logs.reduce(
    (total, log) =>
      total + (log.type === 'in' ? log.qty : -log.qty),
    0,
  );

const escapeCsv = (value) =>
  `"${String(value ?? '').replaceAll('"', '""')}"`;

export default function App() {
  const [items, setItems] = useState(() =>
    inventoryFromCsv(INITIAL_CSV),
  );
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] =
    useState('すべて');

  const [showAdd, setShowAdd] = useState(false);
  const [activity, setActivity] = useState(null);

  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptLoading, setReceiptLoading] =
    useState(false);
  const [receiptError, setReceiptError] = useState('');
  const [parsedReceipt, setParsedReceipt] =
    useState(null);

  const csvInputRef = useRef(null);

  const [addForm, setAddForm] = useState({
    name: '',
    category: '絵具',
    store: '',
    qty: 1,
    date: today(),
  });

  const [activityForm, setActivityForm] = useState({
    qty: 1,
    date: today(),
  });

  useEffect(() => {
    let restoredItems = null;

    try {
      const saved =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem('art_inventory_v3');

      if (saved) {
        const restored = normalizeSavedItems(
          JSON.parse(saved),
        );

        if (restored.length) {
          restoredItems = restored;
        }
      }
    } catch {
      // 保存データが壊れている場合は初期データを使用
    }

    queueMicrotask(() => {
      if (restoredItems) {
        setItems(restoredItems);
      }

      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items),
      );
    }
  }, [items, ready]);

  const visibleItems = useMemo(() => {
    const search = query
      .trim()
      .toLocaleLowerCase('ja');

    return items.filter((item) => {
      const categoryMatches =
        activeCategory === 'すべて' ||
        item.category === activeCategory;

      const searchMatches =
        !search ||
        `${item.name} ${item.store}`
          .toLocaleLowerCase('ja')
          .includes(search);

      return categoryMatches && searchMatches;
    });
  }, [activeCategory, items, query]);

  const totalStock = items.reduce(
    (sum, item) => sum + getStock(item),
    0,
  );

  const usedCount = items.reduce(
    (sum, item) =>
      sum +
      item.logs
        .filter((log) => log.type === 'out')
        .reduce(
          (subtotal, log) => subtotal + log.qty,
          0,
        ),
    0,
  );

  const activityItem = activity
    ? items.find(
        (item) => item.id === activity.itemId,
      )
    : null;

  const openActivity = (itemId, type) => {
    setActivityForm({
      qty: 1,
      date: today(),
    });

    setActivity({
      itemId,
      type,
    });
  };

  const addItem = (event) => {
    event.preventDefault();

    const name = addForm.name.trim();
    const qty = Number(addForm.qty);

    if (
      !name ||
      !Number.isInteger(qty) ||
      qty < 1
    ) {
      return;
    }

    setItems((current) => {
      const existingIndex = current.findIndex(
        (item) =>
          item.name.toLocaleLowerCase('ja') ===
          name.toLocaleLowerCase('ja'),
      );

      const log = {
        id: newId(),
        type: 'in',
        date: addForm.date,
        qty,
      };

      if (existingIndex < 0) {
        return [
          ...current,
          {
            id: newId(),
            name,
            category: addForm.category,
            store: addForm.store.trim(),
            logs: [log],
          },
        ];
      }

      return current.map((item, index) =>
        index === existingIndex
          ? {
              ...item,
              store:
                addForm.store.trim() || item.store,
              logs: [...item.logs, log],
            }
          : item,
      );
    });

    setAddForm({
      name: '',
      category: '絵具',
      store: '',
      qty: 1,
      date: today(),
    });

    setShowAdd(false);
  };

  const recordActivity = (event) => {
    event.preventDefault();

    if (!activity || !activityItem) return;

    const qty = Number(activityForm.qty);

    if (
      !Number.isInteger(qty) ||
      qty < 1
    ) {
      return;
    }

    if (
      activity.type === 'out' &&
      qty > getStock(activityItem)
    ) {
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === activity.itemId
          ? {
              ...item,
              logs: [
                ...item.logs,
                {
                  id: newId(),
                  type: activity.type,
                  date: activityForm.date,
                  qty,
                },
              ],
            }
          : item,
      ),
    );

    setActivity(null);
  };

  const importCsv = (file) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const imported = inventoryFromCsv(
        typeof reader.result === 'string'
          ? reader.result
          : '',
      );

      if (imported.length) {
        setItems(imported);
      }
    };

    reader.readAsText(file);
  };

  const exportCsv = () => {
    const rows = [
      '入庫日,品名,数量,使用日,数量,購入店,残り',
    ];

    for (const item of items) {
      let stock = 0;

      item.logs.forEach((log, index) => {
        stock +=
          log.type === 'in'
            ? log.qty
            : -log.qty;

        rows.push(
          [
            log.type === 'in'
              ? log.date.replaceAll('-', '/')
              : '',
            index === 0
              ? escapeCsv(item.name)
              : '',
            log.type === 'in'
              ? log.qty
              : '',
            log.type === 'out'
              ? log.date.replaceAll('-', '/')
              : '',
            log.type === 'out'
              ? log.qty
              : '',
            index === 0
              ? escapeCsv(item.store)
              : '',
            stock,
          ].join(','),
        );
      });

      rows.push(',,,,,,');
    }

    const blob = new Blob(
      [`\uFEFF${rows.join('\n')}`],
      {
        type: 'text/csv;charset=utf-8',
      },
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = '画材リスト_更新済.csv';
    link.click();

    URL.revokeObjectURL(url);
  };

  const readReceipt = async (file) => {
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setReceiptError(
        'ファイルは4MB以内にしてください。',
      );
      return;
    }

    setReceiptLoading(true);
    setReceiptError('');

    try {
      const fileData = await new Promise(
        (resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () =>
            resolve(
              typeof reader.result === 'string'
                ? reader.result.split(',')[1]
                : '',
            );

          reader.onerror = reject;
          reader.readAsDataURL(file);
        },
      );

      const response = await fetch(
        '/api/parse-receipt',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type,
            fileData,
            existingItems: items.map(
              (item) => item.name,
            ),
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.receipt) {
        throw new Error(
          result.error ||
            '読み取りに失敗しました。',
        );
      }

      setParsedReceipt({
        ...result.receipt,
        date:
          result.receipt.date || today(),
      });
    } catch (error) {
      setReceiptError(
        error.message ||
          '読み取りに失敗しました。',
      );
    } finally {
      setReceiptLoading(false);
    }
  };

  const importReceipt = () => {
    if (!parsedReceipt?.items?.length) return;

    setItems((current) => {
      const next = [...current];

      for (const entry of parsedReceipt.items) {
        const name = String(
          entry.name || '',
        ).trim();
        const qty = Number(entry.qty);

        if (
          !name ||
          !Number.isInteger(qty) ||
          qty < 1
        ) {
          continue;
        }

        const index = next.findIndex(
          (item) =>
            item.name.toLocaleLowerCase('ja') ===
            name.toLocaleLowerCase('ja'),
        );

        const log = {
          id: newId(),
          type: 'in',
          date:
            parsedReceipt.date || today(),
          qty,
        };

        if (index >= 0) {
          next[index] = {
            ...next[index],
            store:
              parsedReceipt.store ||
              next[index].store,
            logs: [
              ...next[index].logs,
              log,
            ],
          };
        } else {
          next.push({
            id: newId(),
            name,
            category:
              ITEM_CATEGORIES.includes(
                entry.category,
              )
                ? entry.category
                : categoryFor(name),
            store:
              parsedReceipt.store || '',
            logs: [log],
          });
        }
      }

      return next;
    });

    setParsedReceipt(null);
    setShowReceipt(false);
  };

  return (
    <main className="min-h-screen bg-[#f5f3ed] text-[#242521]">
      <header className="border-b border-[#dedbd2] bg-[#fbfaf5]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-5 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-8 md:py-8">
          <div className="flex items-center gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#315bd7] text-white shadow-lg shadow-blue-900/10">
              <Package size={20} />
            </div>

            <div>
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#76736b]">
                Atelier stock
              </p>

              <h1 className="text-[22px] font-semibold tracking-[-0.04em]">
                画材庫
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) =>
                importCsv(
                  event.target.files?.[0],
                )
              }
            />

            <HeaderButton
              onClick={() =>
                csvInputRef.current?.click()
              }
            >
              <Upload size={16} />
              CSV読込
            </HeaderButton>

            <HeaderButton onClick={exportCsv}>
              <Download size={16} />
              CSV保存
            </HeaderButton>

            <HeaderButton
              onClick={() => {
                setReceiptError('');
                setParsedReceipt(null);
                setShowReceipt(true);
              }}
            >
              <Package size={16} />
              領収書から登録
            </HeaderButton>

            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="flex h-11 items-center gap-2 rounded-xl bg-[#315bd7] px-4 text-sm font-semibold text-white shadow-lg shadow-blue-900/10 hover:bg-[#294fc0]"
            >
              <Plus size={17} />
              画材を登録
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1240px] px-5 py-7 md:px-8 md:py-10">
        <div className="mb-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_310px]">
          <div className="rounded-2xl border border-[#dedbd2] bg-[#fffdf8] p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#e9edfb] text-[#315bd7]">
                  <Package size={16} />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    表示数はすべて「未使用品」
                  </p>

                  <p className="mt-0.5 text-xs text-[#76736b]">
                    使い始めた時点で、使用済みとして在庫から減らします。
                  </p>
                </div>
              </div>

              <div className="flex gap-7 border-t border-[#ebe8df] pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                <Stat
                  label="未使用"
                  value={totalStock}
                />

                <Stat
                  label="使用記録"
                  value={usedCount}
                />
              </div>
            </div>
          </div>

          <div className="flex min-h-[82px] items-center gap-3 rounded-2xl border border-[#dedbd2] bg-[#fffdf8] px-5 shadow-sm focus-within:border-[#9aa9df]">
            <span
              className="text-lg text-[#88847d]"
              aria-hidden="true"
            >
              ⌕
            </span>

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="品名・購入店を検索"
              aria-label="品名または購入店で検索"
              className="h-11 w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-2">
          <span className="mr-1 shrink-0 text-[10px] font-bold tracking-widest text-[#8b877f]">
            分類
          </span>

          {CATEGORIES.map((category) => {
            const count =
              category === 'すべて'
                ? items.length
                : items.filter(
                    (item) =>
                      item.category === category,
                  ).length;

            const selected =
              activeCategory === category;

            return (
              <button
                type="button"
                key={category}
                onClick={() =>
                  setActiveCategory(category)
                }
                className={`flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-xs font-medium ${
                  selected
                    ? 'border-[#315bd7] bg-[#315bd7] text-white'
                    : 'border-[#d9d6cd] bg-[#fffdf8] text-[#68655e]'
                }`}
              >
                {category}

                <span
                  className={
                    selected
                      ? 'text-white/65'
                      : 'text-[#aaa69d]'
                  }
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#dcd9d0] bg-[#fffdf8] shadow-sm">
          <div className="hidden grid-cols-[minmax(240px,1.4fr)_minmax(220px,1fr)_100px_210px] gap-6 border-b border-[#e5e2d9] bg-[#f2f0e9] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8b877f] lg:grid">
            <span>画材</span>
            <span>最近の履歴</span>
            <span className="text-center">
              未使用
            </span>
            <span className="text-right">
              記録
            </span>
          </div>

          {visibleItems.length ? (
            visibleItems.map((item) => (
              <InventoryRow
                key={item.id}
                item={item}
                onActivity={openActivity}
              />
            ))
          ) : (
            <div className="grid min-h-72 place-items-center px-6 text-center text-[#7d7971]">
              該当する画材がありません。
            </div>
          )}
        </div>

        <footer className="mt-5 flex flex-col gap-2 px-1 text-xs text-[#8b877f] sm:flex-row sm:justify-between">
          <span>
            {visibleItems.length}件を表示中
          </span>

          <span className="flex items-center gap-1.5">
            <RefreshCw size={14} />
            入庫と使用の履歴から未使用数を計算しています
          </span>
        </footer>
      </section>

      {showAdd && (
        <Modal
          title="新しい画材を登録"
          description="登録した数量が未使用在庫に追加されます。"
          onClose={() => setShowAdd(false)}
        >
          <form
            onSubmit={addItem}
            className="space-y-5"
          >
            <Field label="品名">
              <input
                required
                value={addForm.name}
                onChange={(event) =>
                  setAddForm({
                    ...addForm,
                    name: event.target.value,
                  })
                }
                className="input"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="ジャンル">
                <select
                  value={addForm.category}
                  onChange={(event) =>
                    setAddForm({
                      ...addForm,
                      category:
                        event.target.value,
                    })
                  }
                  className="input"
                >
                  {ITEM_CATEGORIES.map(
                    (category) => (
                      <option key={category}>
                        {category}
                      </option>
                    ),
                  )}
                </select>
              </Field>

              <Field label="数量">
                <input
                  required
                  type="number"
                  min="1"
                  value={addForm.qty}
                  onChange={(event) =>
                    setAddForm({
                      ...addForm,
                      qty: event.target.value,
                    })
                  }
                  className="input"
                />
              </Field>
            </div>

            <Field label="購入店">
              <input
                value={addForm.store}
                onChange={(event) =>
                  setAddForm({
                    ...addForm,
                    store: event.target.value,
                  })
                }
                className="input"
              />
            </Field>

            <Field label="入庫日">
              <input
                required
                type="date"
                value={addForm.date}
                onChange={(event) =>
                  setAddForm({
                    ...addForm,
                    date: event.target.value,
                  })
                }
                className="input"
              />
            </Field>

            <ModalActions
              onCancel={() =>
                setShowAdd(false)
              }
              submitLabel="登録する"
            />
          </form>
        </Modal>
      )}

      {activity && activityItem && (
        <Modal
          title={
            activity.type === 'in'
              ? '未使用品を入庫'
              : '使用済みにする'
          }
          description={activityItem.name}
          onClose={() => setActivity(null)}
        >
          <form
            onSubmit={recordActivity}
            className="space-y-5"
          >
            {activity.type === 'out' && (
              <div className="flex justify-between rounded-xl bg-[#f1efe9] px-4 py-3 text-sm">
                <span>
                  現在の未使用在庫
                </span>

                <strong>
                  {getStock(activityItem)}点
                </strong>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field label="数量">
                <input
                  required
                  type="number"
                  min="1"
                  max={
                    activity.type === 'out'
                      ? getStock(activityItem)
                      : undefined
                  }
                  value={activityForm.qty}
                  onChange={(event) =>
                    setActivityForm({
                      ...activityForm,
                      qty: event.target.value,
                    })
                  }
                  className="input"
                />
              </Field>

              <Field
                label={
                  activity.type === 'in'
                    ? '入庫日'
                    : '使用日'
                }
              >
                <input
                  required
                  type="date"
                  value={activityForm.date}
                  onChange={(event) =>
                    setActivityForm({
                      ...activityForm,
                      date: event.target.value,
                    })
                  }
                  className="input"
                />
              </Field>
            </div>

            {activity.type === 'out' && (
              <p className="text-xs leading-5 text-[#77736c]">
                製品を使い始めた時点で登録します。使用後の残量や状態は管理しません。
              </p>
            )}

            <ModalActions
              onCancel={() =>
                setActivity(null)
              }
              submitLabel="記録する"
            />
          </form>
        </Modal>
      )}

      {showReceipt && (
        <Modal
          title="領収書・納品書から登録"
          description="PDFや写真を読み取り、確認後に未使用在庫へ追加します。"
          onClose={() =>
            setShowReceipt(false)
          }
          wide
        >
          <div className="space-y-5">
            {!parsedReceipt && (
              <label className="grid min-h-40 cursor-pointer place-items-center rounded-2xl border border-dashed border-[#bfc5d7] bg-[#f7f8fc] p-6 text-center">
                <input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={receiptLoading}
                  onChange={(event) =>
                    readReceipt(
                      event.target.files?.[0],
                    )
                  }
                />

                <span>
                  {receiptLoading ? (
                    <RefreshCw className="mx-auto mb-3 animate-spin text-[#315bd7]" />
                  ) : (
                    <Upload className="mx-auto mb-3 text-[#315bd7]" />
                  )}

                  <strong className="block text-sm">
                    {receiptLoading
                      ? '読み取り中…'
                      : 'PDFまたは画像を選択'}
                  </strong>

                  <span className="mt-1 block text-xs text-[#77736c]">
                    4MBまで
                  </span>
                </span>
              </label>
            )}

            {receiptError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {receiptError}
              </div>
            )}

            {parsedReceipt && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="購入店">
                    <input
                      value={parsedReceipt.store}
                      onChange={(event) =>
                        setParsedReceipt({
                          ...parsedReceipt,
                          store:
                            event.target.value,
                        })
                      }
                      className="input"
                    />
                  </Field>

                  <Field label="入庫日">
                    <input
                      type="date"
                      value={parsedReceipt.date}
                      onChange={(event) =>
                        setParsedReceipt({
                          ...parsedReceipt,
                          date:
                            event.target.value,
                        })
                      }
                      className="input"
                    />
                  </Field>
                </div>

                {parsedReceipt.items.map(
                  (entry, index) => (
                    <div
                      key={`${entry.name}-${index}`}
                      className="flex items-center justify-between gap-4 rounded-xl border border-[#e3e0d8] bg-white p-4"
                    >
                      <span className="min-w-0 flex-1 text-sm font-semibold">
                        {entry.name}
                      </span>

                      <span className="text-xs text-[#77736c]">
                        {entry.category}
                      </span>

                      <strong>
                        {entry.qty}点
                      </strong>
                    </div>
                  ),
                )}

                <p className="text-xs leading-5 text-[#77736c]">
                  読み取りのため書類をOpenAI
                  APIへ送信します。品名と数量を確認してから登録してください。
                </p>

                <div className="flex justify-end gap-2 border-t border-[#e7e4dc] pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      setShowReceipt(false)
                    }
                    className="h-10 rounded-xl px-4 text-sm"
                  >
                    キャンセル
                  </button>

                  <button
                    type="button"
                    onClick={importReceipt}
                    className="flex h-10 items-center gap-2 rounded-xl bg-[#315bd7] px-5 text-sm font-semibold text-white"
                  >
                    {parsedReceipt.items.length}
                    件を登録
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      <style>{`
        .input {
          height: 44px;
          width: 100%;
          border: 1px solid #d8d5cc;
          border-radius: 12px;
          background: white;
          padding: 0 12px;
          font-size: 14px;
          outline: none;
        }

        .input:focus {
          border-color: #7288d8;
          box-shadow: 0 0 0 3px rgba(49, 91, 215, 0.12);
        }
      `}</style>
    </main>
  );
}

function HeaderButton({
  children,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 items-center gap-2 rounded-xl border border-[#d8d5cc] bg-[#fffdf8] px-3 text-xs font-semibold text-[#55534e] hover:bg-white"
    >
      {children}
    </button>
  );
}

function InventoryRow({
  item,
  onActivity,
}) {
  const stock = getStock(item);
  const recentLogs = [
    ...item.logs,
  ]
    .reverse()
    .slice(0, 2);

  const style =
    CATEGORY_STYLES[item.category] ||
    CATEGORY_STYLES.その他;

  return (
    <article className="grid gap-5 border-b border-[#e9e6de] px-5 py-5 last:border-b-0 lg:grid-cols-[minmax(240px,1.4fr)_minmax(220px,1fr)_100px_210px] lg:items-center lg:gap-6 lg:px-6">
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${style.dot}`}
          />

          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${style.badge}`}
          >
            {item.category}
          </span>
        </div>

        <h2 className="truncate text-[15px] font-semibold">
          {item.name}
        </h2>

        <p className="mt-1 truncate text-xs text-[#807c74]">
          {item.store || '購入店未登録'}
        </p>
      </div>

      <div className="space-y-1.5">
        {recentLogs.map((log) => (
          <div
            key={log.id}
            className="flex items-center gap-3 text-xs"
          >
            <span className="w-[78px] text-[#8a867e]">
              {log.date.replaceAll('-', '.')}
            </span>

            <span
              className={`w-12 rounded-md px-1.5 py-0.5 text-center text-[9px] font-bold ${
                log.type === 'in'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              {log.type === 'in'
                ? '入庫'
                : '使用'}
            </span>

            <strong>
              {log.type === 'in'
                ? '+'
                : '−'}
              {log.qty}
            </strong>
          </div>
        ))}
      </div>

      <div className="flex items-baseline justify-between border-y border-[#ece9e1] py-3 lg:block lg:border-0 lg:py-0 lg:text-center">
        <span className="text-[10px] font-bold text-[#8d8981] lg:hidden">
          未使用在庫
        </span>

        <div>
          <strong className="text-3xl font-semibold">
            {stock}
          </strong>

          <span className="ml-1 text-xs text-[#827f77]">
            点
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() =>
            onActivity(item.id, 'in')
          }
          className="flex h-9 flex-1 items-center justify-center gap-2 rounded-xl border border-[#d8d5cc] px-3 text-xs font-semibold lg:flex-none"
        >
          <Plus size={15} />
          入庫
        </button>

        <button
          type="button"
          disabled={stock === 0}
          onClick={() =>
            onActivity(item.id, 'out')
          }
          className="flex h-9 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-[#ecebe6] px-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 lg:flex-none"
        >
          <Minus size={15} />
          使用済みにする
        </button>
      </div>
    </article>
  );
}

function Modal({
  title,
  description,
  children,
  onClose,
  wide = false,
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4">
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0 bg-[#20211f]/40 backdrop-blur-sm"
      />

      <div
        className={`relative my-6 w-full ${
          wide
            ? 'max-w-[620px]'
            : 'max-w-[480px]'
        } overflow-hidden rounded-2xl border border-[#dedbd2] bg-[#fffdf8] shadow-2xl`}
      >
        <div className="flex items-start justify-between border-b border-[#e7e4dc] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold">
              {title}
            </h2>

            <p className="mt-1 text-sm text-[#77736c]">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="rounded-lg p-1 text-[#77736c] hover:bg-[#efede7]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] font-semibold tracking-[0.08em] text-[#66635d]">
        {label}
      </span>

      {children}
    </label>
  );
}

function ModalActions({
  onCancel,
  submitLabel,
}) {
  return (
    <div className="flex justify-end gap-2 border-t border-[#e7e4dc] pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="h-10 rounded-xl px-4 text-sm"
      >
        キャンセル
      </button>

      <button
        type="submit"
        className="flex h-10 items-center gap-2 rounded-xl bg-[#315bd7] px-5 text-sm font-semibold text-white"
      >
        {submitLabel}
        <Plus size={16} />
      </button>
    </div>
  );
}

function Stat({
  label,
  value,
}) {
  return (
    <div>
      <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a867e]">
        {label}
      </span>

      <strong className="mt-1 block text-xl font-semibold">
        {value}
      </strong>
    </div>
  );
}
