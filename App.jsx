import React, { useState, useEffect, useMemo } from 'react';
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
  X,
  Clock,
  ChevronRight,
  Palette
} from 'lucide-react';

/**
 * Atelier Inventory - 完全版
 * 衣服の細密描写に没頭する時間を支え、画材との対話を記録します。
 */
const App = () => {
  // ----------------------------------------------------------------
  // 1. 状態管理（データの保存と読み込み）
  // ----------------------------------------------------------------
  const [items, setItems] = useState(() => {
    // ローカルストレージからデータを読み込む
    const saved = localStorage.getItem('art-inventory-v3');
    // 初回起動時のサンプルデータ
    const defaultData = [
      { 
        id: '1', 
        name: '筆インターロン 2/0号', 
        store: '世界堂', 
        initialQty: 8, 
        unit: '本', 
        logs: [
          { type: 'in', date: '2026-01-12', qty: 8, note: '初期導入' },
          { type: 'out', date: '2026-02-17', qty: 1, note: '衣服の襟元の描写に使用' },
          { type: 'out', date: '2026-03-01', qty: 1, note: 'ボタンの光沢の加筆に使用' }
        ] 
      }
    ];
    return saved ? JSON.parse(saved) : defaultData;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [notification, setNotification] = useState(null);

  // データの変化を検知して自動保存
  useEffect(() => {
    localStorage.setItem('art-inventory-v3', JSON.stringify(items));
  }, [items]);

  // ----------------------------------------------------------------
  // 2. ロジック（在庫計算・フィルタリング）
  // ----------------------------------------------------------------
  const calculateStock = (item) => {
    const inTotal = item.logs.filter(l => l.type === 'in').reduce((sum, l) => sum + l.qty, 0);
    const outTotal = item.logs.filter(l => l.type === 'out').reduce((sum, l) => sum + l.qty, 0);
    return Math.max(0, inTotal - outTotal);
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.store && item.store.toLowerCase().includes(searchTerm.toLowerCase()));
      if (activeTab === 'low') return calculateStock(item) <= (item.initialQty * 0.2);
      return matchesSearch;
    });
  }, [items, searchTerm, activeTab]);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // ----------------------------------------------------------------
  // 3. アクション（追加・記録・削除）
  // ----------------------------------------------------------------
  const addItem = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newItem = {
      id: Date.now().toString(),
      name: formData.get('name'),
      store: formData.get('store'),
      initialQty: Number(formData.get('qty')),
      unit: formData.get('unit') || '個',
      logs: [{
        type: 'in',
        date: formData.get('date'),
        qty: Number(formData.get('qty')),
        note: '新規購入'
      }]
    };
    setItems([...items, newItem]);
    setShowAddModal(false);
    showToast('新しい画材を迎え入れました');
  };

  const recordUsage = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedItems = items.map(item => {
      if (item.id === showUsageModal.id) {
        return {
          ...item,
          logs: [...item.logs, {
            type: 'out',
            date: formData.get('useDate'),
            qty: Number(formData.get('useQty')),
            note: formData.get('note')
          }]
        };
      }
      return item;
    });
    setItems(updatedItems);
    setShowUsageModal(null);
    showToast('制作の記録を保存しました');
  };

  const deleteItem = (id) => {
    if (window.confirm('この画材の記録を完全に削除しますか？')) {
      setItems(items.filter(i => i.id !== id));
      showToast('リストを整理しました');
    }
  };

  // ----------------------------------------------------------------
  // 4. UI描画
  // ----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#fcfdfd] text-[#1e293b] font-sans p-4 md:p-10 pb-24 selection:bg-indigo-100">
      {/* 通知ポップアップ */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-indigo-600 text-white px-8 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300 font-bold border-b-4 border-indigo-800">
          {notification}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6 border-b border-slate-100 pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-inner">
                <Palette className="w-8 h-8 text-indigo-600" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 italic">Atelier Inventory</h1>
            </div>
            <p className="text-slate-400 font-medium ml-1 leading-relaxed max-w-md">
              衣服が帯びる生命の主張と対話し、その細密な描写を支える画材たちの記録。
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="group relative flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:translate-y-0"
          >
            <Plus className="w-5 h-5" />
            画材を登録する
          </button>
        </header>

        {/* 検索・フィルターバー */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="画材名、購入店などで検索..." 
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 shadow-sm outline-none transition-all text-lg font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/60 shadow-inner">
            {['all', 'low'].map(t => (
              <button 
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${activeTab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t === 'all' ? 'すべて表示' : '在庫わずか'}
              </button>
            ))}
          </div>
        </div>

        {/* 在庫テーブル */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30 border-b border-slate-100">
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Materials</th>
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Stock</th>
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredItems.map(item => {
                  const stock = calculateStock(item);
                  const isLow = stock <= (item.initialQty * 0.2);
                  const isExpanded = expandedItemId === item.id;

                  return (
                    <React.Fragment key={item.id}>
                      <tr className={`group transition-all ${isExpanded ? 'bg-indigo-50/20' : 'hover:bg-slate-50/40'}`}>
                        <td className="px-10 py-8">
                          <div className="font-black text-slate-800 text-xl group-hover:text-indigo-900 transition-colors leading-tight">{item.name}</div>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest italic">
                            <Store className="w-3.5 h-3.5" /> {item.store || 'UNKNOWN STORE'}
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-baseline gap-1.5">
                            <span className={`text-4xl font-black tabular-nums ${isLow ? 'text-rose-500' : 'text-slate-900'}`}>
                              {stock}
                            </span>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">{item.unit}</span>
                          </div>
                          {isLow && (
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-rose-400 mt-2 uppercase tracking-tight animate-pulse">
                              <AlertCircle size={12} /> 在庫切れに注意してください
                            </div>
                          )}
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                              className={`p-3.5 rounded-2xl border transition-all ${isExpanded ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-200 hover:text-indigo-600 shadow-sm'}`}
                              title="対話履歴を表示"
                            >
                              <History className="w-6 h-6" />
                            </button>
                            <button 
                              onClick={() => setShowUsageModal(item)}
                              className="p-3.5 bg-white text-amber-500 border border-amber-100 rounded-2xl hover:bg-amber-50 shadow-sm transition-all"
                              title="使用を記録"
                            >
                              <Minus className="w-6 h-6" />
                            </button>
                            <button 
                              onClick={() => deleteItem(item.id)}
                              className="p-3.5 text-slate-200 hover:text-rose-400 transition-colors"
                              title="削除"
                            >
                              <Trash2 className="w-6 h-6" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* 詳細な対話履歴 (タイムライン) */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="3" className="px-10 py-10 bg-slate-50/20 border-b border-slate-100">
                            <div className="max-w-3xl bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-inner">
                              <div className="flex items-center justify-between mb-12">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                                  <Clock className="w-4 h-4 text-indigo-400" />
                                  画材との対話の軌跡
                                </h3>
                                <div className="h-[1px] flex-1 bg-slate-100 mx-6"></div>
                                <span className="text-[10px] font-black px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full">TIMELINE</span>
                              </div>
                              
                              <div className="relative border-l-2 border-slate-100 ml-6 space-y-12 pb-4">
                                {[...item.logs].reverse().map((log, idx) => (
                                  <div key={idx} className="relative pl-12 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                    {/* タイムラインのドット */}
                                    <div className={`absolute -left-[13px] top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-md ${log.type === 'in' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-12">
                                      <div className="min-w-[120px]">
                                        <span className="text-xs font-black text-slate-400 flex items-center gap-2 tabular-nums">
                                          <Calendar className="w-3.5 h-3.5" />
                                          {log.date}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-6 flex-1">
                                        <span className={`text-[10px] font-black px-4 py-2 rounded-xl tracking-widest ${log.type === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                          {log.type === 'in' ? 'IN' : 'USE'} {log.type === 'in' ? '+' : '-'}{log.qty}{item.unit}
                                        </span>
                                        <span className="text-base font-bold text-slate-700 leading-relaxed italic border-l-2 border-slate-100 pl-6">
                                          {log.note || '記録なし'}
                                        </span>
                                      </div>
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

      {/* 画材登録モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-indigo-600 p-12 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10"><Package size={120} /></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-black tracking-tighter italic">Register Supply</h2>
                <p className="text-indigo-200 text-[10px] font-black mt-2 uppercase tracking-[0.3em]">新しい画材との出会いを記録する</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-white/20 rounded-2xl transition-colors relative z-10"><X className="w-8 h-8" /></button>
            </div>
            <form onSubmit={addItem} className="p-12 space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">画材の名称</label>
                <input required name="name" className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-50 transition-all text-xl font-bold" placeholder="例: チタニウムホワイト" />
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">購入店</label>
                  <input name="store" className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-50 font-bold" placeholder="世界堂など" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">単位</label>
                  <input required name="unit" className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-50 font-bold" defaultValue="本" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">初回数量</label>
                  <input required type="number" name="qty" className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-50 text-2xl font-black" placeholder="1" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">日付</label>
                  <input required type="date" name="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-50 font-bold" />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-100 transition-all mt-6 uppercase tracking-widest">
                Add to List
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 使用記録モーダル */}
      {showUsageModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-12 duration-400">
            <div className="bg-amber-500 p-12 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10"><History size={120} /></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-black tracking-tighter italic">Usage Record</h2>
                <p className="text-amber-100 text-[10px] font-black mt-2 uppercase tracking-[0.3em] truncate max-w-[280px]">
                  {showUsageModal.name} を使用
                </p>
              </div>
              <button onClick={() => setShowUsageModal(null)} className="p-3 hover:bg-white/20 rounded-2xl transition-colors relative z-10"><X className="w-8 h-8" /></button>
            </div>
            <form onSubmit={recordUsage} className="p-12 space-y-10">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">使用量</label>
                  <input required type="number" name="useQty" className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-amber-50 text-2xl font-black" placeholder="1" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">日付</label>
                  <input required type="date" name="useDate" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-amber-50 font-bold" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">対話のメモ（作品のどの部分に使用したか等）</label>
                <textarea 
                  name="note" 
                  rows="3"
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-amber-50 font-bold text-lg leading-relaxed resize-none" 
                  placeholder="例: 衣服の光沢を表現するために..."
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-amber-500 text-white py-6 rounded-[2rem] font-black text-xl shadow-xl shadow-amber-50 hover:bg-amber-600 hover:scale-[1.02] active:scale-100 transition-all mt-6 uppercase tracking-widest">
                Save Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
