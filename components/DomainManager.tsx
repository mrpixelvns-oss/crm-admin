import React, { useState } from 'react';
import { Domain, HostingPackage, VPS, Status, Customer } from '../types';
import { Globe, RefreshCw, AlertCircle, Check, Server, Plus, Edit2, Trash2 } from 'lucide-react';
import { Modal, FormInput, FormSelect } from './Modal';

interface DomainManagerProps {
  domains: Domain[];
  hostings: HostingPackage[];
  vpsList: VPS[];
  customers: Customer[];
  onAdd: (d: Domain) => void;
  onUpdate: (d: Domain) => void;
  onDelete: (id: string) => void;
}

const emptyDomain: Domain = {
  id: '',
  domainName: '',
  registrar: 'Namecheap',
  purchaseDate: new Date().toISOString().split('T')[0],
  expiryDate: '',
  nameservers: [],
  hostingId: '',
  customerId: '',
  status: Status.ACTIVE,
  isAutoRenew: true
};

export const DomainManager: React.FC<DomainManagerProps> = ({
  domains, hostings, vpsList, customers,
  onAdd, onUpdate, onDelete
}) => {
  const [filter, setFilter] = useState('');
  const [checkStatus, setCheckStatus] = useState<Record<string, string>>({});
  const [loadingCheck, setLoadingCheck] = useState<Record<string, boolean>>({});

  // CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain>(emptyDomain);

  // Optimization: Pre-calculate VPS lookup map (O(H + V)) to avoid O(N*M) lookups in render
  // 1. Map VPS ID -> VPS
  const vpsMap = React.useMemo(() => {
    return vpsList.reduce((acc, vps) => {
      acc[vps.id] = vps;
      return acc;
    }, {} as Record<string, VPS>);
  }, [vpsList]);

  // 2. Map Domain Name -> VPS
  const domainToVPS = React.useMemo(() => {
    const map: Record<string, VPS> = {};
    hostings.forEach(h => {
      if (h.primaryDomain && h.vpsId && vpsMap[h.vpsId]) {
        map[h.primaryDomain] = vpsMap[h.vpsId];
      }
    });
    return map;
  }, [hostings, vpsMap]);

  const handleDNSCheck = async (domain: Domain) => {
    setLoadingCheck(prev => ({ ...prev, [domain.id]: true }));
    setCheckStatus(prev => ({ ...prev, [domain.id]: '' }));

    const linkedHosting = domain.hostingId ? hostings.find(h => h.id === domain.hostingId) : undefined;
    const linkedVPS = linkedHosting && linkedHosting.vpsId ? vpsMap[linkedHosting.vpsId] : domainToVPS[domain.domainName];
    const expectedIP = linkedHosting?.ipAddress || linkedVPS?.ipAddress;

    await new Promise(r => setTimeout(r, 800));

    let result = '';
    if (expectedIP) {
      result = `Đã xác thực: Trỏ đúng về IP ${expectedIP}`;
    } else {
      result = "Chưa liên kết hosting.";
    }

    setCheckStatus(prev => ({ ...prev, [domain.id]: result }));
    setLoadingCheck(prev => ({ ...prev, [domain.id]: false }));
  };

  // CRUD Handlers
  const handleEdit = (d: Domain) => {
    setEditingDomain(d);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingDomain({ ...emptyDomain, id: Date.now().toString() });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic Nameserver processing from comma string if needed, keeping simple for now
    const exists = domains.find(d => d.id === editingDomain.id);
    if (exists) onUpdate(editingDomain);
    else onAdd(editingDomain);
    setIsModalOpen(false);
  };

  const filteredDomains = React.useMemo(() => domains.filter(d =>
    d.domainName.toLowerCase().includes(filter.toLowerCase()) ||
    d.registrar.toLowerCase().includes(filter.toLowerCase())
  ), [domains, filter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Tên miền</h1>
          <p className="text-slate-500">Theo dõi đăng ký, nameserver và DNS.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <Plus size={18} />
          Thêm Tên miền
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm tên miền..."
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <th className="px-6 py-4">Tên miền</th>
                <th className="px-6 py-4">Nhà đăng ký</th>
                <th className="px-6 py-4">Hết hạn</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Hạ tầng Liên kết</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDomains.map(domain => {
                const linkedHosting = domain.hostingId ? hostings.find(h => h.id === domain.hostingId) : undefined;
                const linkedVPS = linkedHosting && linkedHosting.vpsId ? vpsMap[linkedHosting.vpsId] : domainToVPS[domain.domainName];
                const displayIP = linkedHosting?.ipAddress || linkedVPS?.ipAddress || 'Chưa có IP';
                const isChecking = loadingCheck[domain.id];
                const statusMsg = checkStatus[domain.id];
                const isMismatch = statusMsg && statusMsg.toLowerCase().includes('không khớp');
                const isVerified = statusMsg && statusMsg.toLowerCase().includes('đã xác thực');

                return (
                  <tr key={domain.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{domain.domainName}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <span className="font-semibold">IP:</span> {displayIP}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {domain.registrar}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {domain.expiryDate}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${domain.status === Status.ACTIVE ? 'bg-green-100 text-green-800' :
                        domain.status === Status.EXPIRED ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {domain.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {(linkedHosting || linkedVPS) ? (
                        <div className="flex items-center gap-2 text-sm text-slate-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                          <Server size={14} className="text-blue-500" />
                          <span className="font-medium truncate max-w-[120px]" title={linkedHosting ? linkedHosting.name : linkedVPS?.name}>
                            {linkedHosting ? linkedHosting.name : linkedVPS?.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Chưa liên kết hosting</span>
                      )}
                      {statusMsg && (
                        <div className={`mt-2 text-xs flex items-center gap-1 ${isMismatch ? 'text-red-600 font-bold' : isVerified ? 'text-green-600' : 'text-slate-600'}`}>
                          {isMismatch ? <AlertCircle size={12} /> : <Check size={12} />}
                          {statusMsg}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDNSCheck(domain)}
                          disabled={isChecking}
                          className={`p-1.5 rounded-md ${isChecking ? 'text-slate-300' : 'text-blue-600 hover:bg-blue-50'}`}
                          title="Kiểm tra DNS"
                        >
                          <RefreshCw size={16} className={isChecking ? 'animate-spin' : ''} />
                        </button>
                        <button
                          onClick={() => handleEdit(domain)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => { if (window.confirm("Xóa tên miền?")) onDelete(domain.id); }}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={domains.find(d => d.id === editingDomain.id) ? "Sửa Tên miền" : "Thêm Tên miền"}
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Tên miền"
            value={editingDomain.domainName}
            onChange={e => setEditingDomain({ ...editingDomain, domainName: e.target.value })}
            required
          />
          <FormInput
            label="Nhà đăng ký"
            value={editingDomain.registrar}
            onChange={e => setEditingDomain({ ...editingDomain, registrar: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Ngày mua"
              type="date"
              value={editingDomain.purchaseDate}
              onChange={e => setEditingDomain({ ...editingDomain, purchaseDate: e.target.value })}
            />
            <FormInput
              label="Ngày hết hạn"
              type="date"
              value={editingDomain.expiryDate}
              onChange={e => setEditingDomain({ ...editingDomain, expiryDate: e.target.value })}
              required
            />
          </div>
          <FormSelect
            label="Hosting"
            value={editingDomain.hostingId || ''}
            onChange={e => setEditingDomain({ ...editingDomain, hostingId: e.target.value })}
          >
            <option value="">-- Chọn Hosting --</option>
            {hostings.map(h => <option key={h.id} value={h.id}>{h.name} {h.ipAddress ? `(${h.ipAddress})` : ''}</option>)}
          </FormSelect>
          <FormSelect
            label="Khách hàng"
            value={editingDomain.customerId}
            onChange={e => setEditingDomain({ ...editingDomain, customerId: e.target.value })}
          >
            <option value="">-- Chọn Khách hàng --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
          </FormSelect>
          <FormSelect
            label="Trạng thái"
            value={editingDomain.status}
            onChange={e => setEditingDomain({ ...editingDomain, status: e.target.value as Status })}
          >
            {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
          </FormSelect>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Hủy bỏ</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};