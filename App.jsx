import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, History, Package, ShoppingCart, Calendar, Trash2, Upload, Download, AlertCircle, ChevronRight, ArrowDown } from 'lucide-react';

const App = () => {
  const [items, setItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(null);
  const fileInputRef = useRef(null);

  const [newItem, setNewItem] = useState({ name: '', store: '', date: new Date().toISOString().split('T')[0], qty: 1 });
  const [usage, setUsage] = useState({ date: new Date().toISOString().split('T')[0], qty: 1 });

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('art_inventory_v3');
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('art_inventory_v3', JSON.stringify(items));
  }, [items]);

  // CSV Export Logic
  const handleCSVExport = () => {
    if (items.length === 0) return;

    // BOM for Excel (UTF-8)
    let csvContent = "\ufeff";
    csvContent += "入庫日,品名,数量,使用日,数量,購入店,残り\n";

    items.forEach(item => {
      const logs = item.logs;
      // Calculate remaining per log for the export display if needed, 
      // but here we just follow the structure.
      let currentStock = 0;

      logs.forEach((log, idx) => {
        if (log.type === 'in') currentStock += log.qty;
        else currentStock -= log.qty;

        const row = [
          log.type === 'in' ? log.date : '',
          idx === 0 ? `"${item.name}"` : '',
          log.type === 'in' ? log.qty : '',
          log.type === 'out' ? log.date : '',
          log.type === 'out' ? log.qty : '',
          idx === 0 ? `"${item.store}"` : '',
          currentStock
        ];
        csvContent += row.join(",") + "\n";
      });
      // Add an empty line between items for readability, matching user's CSV
      csvContent += ",,,,,,\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "画材リスト_更新済.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Parsing Logic - Now with Overwrite Capability
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/);
      const newItemsMap = new Map();
      let currentItem = null;

      let headerFound = false;

      lines.forEach((line) => {
        const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        
        if (cols.includes('品名') && (cols.includes('入庫日') || cols.includes('入庫'))) {
          headerFound = true;
          return;
        }
        if (!headerFound || cols.length < 2) return;

        const [inDate, name, inQty, useDate, useQty, store] = cols;

        const formatDate = (dateStr) => {
          if (!dateStr) return '';
          return dateStr.replace(/\./g, '/');
        };

        if (name && name !== "") {
          currentItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: name,
            store: store || '',
            logs: []
          };
          if (inQty && !isNaN(inQty) && inQty !== "") {
            currentItem.logs.push({ type: 'in', date: formatDate(inDate), qty: Number(inQty), note: 'インポート' });
          }
          if (useDate && useQty && !isNaN(useQty) && useQty !== "") {
            currentItem.logs.push({ type: 'out', date: formatDate(useDate), qty: Number(useQty), note: 'インポート' });
          }
          newItemsMap.set(name, currentItem);
        } else if (currentItem) {
          if (inQty && !isNaN(inQty) && inQty !== "") {
            currentItem.logs.push({ type: 'in', date: formatDate(inDate), qty: Number(inQty), note: '追加読込' });
          }
          if (useDate && useQty && !isNaN(useQty) && useQty !== "") {
            currentItem.logs.push({ type: 'out', date: formatDate(useDate), qty: Number(useQty), note: '追加読込' });
          }
        }
      });

      if (newItemsMap.size > 0) {
        setItems(prev => {
          const updated = [...prev];
          newItemsMap.forEach((newItem, name) => {
            const index = updated.findIndex(existing => existing.name === name);
            if (index !== -1) {
              // Overwrite with new data from CSV
              updated[index] = { ...newItem, id: updated[index].id }; 
            } else {
              // Add as new
              updated.push(newItem);
            }
          });
          return updated;
        });
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const getItemStats = (item) => {
    const remaining = item.logs.reduce((acc, log) => {
      return log.type === 'in' ? acc + log.qty : acc - log.qty;
    }, 0);
    return { remaining };
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const item = {
      id: Date.now().toString(),
      name: newItem.name,
      store: newItem.store,
      logs: [{ type: 'in', date: newItem.date.replace(/-/g, '/'), qty: Number(newItem.qty), note: '新規登録' }]
    };
    setItems([...items, item]);
    setShowAddModal(false);
    setNewItem({ name: '', store: '', date: new Date().toISOString().split('T')[0], qty: 1 });
  };

  const handleAddUsage = (e) => {
    e.preventDefault();
    setItems(items.map(i => i.id === showUsageModal ? {
      ...i,
      logs: [...i.logs, { type: 'out', date: usage.date.replace(/-/g, '/'), qty: Number(usage.qty), note: '使用記録' }]
    } : i));
    setShowUsageModal(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 p-4 md:p-8 font-sans selection:bg-zinc-200 tracking-tight">
      <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-zinc-950 flex items-center gap-2">
            <Package className="text-zinc-400" strokeWidth={2} size={28} />
            Art Supply Inventory
          </h1>
          <p className="text-zinc-500 mt-2 font-medium text-sm">画材という「物語の種」を、丹念に管理する</p>
        </div>
        
        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} onChange={handleCSVUpload} accept=".csv" className="hidden" />
          <button 
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 transition-colors text-xs font-bold uppercase tracking-widest text-zinc-600 shadow-sm"
          >
            <Upload size={14} />
            CSV Import
          </button>
          <button 
            onClick={handleCSVExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 transition-colors text-xs font-bold uppercase tracking-widest text-zinc-600 shadow-sm"
          >
            <Download size={14} />
            CSV Export
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-all text-xs font-bold uppercase tracking-widest shadow-md"
          >
            <Plus size={14} />
            Add Item
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-3 bg-zinc-100 text-[10px] font-black tracking-widest text-zinc-500 uppercase rounded-t-lg border-x border-t border-zinc-200">
          <div className="col-span-4">Material / Store</div>
          <div className="col-span-5 pl-4 border-l border-zinc-200">History (Full Log)</div>
          <div className="col-span-1 text-center border-l border-zinc-200">Stock</div>
          <div className="col-span-2 text-right border-l border-zinc-200">Actions</div>
        </div>

        <div className="flex flex-col bg-white border-x border-zinc-200 rounded-b-lg overflow-hidden shadow-sm">
          {items.length === 0 ? (
            <div className="py-24 text-center text-zinc-400 bg-white border-b border-zinc-200">
              <Package className="mx-auto mb-4 opacity-10" size={64} />
              <p className="font-medium text-lg text-zinc-300">No materials recorded.</p>
            </div>
          ) : (
            items.map((item, itemIdx) => {
              const { remaining } = getItemStats(item);
              return (
                <div key={item.id} className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-6 md:px-8 md:py-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors ${itemIdx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/20'}`}>
                  
                  {/* Column 1: Name & Store */}
                  <div className="col-span-4 flex flex-col justify-center">
                    <h3 className="font-bold text-lg text-zinc-900 leading-tight mb-1">{item.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                      <ShoppingCart size={11} className="opacity-60" />
                      <span>{item.store || '---'}</span>
                    </div>
                  </div>

                  {/* Column 2: History (Vertical List) */}
                  <div className="col-span-5 md:pl-4 md:border-l border-zinc-100 py-1">
                    <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
                      {item.logs.length === 0 ? (
                        <span className="text-xs text-zinc-300 italic">No history</span>
                      ) : (
                        item.logs.map((log, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] font-bold group/log tracking-tight">
                            <div className="flex items-center gap-3">
                              <div className={`w-0.5 h-3 ${log.type === 'in' ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                              <span className="text-zinc-400 tabular-nums w-20">{log.date}</span>
                              <span className={`px-1.5 py-0.5 rounded-sm text-[9px] uppercase tracking-tighter font-black shadow-sm ${log.type === 'in' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                                {log.type === 'in' ? 'IN' : 'USE'}
                              </span>
                            </div>
                            <span className={`font-black tabular-nums ${log.type === 'in' ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {log.type === 'in' ? '+' : '−'}{log.qty}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Column 3: Stock */}
                  <div className="col-span-1 flex flex-col items-center justify-center md:border-l border-zinc-100">
                    <span className="md:hidden text-[10px] font-black text-zinc-400 mb-1 uppercase tracking-widest">Stock</span>
                    <div className={`text-2xl font-black leading-none tabular-nums ${remaining <= 0 ? 'text-red-500' : remaining <= 2 ? 'text-orange-500' : 'text-zinc-900'}`}>
                      {remaining}
                    </div>
                  </div>

                  {/* Column 4: Actions */}
                  <div className="col-span-2 flex justify-end gap-1 md:border-l border-zinc-100 md:pl-4">
                    <button 
                      onClick={() => setShowUsageModal(item.id)}
                      className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-all"
                      title="使用を記録"
                    >
                      <Minus size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        const qty = prompt('追加数量を入力', '1');
                        if (qty && !isNaN(qty)) {
                          setItems(items.map(i => i.id === item.id ? {
                            ...i,
                            logs: [...i.logs, { type: 'in', date: new Date().toISOString().split('T')[0].replace(/-/g, '/'), qty: Number(qty), note: 'Manual' }]
                          } : i));
                        }
                      }}
                      className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-all"
                      title="入庫を追加"
                    >
                      <Plus size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        if(confirm('削除しますか？')) {
                          setItems(items.filter(i => i.id !== item.id));
                        }
                      }}
                      className="p-2 text-zinc-300 hover:text-red-600 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                </div>
              )
            })
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-6xl mx-auto mt-12 pb-12 flex justify-between items-center text-[10px] font-black tracking-widest text-zinc-400 uppercase">
        <div>Art Archive v3.3 Sync</div>
        <div className="flex gap-6">
          <span>Items: {items.length}</span>
          <span>Alert: {items.filter(i => getItemStats(i).remaining <= 2).length}</span>
        </div>
      </footer>

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-6 text-zinc-900 tracking-tighter">Register New Item</h2>
            <form onSubmit={handleAddItem} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">Item Name</label>
                <input required type="text" className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-md focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all" placeholder="例: 木製パネル F10" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">Quantity</label>
                  <input required type="number" min="1" className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-md focus:ring-2 focus:ring-zinc-900 focus:outline-none" value={newItem.qty} onChange={e => setNewItem({...newItem, qty: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">Store</label>
                  <input type="text" className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-md focus:ring-2 focus:ring-zinc-900 focus:outline-none" placeholder="例: 世界堂" value={newItem.store} onChange={e => setNewItem({...newItem, store: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">Date</label>
                <input type="date" className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-md focus:ring-2 focus:ring-zinc-900 focus:outline-none" value={newItem.date} onChange={e => setNewItem({...newItem, date: e.target.value})} />
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 tracking-widest uppercase">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-zinc-900 text-white rounded-md shadow-lg hover:bg-zinc-800 transition-all font-bold text-xs tracking-widest uppercase">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUsageModal && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-1 text-zinc-900 tracking-tighter">Record Usage</h2>
            <p className="text-xs text-zinc-400 mb-8 font-medium">{items.find(i => i.id === showUsageModal)?.name}</p>
            <form onSubmit={handleAddUsage} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">Amount</label>
                  <input required type="number" min="1" className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-md focus:ring-2 focus:ring-zinc-900 focus:outline-none" value={usage.qty} onChange={e => setUsage({...usage, qty: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">Date</label>
                  <input type="date" className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-md focus:ring-2 focus:ring-zinc-900 focus:outline-none" value={usage.date} onChange={e => setUsage({...usage, date: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowUsageModal(null)} className="flex-1 py-2.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 tracking-widest uppercase">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-zinc-900 text-white rounded-md shadow-lg hover:bg-zinc-800 transition-all font-bold text-xs tracking-widest uppercase">Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
