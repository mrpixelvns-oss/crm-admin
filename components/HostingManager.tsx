import React, { useState } from 'react';
import { HostingPackage, VPS, Customer } from '../types';
import { Server, ShieldCheck, Plus, Edit2, Trash2, Calendar, User, Search } from 'lucide-react';
import { Modal, FormInput, FormSelect } from './Modal';

interface Props {
    hostingList: HostingPackage[];
    vpsList: VPS[];
    customers: Customer[];
    onAdd: (h: HostingPackage) => void;
    onUpdate: (h: HostingPackage) => void;
    onDelete: (id: string) => void;
}

const emptyHosting: HostingPackage = {
    id: '', name: '', type: 'Shared', vpsId: '',
    controlPanel: 'cPanel', customerId: '', primaryDomain: '', ipAddress: '', expiryDate: ''
};

export const HostingManager: React.FC<Props> = ({
    hostingList, vpsList, customers,
    onAdd, onUpdate, onDelete
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHosting, setEditingHosting] = useState<HostingPackage>(emptyHosting);
    const [filter, setFilter] = useState('');

    const handleEdit = (h: HostingPackage) => { setEditingHosting(h); setIsModalOpen(true); };
    const handleAdd = () => { setEditingHosting({ ...emptyHosting, id: Date.now().toString() }); setIsModalOpen(true); };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const exists = hostingList.find(h => h.id === editingHosting.id);
        if (exists) onUpdate(editingHosting); else onAdd(editingHosting);
        setIsModalOpen(false);
    };

    const filteredHosting = hostingList.filter(h =>
        h.name.toLowerCase().includes(filter.toLowerCase()) ||
        h.primaryDomain.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Gói Hosting</h1>
                    <p className="text-slate-500">Quản lý hosting chia sẻ, đại lý và phân bổ.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
                >
                    <Plus size={18} />
                    Thêm Hosting
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <div className="relative max-w-sm">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm gói hoặc tên miền..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Thông tin Gói</th>
                                <th className="px-6 py-4">Khách hàng</th>
                                <th className="px-6 py-4">Bảng điều khiển</th>
                                <th className="px-6 py-4">Hết hạn</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredHosting.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                                        Không tìm thấy gói hosting nào.
                                    </td>
                                </tr>
                            )}
                            {filteredHosting.map(h => {
                                const parentVps = vpsList.find(v => v.id === h.vpsId);
                                const customer = customers.find(c => c.id === h.customerId);

                                return (
                                    <tr key={h.id} className="hover:bg-slate-50 group transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{h.name}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{h.primaryDomain}</div>
                                            {h.ipAddress && <div className="text-xs text-slate-400 mt-0.5">IP: {h.ipAddress}</div>}
                                            <span className="inline-block mt-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-medium border border-blue-100">{h.type}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer ? (
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <User size={14} className="text-slate-400" />
                                                    <div>
                                                        <div className="font-medium text-xs">{customer.name}</div>
                                                        <div className="text-[10px] text-slate-400">{customer.company}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Chưa gán</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <div className="flex items-center gap-1.5">
                                                <ShieldCheck size={14} className="text-green-600" />
                                                <span>{h.controlPanel}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-slate-400" />
                                                {h.expiryDate || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(h)}
                                                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors"
                                                    title="Sửa"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => { if (window.confirm('Xóa gói Hosting?')) onDelete(h.id) }}
                                                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-red-600 transition-colors"
                                                    title="Xóa"
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={hostingList.find(h => h.id === editingHosting.id) ? "Sửa gói Hosting" : "Thêm Hosting"}>
                <form onSubmit={handleSubmit}>
                    <FormInput label="Tên gói" value={editingHosting.name} onChange={e => setEditingHosting({ ...editingHosting, name: e.target.value })} required />
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect label="Loại" value={editingHosting.type} onChange={e => setEditingHosting({ ...editingHosting, type: e.target.value as any })}>
                            <option value="Shared">Shared</option>
                            <option value="Reseller">Reseller</option>
                            <option value="Dedicated">Dedicated</option>
                        </FormSelect>
                        <FormSelect label="Bảng điều khiển" value={editingHosting.controlPanel} onChange={e => setEditingHosting({ ...editingHosting, controlPanel: e.target.value as any })}>
                            <option value="cPanel">cPanel</option>
                            <option value="DirectAdmin">DirectAdmin</option>
                            <option value="CyberPanel">CyberPanel</option>
                        </FormSelect>
                    </div>
                    <FormSelect label="Khách hàng" value={editingHosting.customerId} onChange={e => setEditingHosting({ ...editingHosting, customerId: e.target.value })}>
                        <option value="">-- Chọn Khách hàng --</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
                    </FormSelect>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput label="Tên miền chính" value={editingHosting.primaryDomain} onChange={e => setEditingHosting({ ...editingHosting, primaryDomain: e.target.value })} />
                        <FormInput label="IP Address" value={editingHosting.ipAddress || ''} onChange={e => setEditingHosting({ ...editingHosting, ipAddress: e.target.value })} />
                    </div>
                    <FormInput label="Ngày hết hạn" type="date" value={editingHosting.expiryDate} onChange={e => setEditingHosting({ ...editingHosting, expiryDate: e.target.value })} required />
                    <div className="flex justify-end gap-3 mt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Hủy bỏ</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu</button></div>
                </form>
            </Modal>
        </div>
    );
};