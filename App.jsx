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
  Palette
} from 'lucide-react';

/**
 * Atelier Inventory - 初期設計版
 * 衣服の細密描写を支える画材を、シンプルかつ確実に行うためのツールです。
 */
const App = () => {
  // ----------------------------------------------------------------
  // 1. 状態管理
  // ----------------------------------------------------------------
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('art-inventory-v1');
    return saved ? JSON.parse(saved) : [
      { 
        id: '1', 
        name: '筆インターロン 2/0号', 
        store: '世界堂', 
        qty: 8, 
        unit: '本', 
        logs: [{ date: '2026-01-12', qty: 8, note: '初期登録' }] 
      }
    ];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(null);
  const [expandedItemId, setExpandedItemId] = useState(null);

  // データの自動保存
  useEffect(() => {
    localStorage.setItem('art-inventory-v1', JSON.stringify(items));
  }, [items]);

  // ----------------------------------------------------------------
  // 2. フィルタリング
  // ----------------------------------------------------------------
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.store && item.store.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [items, searchTerm]);

  // ----------------------------------------------------------------
  // 3. 操作ロジック
  // ----------------------------------------------------------------
  const addItem = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newItem = {
      id: Date.now().toString(),
      name: formData.get('name'),
      store: formData.get('store'),
      qty: Number(formData.get('qty')),
      unit: formData.get('unit') || '個',
      logs: [{
        date: new Date().toISOString().split('T')[0],
        qty: Number(formData.get('qty')),
        note: '新規登録'
      }]
    };
    setItems([...items, newItem]);
    setShowAddModal(false);
  };

  const recordUsage = (e) => {
    e.preventDefault();
    const useQty = Number(new FormData(e.target).get('useQty'));
    const updatedItems = items.map(item => {
      if (item.id === showUsageModal.id) {
        return {
          ...item,
          qty: Math.max(0, item.qty - useQty),
          logs: [...item.logs, {
            date: new Date().toISOString().split('T')[0],
            qty: -useQty,
            note: '使用'
          }]
        };
      }
      return item;
    });
    setItems(updatedItems);
    setShowUsageModal(null);
  };

  const deleteItem = (id) => {
    if (window.confirm('削除しますか？')) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  // ----------------------------------------------------------------
  // 4. 画面描画
  // ----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <Palette className="text-indigo-600 w-8 h-8" />
            <h1 className="text-3xl font-bold tracking-tight">Atelier Inventory</h1>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Plus size={20} /> 追加
          </button>
        </header>

        {/* 検索 */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="画材を検索..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* リスト */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-slate-400 uppercase">画材名</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-400 uppercase">在庫</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-400 uppercase text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => (
                <React.Fragment key={item.id}>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-lg">{item.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <Store size={12} /> {item.store || '未設定'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-indigo-600">{item.qty}</span>
                        <span className="text-xs text-slate-400 font-bold">{item.unit}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <History size={20} />
                        </button>
                        <button 
                          onClick={() => setShowUsageModal(item)}
                          className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                        >
                          <Minus size={20} />
                        </button>
                        <button 
                          onClick={() => deleteItem(item.id)}
                          className="p-2 text-slate-200 hover:text-rose-500 rounded-lg transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* 簡易履歴表示 */}
                  {expandedItemId === item.id && (
                    <tr className="bg-slate-50/50">
                      <td colSpan="3" className="px-6 py-4">
                        <div className="text-sm space-y-2">
                          <div className="font-bold text-slate-400 mb-2 flex items-center gap-2">
                            <Clock size={14} /> 最近の履歴
                          </div>
                          {item.logs.slice().reverse().map((log, i) => (
                            <div key={i} className="flex justify-between items-center text-slate-600 border-b border-white pb-1">
                              <span>{log.date} - {log.note}</span>
                              <span className={`font-mono font-bold ${log.qty > 0 ? 'text-green-600' : 'text-rose-500'}`}>
                                {log.qty > 0 ? `+${log.qty}` : log.qty}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">画材の登録</h2>
              <button onClick={() => setShowAddModal(false)}><X /></button>
            </div>
            <form onSubmit={addItem} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1">画材名</label>
                <input required name="name" className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="例: チタニウムホワイト" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-1">数量</label>
                  <input required type="number" name="qty" className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" defaultValue="1" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-1">単位</label>
                  <input name="unit" className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" defaultValue="本" />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
                登録する
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 使用記録モーダル */}
      {showUsageModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="bg-amber-500 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold italic">Usage Record</h2>
              <button onClick={() => setShowUsageModal(null)}><X /></button>
            </div>
            <form onSubmit={recordUsage} className="p-6 space-y-4">
              <div className="text-center mb-4">
                <div className="text-slate-400 text-sm">使用する画材</div>
                <div className="text-xl font-bold">{showUsageModal.name}</div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1 text-center">使用数</label>
                <input required type="number" name="useQty" className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-center text-2xl font-black" defaultValue="1" />
              </div>
              <button type="submit" className="w-full bg-amber-500 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-amber-600 transition-all">
                使用を記録
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Clock = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

export default App;
