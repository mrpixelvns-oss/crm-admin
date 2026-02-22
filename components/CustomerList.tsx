import React, { useState } from 'react';
import { Customer, Status, Domain, HostingPackage } from '../types';
import { Mail, Phone, MoreHorizontal, FileText, Plus, Edit2, Trash2 } from 'lucide-react';
import { Modal, FormInput, FormSelect } from './Modal';

interface Props {
  customers: Customer[];
  domains: Domain[];
  hostings: HostingPackage[];
  onAdd: (c: Customer) => void;
  onUpdate: (c: Customer) => void;
  onDelete: (id: string) => void;
}

const emptyCustomer: Customer = {
  id: '',
  name: '',
  company: '',
  email: '',
  phone: '',
  notes: '',
  status: Status.ACTIVE
};

export const CustomerList: React.FC<Props> = ({ customers, domains, hostings, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer>(emptyCustomer);

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingCustomer({ ...emptyCustomer, id: Date.now().toString() });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa khách hàng này không?')) {
      onDelete(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const exists = customers.find(c => c.id === editingCustomer.id);
    if (exists) {
      onUpdate(editingCustomer);
    } else {
      onAdd(editingCustomer);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Khách hàng</h1>
          <p className="text-slate-500">Quản lý thông tin và liên hệ khách hàng.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Thêm Khách hàng
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {customers.map(customer => {
          const customerDomains = domains.filter(d => d.customerId === customer.id);
          const customerHosting = hostings.filter(h => h.customerId === customer.id);

          return (
            <div key={customer.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow group">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-800">{customer.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${customer.status === Status.ACTIVE ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>{customer.status}</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">{customer.company}</p>

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer">
                    <Mail size={14} /> {customer.email}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={14} /> {customer.phone}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 flex-1 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                <div className="bg-slate-50 p-3 rounded-lg flex-1">
                  <p className="text-xs text-slate-400 uppercase font-semibold">Dịch vụ</p>
                  <div className="flex gap-4 mt-1">
                    <div>
                      <span className="text-lg font-bold text-slate-800">{customerDomains.length}</span>
                      <span className="text-xs text-slate-500 ml-1">Tên miền</span>
                    </div>
                    <div>
                      <span className="text-lg font-bold text-slate-800">{customerHosting.length}</span>
                      <span className="text-xs text-slate-500 ml-1">Hosting</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg flex-[2]">
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Ghi chú</p>
                  <p className="text-sm text-slate-600 italic line-clamp-2">{customer.notes}</p>
                </div>
              </div>

              <div className="flex md:flex-col gap-2 w-full md:w-auto opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(customer)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(customer.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={customers.find(c => c.id === editingCustomer.id) ? "Sửa Khách hàng" : "Thêm Khách hàng Mới"}
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Họ và Tên"
            value={editingCustomer.name}
            onChange={e => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
            required
          />
          <FormInput
            label="Công ty"
            value={editingCustomer.company}
            onChange={e => setEditingCustomer({ ...editingCustomer, company: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Email"
              type="email"
              value={editingCustomer.email}
              onChange={e => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
              required
            />
            <FormInput
              label="Số điện thoại"
              value={editingCustomer.phone}
              onChange={e => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
            />
          </div>
          <FormSelect
            label="Trạng thái"
            value={editingCustomer.status}
            onChange={e => setEditingCustomer({ ...editingCustomer, status: e.target.value as Status })}
          >
            {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
          </FormSelect>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-24"
              value={editingCustomer.notes}
              onChange={e => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Lưu Khách hàng
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};