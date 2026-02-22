import React, { useState } from 'react';
import { HostingPackage, VPS, ServerStatus, Customer } from '../types';
import { Server, HardDrive, Cpu, Terminal, ShieldCheck, Plus, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import { Modal, FormInput, FormSelect } from './Modal';

interface Props {
  vpsList: VPS[];
  hostingList: HostingPackage[];
  customers: Customer[];
  onAddVPS: (v: VPS) => void;
  onUpdateVPS: (v: VPS) => void;
  onDeleteVPS: (id: string) => void;
  onAddHosting: (h: HostingPackage) => void;
  onUpdateHosting: (h: HostingPackage) => void;
  onDeleteHosting: (id: string) => void;
}

const emptyVPS: VPS = {
  id: '', name: '', provider: '', ipAddress: '', os: 'Ubuntu 22.04',
  specs: { cpu: '', ram: '', disk: '' }, expiryDate: '', status: ServerStatus.ONLINE
};

const emptyHosting: HostingPackage = {
  id: '', name: '', type: 'Shared', vpsId: '',
  controlPanel: 'cPanel', customerId: '', primaryDomain: '', ipAddress: '', expiryDate: ''
};

export const HostingVPSManager: React.FC<Props> = ({
  vpsList, hostingList, customers,
  onAddVPS, onUpdateVPS, onDeleteVPS,
  onAddHosting, onUpdateHosting, onDeleteHosting
}) => {
  const [activeTab, setActiveTab] = useState<'vps' | 'hosting'>('vps');

  // VPS Modal State
  const [isVPSModalOpen, setIsVPSModalOpen] = useState(false);
  const [editingVPS, setEditingVPS] = useState<VPS>(emptyVPS);

  // Hosting Modal State
  const [isHostingModalOpen, setIsHostingModalOpen] = useState(false);
  const [editingHosting, setEditingHosting] = useState<HostingPackage>(emptyHosting);

  // --- Handlers ---
  const handleEditVPS = (v: VPS) => { setEditingVPS(v); setIsVPSModalOpen(true); };
  const handleAddVPS = () => { setEditingVPS({ ...emptyVPS, id: Date.now().toString() }); setIsVPSModalOpen(true); };
  const submitVPS = (e: React.FormEvent) => {
    e.preventDefault();
    const exists = vpsList.find(v => v.id === editingVPS.id);
    if (exists) onUpdateVPS(editingVPS); else onAddVPS(editingVPS);
    setIsVPSModalOpen(false);
  };

  const handleEditHosting = (h: HostingPackage) => { setEditingHosting(h); setIsHostingModalOpen(true); };
  const handleAddHosting = () => { setEditingHosting({ ...emptyHosting, id: Date.now().toString() }); setIsHostingModalOpen(true); };
  const submitHosting = (e: React.FormEvent) => {
    e.preventDefault();
    const exists = hostingList.find(h => h.id === editingHosting.id);
    if (exists) onUpdateHosting(editingHosting); else onAddHosting(editingHosting);
    setIsHostingModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Server & Hosting</h1>
          <p className="text-slate-500">Manage your bare metal, VPS, and shared hosting packages.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-200 p-1 rounded-lg">
            <button onClick={() => setActiveTab('vps')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'vps' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>VPS / Servers</button>
            <button onClick={() => setActiveTab('hosting')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'hosting' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Hosting Packages</button>
          </div>
          <button
            onClick={activeTab === 'vps' ? handleAddVPS : handleAddHosting}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg flex items-center justify-center shadow-sm"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {activeTab === 'vps' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vpsList.map(vps => {
            const hostedCount = hostingList.filter(h => h.vpsId === vps.id).length;
            return (
              <div key={vps.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative">
                {/* Actions overlay */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditVPS(vps)} className="p-1.5 bg-white/90 rounded shadow hover:text-blue-600"><Edit2 size={14} /></button>
                  <button onClick={() => { if (window.confirm('Delete VPS?')) onDeleteVPS(vps.id) }} className="p-1.5 bg-white/90 rounded shadow hover:text-red-600"><Trash2 size={14} /></button>
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
                      <span>Hosting Accounts: <span className="font-bold">{hostedCount}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                      <Clock size={12} />
                      Expires: {vps.expiryDate}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                    <button className="flex-1 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center justify-center gap-2">
                      <Terminal size={14} /> SSH Access
                    </button>
                    <button className="flex-1 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center justify-center gap-2">
                      <Cpu size={14} /> Monitor
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'hosting' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Package Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Primary Domain</th>
                <th className="px-6 py-4">Panel</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {hostingList.map(h => {
                const parentVps = vpsList.find(v => v.id === h.vpsId);
                return (
                  <tr key={h.id} className="hover:bg-slate-50 group">
                    <td className="px-6 py-4 font-medium text-slate-900">{h.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium border border-blue-100">{h.type}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div>{h.primaryDomain}</div>
                      {h.ipAddress && <div className="text-xs text-slate-400 mt-0.5">IP: {h.ipAddress}</div>}
                    </td>
                    <td className="px-6 py-4 text-slate-600 flex items-center gap-1">
                      <ShieldCheck size={14} className="text-green-600" /> {h.controlPanel}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {h.expiryDate}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditHosting(h)} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-blue-600"><Edit2 size={16} /></button>
                        <button onClick={() => { if (window.confirm('Delete Hosting Package?')) onDeleteHosting(h.id) }} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VPS Modal */}
      <Modal isOpen={isVPSModalOpen} onClose={() => setIsVPSModalOpen(false)} title={vpsList.find(v => v.id === editingVPS.id) ? "Edit VPS" : "Add VPS"}>
        <form onSubmit={submitVPS}>
          <FormInput label="Server Name" value={editingVPS.name} onChange={e => setEditingVPS({ ...editingVPS, name: e.target.value })} required />
          <FormInput label="Provider" value={editingVPS.provider} onChange={e => setEditingVPS({ ...editingVPS, provider: e.target.value })} />
          <FormInput label="IP Address" value={editingVPS.ipAddress} onChange={e => setEditingVPS({ ...editingVPS, ipAddress: e.target.value })} required />
          <div className="grid grid-cols-3 gap-2">
            <FormInput label="CPU" value={editingVPS.specs.cpu} onChange={e => setEditingVPS({ ...editingVPS, specs: { ...editingVPS.specs, cpu: e.target.value } })} />
            <FormInput label="RAM" value={editingVPS.specs.ram} onChange={e => setEditingVPS({ ...editingVPS, specs: { ...editingVPS.specs, ram: e.target.value } })} />
            <FormInput label="Disk" value={editingVPS.specs.disk} onChange={e => setEditingVPS({ ...editingVPS, specs: { ...editingVPS.specs, disk: e.target.value } })} />
          </div>
          <FormSelect label="Status" value={editingVPS.status} onChange={e => setEditingVPS({ ...editingVPS, status: e.target.value as ServerStatus })}>
            {Object.values(ServerStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </FormSelect>
          <FormInput label="Expiry Date" type="date" value={editingVPS.expiryDate} onChange={e => setEditingVPS({ ...editingVPS, expiryDate: e.target.value })} required />
          <div className="flex justify-end gap-3 mt-4"><button type="button" onClick={() => setIsVPSModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button></div>
        </form>
      </Modal>

      {/* Hosting Modal */}
      <Modal isOpen={isHostingModalOpen} onClose={() => setIsHostingModalOpen(false)} title={hostingList.find(h => h.id === editingHosting.id) ? "Edit Hosting" : "Add Hosting"}>
        <form onSubmit={submitHosting}>
          <FormInput label="Package Name" value={editingHosting.name} onChange={e => setEditingHosting({ ...editingHosting, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <FormSelect label="Type" value={editingHosting.type} onChange={e => setEditingHosting({ ...editingHosting, type: e.target.value as any })}>
              <option value="Shared">Shared</option>
              <option value="Reseller">Reseller</option>
              <option value="Dedicated">Dedicated</option>
            </FormSelect>
            <FormSelect label="Control Panel" value={editingHosting.controlPanel} onChange={e => setEditingHosting({ ...editingHosting, controlPanel: e.target.value as any })}>
              <option value="cPanel">cPanel</option>
              <option value="DirectAdmin">DirectAdmin</option>
              <option value="CyberPanel">CyberPanel</option>
            </FormSelect>
          </div>

          <FormSelect label="Assigned Customer" value={editingHosting.customerId} onChange={e => setEditingHosting({ ...editingHosting, customerId: e.target.value })}>
            <option value="">-- Select Customer --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </FormSelect>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Primary Domain" value={editingHosting.primaryDomain} onChange={e => setEditingHosting({ ...editingHosting, primaryDomain: e.target.value })} />
            <FormInput label="IP Address" value={editingHosting.ipAddress || ''} onChange={e => setEditingHosting({ ...editingHosting, ipAddress: e.target.value })} />
          </div>
          <FormInput label="Expiry Date" type="date" value={editingHosting.expiryDate} onChange={e => setEditingHosting({ ...editingHosting, expiryDate: e.target.value })} required />
          <div className="flex justify-end gap-3 mt-4"><button type="button" onClick={() => setIsHostingModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button></div>
        </form>
      </Modal>
    </div>
  );
};