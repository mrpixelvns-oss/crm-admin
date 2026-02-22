import React, { useState } from 'react';
import { VPS, ServerStatus, HostingPackage } from '../types';
import { Server, HardDrive, Cpu, Terminal, Plus, Edit2, Trash2, Clock } from 'lucide-react';
import { Modal, FormInput, FormSelect } from './Modal';

interface Props {
  vpsList: VPS[];
  hostingList: HostingPackage[]; // Needed to count hosted accounts
  onAdd: (v: VPS) => void;
  onUpdate: (v: VPS) => void;
  onDelete: (id: string) => void;
}

const emptyVPS: VPS = {
  id: '', name: '', provider: '', ipAddress: '', os: 'Ubuntu 22.04',
  specs: { cpu: '', ram: '', disk: '' }, expiryDate: '', status: ServerStatus.ONLINE
};

export const VPSManager: React.FC<Props> = ({
  vpsList, hostingList,
  onAdd, onUpdate, onDelete
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVPS, setEditingVPS] = useState<VPS>(emptyVPS);

  const handleEdit = (v: VPS) => { setEditingVPS(v); setIsModalOpen(true); };
  const handleAdd = () => { setEditingVPS({ ...emptyVPS, id: Date.now().toString() }); setIsModalOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const exists = vpsList.find(v => v.id === editingVPS.id);
    if (exists) onUpdate(editingVPS); else onAdd(editingVPS);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Máy chủ VPS</h1>
          <p className="text-slate-500">Quản lý máy chủ vật lý và máy chủ ảo.</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          Thêm Máy chủ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {vpsList.map(vps => {
          const hostedCount = hostingList.filter(h => h.vpsId === vps.id).length;
          return (
            <div key={vps.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative">
              {/* Actions overlay */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(vps)} className="p-1.5 bg-white/90 rounded shadow hover:text-blue-600"><Edit2 size={14} /></button>
                <button onClick={() => { if (window.confirm('Xóa VPS?')) onDelete(vps.id) }} className="p-1.5 bg-white/90 rounded shadow hover:text-red-600"><Trash2 size={14} /></button>
              </div>

              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${vps.status === ServerStatus.ONLINE ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <Server size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{vps.name}</h3>
                    <p className="text-xs text-slate-500">{vps.provider} • {vps.ipAddress}</p>
                  </div>
                </div>
                <div className={`h-2.5 w-2.5 rounded-full ${vps.status === ServerStatus.ONLINE ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="bg-slate-50 p-2 rounded">
                    <span className="block text-slate-400 text-xs">CPU</span>
                    <span className="font-semibold text-slate-700">{vps.specs.cpu}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <span className="block text-slate-400 text-xs">RAM</span>
                    <span className="font-semibold text-slate-700">{vps.specs.ram}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <span className="block text-slate-400 text-xs">Disk</span>
                    <span className="font-semibold text-slate-700">{vps.specs.disk}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <HardDrive size={16} className="text-slate-400" />
                    <span>Tài khoản Hosting: <span className="font-bold">{hostedCount}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                    <Clock size={12} />
                    Hết hạn: {vps.expiryDate}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <button className="flex-1 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center justify-center gap-2">
                    <Terminal size={14} /> Truy cập SSH
                  </button>
                  <button className="flex-1 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center justify-center gap-2">
                    <Cpu size={14} /> Giám sát
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={vpsList.find(v => v.id === editingVPS.id) ? "Sửa VPS" : "Thêm VPS"}>
        <form onSubmit={handleSubmit}>
          <FormInput label="Tên Máy chủ" value={editingVPS.name} onChange={e => setEditingVPS({ ...editingVPS, name: e.target.value })} required />
          <FormInput label="Nhà cung cấp" value={editingVPS.provider} onChange={e => setEditingVPS({ ...editingVPS, provider: e.target.value })} />
          <FormInput label="Địa chỉ IP" value={editingVPS.ipAddress} onChange={e => setEditingVPS({ ...editingVPS, ipAddress: e.target.value })} required />
          <div className="grid grid-cols-3 gap-2">
            <FormInput label="CPU" value={editingVPS.specs.cpu} onChange={e => setEditingVPS({ ...editingVPS, specs: { ...editingVPS.specs, cpu: e.target.value } })} />
            <FormInput label="RAM" value={editingVPS.specs.ram} onChange={e => setEditingVPS({ ...editingVPS, specs: { ...editingVPS.specs, ram: e.target.value } })} />
            <FormInput label="Disk" value={editingVPS.specs.disk} onChange={e => setEditingVPS({ ...editingVPS, specs: { ...editingVPS.specs, disk: e.target.value } })} />
          </div>
          <FormSelect label="Trạng thái" value={editingVPS.status} onChange={e => setEditingVPS({ ...editingVPS, status: e.target.value as ServerStatus })}>
            {Object.values(ServerStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </FormSelect>
          <FormInput label="Ngày hết hạn" type="date" value={editingVPS.expiryDate} onChange={e => setEditingVPS({ ...editingVPS, expiryDate: e.target.value })} required />
          <div className="flex justify-end gap-3 mt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Hủy bỏ</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu</button></div>
        </form>
      </Modal>
    </div>
  );
};