import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { DomainManager } from './components/DomainManager';
import { HostingManager } from './components/HostingManager';
import { VPSManager } from './components/VPSManager';
import { CustomerList } from './components/CustomerList';
import { Login } from './components/Login';
import { AuthGuard } from './components/AuthGuard';
import { InfrastructureLinks } from './components/InfrastructureLinks';
import { Customer, Domain, HostingPackage, VPS } from './types';
import { api } from './services/dataRepository';

const App: React.FC = () => {
  // Centralized State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [hostings, setHostings] = useState<HostingPackage[]>([]);
  const [vpsList, setVpsList] = useState<VPS[]>([]);

  // Loading State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, d, h, v] = await Promise.all([
          api.fetchCustomers(),
          api.fetchDomains(),
          api.fetchHosting(),
          api.fetchVPS()
        ]);
        setCustomers(c);
        setDomains(d);
        setHostings(h);
        setVpsList(v);
      } catch (err: any) {
        console.error("Failed to load initial data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- CRUD Handlers ---

  // Customers
  const addCustomer = async (customer: Customer) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = customer; // Remove temporary ID if any
      const newCustomer = await api.createCustomer(rest);
      setCustomers([...customers, newCustomer]);
    } catch (err) { alert("Failed to add customer"); }
  };
  const updateCustomer = async (customer: Customer) => {
    try {
      await api.updateCustomer(customer);
      setCustomers(customers.map(c => c.id === customer.id ? customer : c));
    } catch (err) { alert("Failed to update customer"); }
  };
  const deleteCustomer = async (id: string) => {
    try {
      await api.deleteCustomer(id);
      setCustomers(customers.filter(c => c.id !== id));
    } catch (err) { alert("Failed to delete customer"); }
  };

  // Domains
  const addDomain = async (domain: Domain) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = domain;
      const newDomain = await api.createDomain(rest);
      setDomains([...domains, newDomain]);
    } catch (e) { alert("Failed to add domain"); }
  };
  const updateDomain = async (domain: Domain) => {
    try {
      await api.updateDomain(domain);
      setDomains(domains.map(d => d.id === domain.id ? domain : d));
    } catch (e) { alert("Failed to update domain"); }
  };
  const deleteDomain = async (id: string) => {
    try {
      await api.deleteDomain(id);
      setDomains(domains.filter(d => d.id !== id));
    } catch (e) { alert("Failed to delete domain"); }
  };

  // VPS
  const addVPS = async (vps: VPS) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = vps;
      const newVps = await api.createVPS(rest);
      setVpsList([...vpsList, newVps]);
    } catch (e) { alert("Failed to add VPS"); }
  };
  const updateVPS = async (vps: VPS) => {
    try {
      await api.updateVPS(vps);
      setVpsList(vpsList.map(v => v.id === vps.id ? vps : v));
    } catch (e) { alert("Failed to update VPS"); }
  };
  const deleteVPS = async (id: string) => {
    try {
      await api.deleteVPS(id);
      setVpsList(vpsList.filter(v => v.id !== id));
    } catch (e) { alert("Failed to delete VPS"); }
  };

  // Hosting
  const addHosting = async (hosting: HostingPackage) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = hosting;
      const newHosting = await api.createHosting(rest);
      setHostings([...hostings, newHosting]);
    } catch (e) { alert("Failed to add Hosting"); }
  };
  const updateHosting = async (hosting: HostingPackage) => {
    try {
      await api.updateHosting(hosting);
      setHostings(hostings.map(h => h.id === hosting.id ? hosting : h));
    } catch (e) { alert("Failed to update Hosting"); }
  };
  const deleteHosting = async (id: string) => {
    try {
      await api.deleteHosting(id);
      setHostings(hostings.filter(h => h.id !== id));
    } catch (e) { alert("Failed to delete Hosting"); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Data...</div>;
  if (error) return <div className="flex h-screen items-center justify-center text-red-600">Error: {error}. Check your connection and tokens.</div>;

  const data = {
    customers,
    domains,
    hostings,
    vps: vpsList
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<AuthGuard />}>
          <Route path="/" element={<Layout />}>
            <Route index element={
              <Dashboard
                customers={customers}
                domains={domains}
                hostings={hostings}
                vps={vpsList}
              />
            } />
            <Route path="infrastructure" element={
              <InfrastructureLinks
                domains={domains}
                vpsList={vpsList}
                hostings={hostings}
              />
            } />
            <Route path="customers" element={
              <CustomerList
                customers={customers}
                domains={domains}
                hostings={hostings}
                onAdd={addCustomer}
                onUpdate={updateCustomer}
                onDelete={deleteCustomer}
              />
            } />
            <Route path="domains" element={
              <DomainManager
                domains={domains}
                customers={customers}
                vpsList={vpsList}
                hostings={hostings}
                onAdd={addDomain}
                onUpdate={updateDomain}
                onDelete={deleteDomain}
              />
            } />
            <Route path="hosting" element={
              <HostingManager
                hostingList={hostings}
                vpsList={vpsList}
                customers={customers}
                onAdd={addHosting}
                onUpdate={updateHosting}
                onDelete={deleteHosting}
              />
            } />
            <Route path="vps" element={
              <VPSManager
                vpsList={vpsList}
                hostingList={hostings}
                onAdd={addVPS}
                onUpdate={updateVPS}
                onDelete={deleteVPS}
              />
            } />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;