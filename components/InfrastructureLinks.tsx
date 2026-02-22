import React, { useState } from 'react';
import { Domain, HostingPackage, VPS, ServerStatus } from '../types';
import { Server, HardDrive, Globe, AlertTriangle, CheckCircle, Network, ArrowRight } from 'lucide-react';

interface Props {
    domains: Domain[];
    hostings: HostingPackage[];
    vpsList: VPS[];
}

export const InfrastructureLinks: React.FC<Props> = ({ domains, hostings, vpsList }) => {
    const [activeTab, setActiveTab] = useState<'tree' | 'dns'>('tree');

    // --- Helper Logic ---
    const getHostingForVPS = (vpsId: string) => hostings.filter(h => h.vpsId === vpsId);
    const getDomainForHosting = (domainName: string) => domains.find(d => d.domainName === domainName);

    // For DNS Check Table
    const dnsHealthData = domains.map(domain => {
        // Find which hosting claims this domain either by ID or by primaryDomain as fallback
        const hosting = domain.hostingId ? hostings.find(h => h.id === domain.hostingId) : hostings.find(h => h.primaryDomain === domain.domainName);

        // Find the VPS for that hosting
        const vps = hosting ? vpsList.find(v => v.id === hosting.vpsId) : undefined;

        const expectedIP = hosting?.ipAddress || vps?.ipAddress;
        // Note: domain IP resolution is best effort here since aRecord might not exist on domain anymore
        // For visualization, we will just assume if it has a linked hosting/VPS, it's considered matched unless the system actively pulls actual DNS. 
        // We will represent whether it's correctly linked in CRM.
        const isMatch = !!expectedIP; // Simplified connection check

        return {
            domain,
            hosting,
            vps,
            expectedIP,
            isMatch
        };
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Infrastructure Map</h1>
                    <p className="text-slate-500">Visualize connections: Domain ↔ Hosting/ Domain ↔ VPS</p>
                </div>

                <div className="flex bg-slate-200 p-1 rounded-lg self-start md:self-auto">
                    <button
                        onClick={() => setActiveTab('tree')}
                        className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all ${activeTab === 'tree' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <Network size={16} /> Hierarchy View
                    </button>
                    <button
                        onClick={() => setActiveTab('dns')}
                        className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all ${activeTab === 'dns' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <Globe size={16} /> DNS Health Check
                    </button>
                </div>
            </div>

            {activeTab === 'tree' && (
                <div className="space-y-8">
                    {/* Hosting Section */}
                    <div>
                        <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <HardDrive className="text-indigo-500" /> Danh sách Hosting & Tên miền
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {hostings.map(hosting => {
                                // Find all domains pointing to this hosting
                                const linkedDomains = domains.filter(d => d.hostingId === hosting.id || d.domainName === hosting.primaryDomain);
                                const uniqueDomains = Array.from(new Map<string, Domain>(linkedDomains.map(item => [item.domainName, item])).values());

                                return (
                                    <div key={hosting.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center gap-3">
                                            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
                                                <HardDrive size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-lg">{hosting.name}</h3>
                                                <p className="text-sm text-slate-500">
                                                    {hosting.type} • {hosting.controlPanel}
                                                    {hosting.ipAddress && <span className="ml-2 font-mono bg-slate-200 px-1.5 py-0.5 rounded text-xs">{hosting.ipAddress}</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white">
                                            {uniqueDomains.length > 0 ? (
                                                <div className="space-y-2">
                                                    {uniqueDomains.map(domain => (
                                                        <div key={domain.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 ml-4 border-l-4 border-l-indigo-400">
                                                            <Globe size={18} className="text-indigo-400" />
                                                            <span className="font-medium text-slate-700">{domain.domainName}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-slate-400 italic text-sm py-2 ml-4">Không có tên miền nào trỏ về hosting này.</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {hostings.length === 0 && <div className="text-slate-500 italic p-4 bg-slate-50 rounded-lg border border-slate-200">Chưa có Hosting nào trong hệ thống.</div>}
                        </div>
                    </div>

                    {/* VPS Section */}
                    <div>
                        <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2 mt-8">
                            <Server className="text-blue-500" /> Danh sách VPS & Tên miền
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {vpsList.map(vps => {
                                // For VPS: Get domains connected directly or via a hosting package on this VPS
                                const hostingsOnVps = hostings.filter(h => h.vpsId === vps.id);
                                const hostingIds = hostingsOnVps.map(h => h.id);
                                const primaryDomainNames = hostingsOnVps.map(h => h.primaryDomain);

                                const linkedDomains = domains.filter(d =>
                                    (d.hostingId && hostingIds.includes(d.hostingId)) ||
                                    primaryDomainNames.includes(d.domainName) ||
                                    (d.aRecord && d.aRecord === vps.ipAddress) // Fallback for manually pointed domains if any
                                );

                                const uniqueDomains = Array.from(new Map<string, Domain>(linkedDomains.map(item => [item.domainName, item])).values());

                                return (
                                    <div key={vps.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${vps.status === ServerStatus.ONLINE ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                                                    <Server size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800 text-lg">{vps.name}</h3>
                                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                                        <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-xs">{vps.ipAddress}</span>
                                                        • {vps.provider}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${vps.status === ServerStatus.ONLINE ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {vps.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white">
                                            {uniqueDomains.length > 0 ? (
                                                <div className="space-y-2">
                                                    {uniqueDomains.map(domain => (
                                                        <div key={domain.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 ml-4 border-l-4 border-l-blue-400">
                                                            <Globe size={18} className="text-blue-400" />
                                                            <div className="flex-1">
                                                                <span className="font-medium text-slate-700 block">{domain.domainName}</span>
                                                                {domain.hostingId && hostingsOnVps.find(h => h.id === domain.hostingId) && (
                                                                    <span className="text-xs text-slate-500">Qua Hosting: {hostingsOnVps.find(h => h.id === domain.hostingId)?.name}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-slate-400 italic text-sm py-2 ml-4">Không có tên miền nào trỏ về VPS này.</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {vpsList.length === 0 && <div className="text-slate-500 italic p-4 bg-slate-50 rounded-lg border border-slate-200">Chưa có VPS nào trong hệ thống.</div>}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'dns' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Tên miền</th>
                                <th className="px-6 py-4">Hạ tầng & IP mong đợi</th>
                                <th className="px-6 py-4">Trạng thái liên kết CRM</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {dnsHealthData.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {item.domain.domainName}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.hosting ? (
                                            <div>
                                                <div className="font-mono text-slate-800">{item.expectedIP || 'Chưa có IP'}</div>
                                                <div className="text-xs text-slate-500">{item.hosting.name} {item.vps ? `(trên ${item.vps.name})` : ''}</div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 italic">Chưa liên kết</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {!item.isMatch ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                Chưa kết nối
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                <CheckCircle size={12} /> Đã kết nối
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};