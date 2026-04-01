import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  History, 
  Store, 
  Calendar, 
  Package, 
  Trash2, 
  Search,
  AlertCircle,
  Upload,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

const App = () => {
  // ----------------------------------------------------------------
  // 1. 状態管理（State）
  // ----------------------------------------------------------------
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('art-inventory-v3');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'low'
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);

  // ----------------------------------------------------------------
  // 2. データの保存と計算
  // ----------------------------------------------------------------
  useEffect(() => {
    localStorage.setItem('art-inventory-v3', JSON.stringify(items));
  }, [items]);

  const calculateStock = (item) => {
    const inTotal = item.logs.filter(l => l.type === 'in').reduce((sum, l) => sum + l.qty, 0);
    const outTotal = item.logs.filter(l => l.type === 'out').reduce((sum, l) => sum + l.qty, 0);
    return Math.max(0, inTotal - outTotal);
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (activeTab === 'low') {
        return calculateStock(item) <= (item.initialQty * 0.2);
      }
      return matchesSearch;
    });
  }, [items, searchTerm, activeTab]);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // ----------------------------------------------------------------
  // 3. アクション（追加・削除・記録）
  // ----------------------------------------------------------------
  const addItem = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newItem = {
      id: Date.now().toString(),
      name: formData.get('name'),
      category: formData.get('category'),
      store: formData.get('store'),
      initialQty: Number(formData.get('qty')),
      unit: formData.get('unit'),
      logs: [{
        type: 'in',
        date: formData.get('date'),
        qty: Number(formData.get('qty')),
        note: '新規購入'
      }]
    };
    setItems([...items, newItem]);
    setShowAddModal(false);
    showToast('新しい画材を登録しました。');
  };

  const recordUsage = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedItems = items.map(item => {
      if (item.id === showUsageModal.id) {
        return {
          ...item,
          logs: [
            ...item.logs,
            {
              type: 'out',
              date: formData.get('useDate'),
              qty: Number(formData.get('useQty')),
              note: formData.get('note')
            }
          ]
        };
      }
      return item;
    });
    setItems(updatedItems);
    setShowUsageModal(null);
    showToast('使用を記録しました。');
  };

  const deleteItem = (id) => {
    if (confirm('この画材をリストから削除しますか？')) {
      setItems(items.filter(i => i.id !== id));
      showToast('アイテムを削除しました。');
    }
  };

  // ----------------------------------------------------------------
  // 4. CSVインポート（以前のフォーマット対応）
  // ----------------------------------------------------------------
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      const newItems = [];
      let currentItem = null;
      let currentInDate = '';

      for (let i = 2; i < lines.length; i++) {
        const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/^"|"$/g, ''));
        if (row.length < 5) continue;

        const inDateRaw = row[0];
        const name = row[1];
        const inQtyRaw = row[2];
        const outDateRaw = row[3];
        const outQtyRaw = row[4];
        const store = row[5];

        const cleanDate = (d) => {
          if (!d) return '';
          let parts = d.replace(/[\.,]/g, '-').split('-');
          if (parts.length === 3) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
          return d.replace(/[\.,]/g, '-');
        };

        if (inDateRaw) currentInDate = cleanDate(inDateRaw);
        if (name && name.trim() !== '') {
          const initialQty = Number(inQtyRaw) || 0;
          currentItem = {
            id: Date.now().toString() + i,
            name: name.trim(),
            category: 'その他',
            store: store || '',
            initialQty: initialQty,
            unit: name.includes('パネル') ? '枚' : name.includes('筆') ? '本' : '個',
            logs: []
          };
          if (initialQty > 0) currentItem.logs.push({ type: 'in', date: currentInDate, qty: initialQty, note: '初期入庫' });
          if (outDateRaw && outQtyRaw) currentItem.logs.push({ type: 'out', date: cleanDate(outDateRaw), qty: Number(outQtyRaw), note: '使用' });
          newItems.push(currentItem);
        } else if (currentItem && outDateRaw && outQtyRaw) {
          currentItem.logs.push({ type: 'out', date: cleanDate(outDateRaw), qty: Number(outQtyRaw), note: '使用' });
        }
      }
      setItems(newItems);
      showToast(`${newItems.length}件のデータを読み込みました。`);
    };
    reader.readAsText(file);
  };

  // ----------------------------------------------------------------
  // 5. 画面描画
  // ----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 pb-24">
      {/* 通知 */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-4">
          {notification}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-indigo-900">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Package className="w-8 h-8 text-indigo-600" />
              </div>
              Atelier Inventory
            </h1>
            <p className="text-slate-500 mt-1">衣服の主張と対話するための画材管理</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current.click()} className="flex-1 md:flex-none px-4 py-3 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
              <Upload className="w-5 h-5" />
              CSV読込
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-700 transition-all font-bold">
              <Plus className="w-5 h-5" />
              追加
            </button>
          </div>
        </header>

        {/* 検索とフィルター */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="品名や購入店で検索..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {['all', 'low'].map(t => (
              <button 
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === t ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t === 'all' ? 'すべて' : '在庫僅少'}
              </button>
            ))}
          </div>
        </div>

        {/* メインテーブル */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">品名 / 購入店</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">日付</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">在庫状況</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map(item => {
                  const stock = calculateStock(item);
                  const isLow = stock <= (item.initialQty * 0.2);
                  const isExpanded = expandedItemId === item.id;
                  const lastUse = item.logs.filter(l => l.type === 'out').pop();

                  return (
                    <React.Fragment key={item.id}>
                      <tr className={`hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50/80' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 text-lg">{item.name}</div>
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-1 uppercase font-bold tracking-tighter">
                            <Store className="w-3 h-3" /> {item.store || '未設定'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">入庫</span>
                              <span className="text-slate-600">{item.logs.find(l => l.type === 'in')?.date || '-'}</span>
                            </div>
                            {lastUse && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">使用</span>
                                <span className="text-slate-600">{lastUse.date}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-end gap-1">
                            <span className={`text-2xl font-black ${isLow ? 'text-red-500' : 'text-indigo-600'}`}>
                              {stock}
                            </span>
                            <span className="text-sm text-slate-400 mb-1 font-bold">{item.unit}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                              className={`p-2 rounded-xl border transition-all ${isExpanded ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200 hover:text-indigo-600 hover:border-indigo-100'}`}
                            >
                              <History className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => setShowUsageModal(item)}
                              className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                            >
                              <Minus className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => deleteItem(item.id)}
                              className="p-2 text-slate-300 hover:text-red-500 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* 履歴詳細表示 */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="4" className="px-6 py-6 border-b border-slate-100 bg-slate-50/50">
                            <div className="max-w-3xl bg-white border border-slate-200 rounded-2xl p-6 shadow-inner">
                              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <History className="w-4 h-4 text-indigo-400" />
                                使用履歴タイムライン
                              </h3>
                              <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
                                {item.logs.slice().reverse().map((log, idx) => (
                                  <div key={idx} className="relative pl-8">
                                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${log.type === 'in' ? 'bg-green-400' : 'bg-amber-400'}`} />
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {log.date}
                                      </span>
                                      <span className={`text-sm font-black px-3 py-1 rounded-full ${log.type === 'in' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {log.type === 'in' ? '+' : '-'}{log.qty} {item.unit}
                                      </span>
                                      <span className="text-sm font-medium text-slate-700">{log.note}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5" /> 新しい画材を登録
              </h2>
              <button onClick={() => setShowAddModal(false)}><X className="w-6 h-6 opacity-70 hover:opacity-100" /></button>
            </div>
            <form onSubmit={addItem} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">画材名</label>
                <input required name="name" className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="例: チタニウムホワイト" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">購入店</label>
                  <input name="store" className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="世界堂など" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">単位</label>
                  <input required name="unit" className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" defaultValue="個" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">数量</label>
                  <input required type="number" name="qty" className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">入庫日</label>
                  <input required type="date" name="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all mt-4">
                リストに追加する
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 使用記録モーダル */}
      {showUsageModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-amber-500 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2"><Minus className="w-5 h-5" /> 使用を記録</h2>
                <p className="text-xs opacity-80 mt-1">{showUsageModal.name}</p>
              </div>
              <button onClick={() => setShowUsageModal(null)}><X className="w-6 h-6 opacity-70 hover:opacity-100" /></button>
            </div>
            <form onSubmit={recordUsage} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">使用数</label>
                  <input required type="number" name="useQty" className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" placeholder="1" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">使用日</label>
                  <input required type="date" name="useDate" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">メモ</label>
                <input name="note" className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" placeholder="用途など" />
              </div>
              <button type="submit" className="w-full bg-amber-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-amber-600 transition-all mt-4">
                記録を保存する
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
