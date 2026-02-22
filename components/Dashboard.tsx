import React from 'react';
import { Customer, Domain, HostingPackage, VPS, Status, ServerStatus } from '../types';
import { Users, Globe, Server, HardDrive, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface DashboardProps {
  customers: Customer[];
  domains: Domain[];
  hostings: HostingPackage[];
  vps: VPS[];
}

const StatCard = ({ label, value, icon: Icon, color, trend }: { label: string, value: string | number, icon: any, color: string, trend?: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
        {trend && <p className="text-xs text-green-600 mt-1 font-medium">{trend}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="text-white" size={20} />
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ customers, domains, hostings, vps }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 10;

  const getDaysRemaining = (dateString: string) => {
    const expiry = new Date(dateString);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const allExpiringItems = React.useMemo(() => {
    const items: Array<{
      id: string;
      name: string;
      type: 'domain' | 'hosting' | 'vps';
      expiryDate: string;
      daysLeft: number;
    }> = [];

    // Process Domains
    domains.forEach(d => {
      const days = getDaysRemaining(d.expiryDate);
      if (days < 90 && days > -30) { // Include recently expired too
        items.push({ id: d.id, name: d.domainName, type: 'domain', expiryDate: d.expiryDate, daysLeft: days });
      }
    });

    // Process Hosting
    hostings.forEach(h => {
      const days = getDaysRemaining(h.expiryDate);
      if (days < 90 && days > -30) {
        items.push({ id: h.id, name: h.name, type: 'hosting', expiryDate: h.expiryDate, daysLeft: days });
      }
    });

    // Process VPS
    vps.forEach(v => {
      const days = getDaysRemaining(v.expiryDate);
      if (days < 90 && days > -30) {
        items.push({ id: v.id, name: v.name, type: 'vps', expiryDate: v.expiryDate, daysLeft: days });
      }
    });

    return items.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [domains, hostings, vps]);

  const totalPages = Math.ceil(allExpiringItems.length / ITEMS_PER_PAGE);
  const paginatedItems = allExpiringItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const offlineVPS = vps.filter(v => v.status === ServerStatus.OFFLINE);



  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tổng quan Hệ thống</h1>
        <p className="text-slate-500">Chào mừng trở lại, dưới đây là tình trạng hạ tầng của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <StatCard
          label="Tên miền Hoạt động"
          value={domains.filter(d => d.status === Status.ACTIVE).length}
          icon={Globe}
          color="bg-indigo-500"
        />
        <StatCard
          label="Gói Hosting"
          value={hostings.length}
          icon={HardDrive}
          color="bg-purple-500"
        />
        <StatCard
          label="Máy chủ VPS"
          value={vps.length}
          icon={Server}
          color="bg-slate-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expiring Services & Alerts */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity size={18} className="text-amber-500" />
              Cảnh báo & Gia hạn
            </h2>
            <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
              Sắp hết hạn (90 ngày)
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            {offlineVPS.length > 0 && (
              <div className="mb-6 space-y-3">
                {offlineVPS.map(v => (
                  <div key={v.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-lg animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 p-2 rounded-full text-red-600">
                        <AlertTriangle size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-red-800">Server Offline: {v.name}</p>
                        <p className="text-sm text-red-600">{v.ipAddress} • {v.provider}</p>
                      </div>
                    </div>
                    <button className="text-sm font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg">
                      Kiểm tra Ngay
                    </button>
                  </div>
                ))}
              </div>
            )}

            {paginatedItems.length > 0 ? (
              <>
                <div className="space-y-3">
                  {paginatedItems.map((item, idx) => (
                    <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-lg hover:border-amber-200 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${item.daysLeft <= 7 ? 'bg-red-100 text-red-600' :
                          item.daysLeft <= 30 ? 'bg-amber-100 text-amber-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                          {item.type === 'domain' && <Globe size={16} />}
                          {item.type === 'hosting' && <HardDrive size={16} />}
                          {item.type === 'vps' && <Server size={16} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-800">{item.name}</p>
                            <span className="text-[10px] uppercase font-bold text-slate-400 bg-white border border-slate-200 px-1.5 rounded">
                              {item.type === 'vps' ? 'VPS' : item.type === 'domain' ? 'Domain' : 'Hosting'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">Hết hạn: {new Date(item.expiryDate).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`text-right ${item.daysLeft <= 7 ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                          <span className="text-lg">{item.daysLeft}</span>
                          <span className="text-xs ml-1">ngày</span>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded">
                          Gia hạn
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="text-sm text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 font-medium px-3 py-1 rounded hover:bg-slate-100"
                    >
                      Trước
                    </button>
                    <span className="text-xs font-medium text-slate-400">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="text-sm text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 font-medium px-3 py-1 rounded hover:bg-slate-100"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[200px]">
                <CheckCircle size={48} className="mb-2 text-green-500 opacity-50" />
                <p>Tuyệt vời! Không có dịch vụ nào sắp hết hạn.</p>
              </div>
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Sức khỏe Hệ thống</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-600">Tải CPU VPS</span>
                <span className="text-sm font-medium text-slate-900">78%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-600">Dung lượng Lưu trữ</span>
                <span className="text-sm font-medium text-slate-900">45%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Hoạt động Gần đây</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3 text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                  <span>Đã tạo hosting cho <strong className="text-slate-700">floraldesign.com</strong></span>
                </li>
                <li className="flex gap-3 text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                  <span>Gia hạn VPS <strong className="text-slate-700">SG-HCMC-01</strong></span>
                </li>
                <li className="flex gap-3 text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                  <span>Thanh toán thất bại cho <strong className="text-slate-700">c3 (Crypto Traders)</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};