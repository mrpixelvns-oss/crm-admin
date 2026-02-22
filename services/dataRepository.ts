import { supabase } from './supabase';
import { Customer, Domain, HostingPackage, VPS, Status, ServerStatus } from '../types';

// --- Types for Supabase Tables (Snake Case) ---
interface DBCustomer {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    notes: string;
    status: string;
}

interface DBVPS {
    id: string;
    name: string;
    provider: string;
    ip_address: string;
    os: string;
    cpu: string;
    ram: string;
    disk: string;
    expiry_date: string;
    status: string;
    customer_id?: string;
}

interface DBHosting {
    id: string;
    name: string;
    type: string;
    vps_id: string;
    control_panel: string;
    customer_id: string;
    primary_domain: string;
    ip_address: string;
    expiry_date: string;
}

interface DBDomain {
    id: string;
    domain_name: string;
    registrar: string;
    purchase_date: string;
    expiry_date: string;
    nameservers: string[];
    hosting_id?: string;
    customer_id: string;
    status: string;
    is_auto_renew: boolean;
}

// --- Mappers: DB -> App ---

const mapCustomer = (db: DBCustomer): Customer => ({
    ...db,
    status: db.status as Status
});

const mapVPS = (db: DBVPS): VPS => ({
    id: db.id,
    name: db.name,
    provider: db.provider,
    ipAddress: db.ip_address,
    os: db.os,
    specs: {
        cpu: db.cpu,
        ram: db.ram,
        disk: db.disk
    },
    expiryDate: db.expiry_date,
    status: db.status as ServerStatus,
    customerId: db.customer_id
});

const mapHosting = (db: DBHosting): HostingPackage => ({
    id: db.id,
    name: db.name,
    type: db.type as any,
    vpsId: db.vps_id,
    controlPanel: db.control_panel as any,
    customerId: db.customer_id,
    primaryDomain: db.primary_domain,
    ipAddress: db.ip_address,
    expiryDate: db.expiry_date
});

const mapDomain = (db: DBDomain): Domain => ({
    id: db.id,
    domainName: db.domain_name,
    registrar: db.registrar,
    purchaseDate: db.purchase_date,
    expiryDate: db.expiry_date,
    nameservers: db.nameservers || [],
    hostingId: db.hosting_id || '',
    customerId: db.customer_id,
    status: db.status as Status,
    isAutoRenew: db.is_auto_renew
});

// --- API Service ---

export const api = {
    // Customers
    fetchCustomers: async (): Promise<Customer[]> => {
        const { data, error } = await supabase.from('customers').select('*');
        if (error) throw error;
        return (data as DBCustomer[]).map(mapCustomer);
    },
    createCustomer: async (c: Omit<Customer, 'id'>) => {
        // Omit ID to let DB generate UUID
        const { data, error } = await supabase.from('customers').insert({
            name: c.name,
            company: c.company,
            email: c.email,
            phone: c.phone,
            notes: c.notes,
            status: c.status
        }).select().single();
        if (error) throw error;
        return mapCustomer(data as DBCustomer);
    },
    updateCustomer: async (c: Customer) => {
        const { error } = await supabase.from('customers').update({
            name: c.name,
            company: c.company,
            email: c.email,
            phone: c.phone,
            notes: c.notes,
            status: c.status
        }).eq('id', c.id);
        if (error) throw error;
        return c;
    },
    deleteCustomer: async (id: string) => {
        const { error } = await supabase.from('customers').delete().eq('id', id);
        if (error) throw error;
    },

    // VPS
    fetchVPS: async (): Promise<VPS[]> => {
        const { data, error } = await supabase.from('vps').select('*');
        if (error) throw error;
        return (data as DBVPS[]).map(mapVPS);
    },
    createVPS: async (v: Omit<VPS, 'id'>) => {
        const { data, error } = await supabase.from('vps').insert({
            name: v.name,
            provider: v.provider,
            ip_address: v.ipAddress,
            os: v.os,
            cpu: v.specs.cpu,
            ram: v.specs.ram,
            disk: v.specs.disk,
            expiry_date: v.expiryDate,
            status: v.status,
            customer_id: v.customerId || null
        }).select().single();
        if (error) throw error;
        return mapVPS(data as DBVPS);
    },
    updateVPS: async (v: VPS) => {
        const { error } = await supabase.from('vps').update({
            name: v.name,
            provider: v.provider,
            ip_address: v.ipAddress,
            os: v.os,
            cpu: v.specs.cpu,
            ram: v.specs.ram,
            disk: v.specs.disk,
            expiry_date: v.expiryDate,
            status: v.status,
            customer_id: v.customerId || null
        }).eq('id', v.id);
        if (error) throw error;
        return v;
    },
    deleteVPS: async (id: string) => {
        const { error } = await supabase.from('vps').delete().eq('id', id);
        if (error) throw error;
    },

    // Hosting
    fetchHosting: async (): Promise<HostingPackage[]> => {
        const { data, error } = await supabase.from('hosting_packages').select('*');
        if (error) throw error;
        return (data as DBHosting[]).map(mapHosting);
    },
    createHosting: async (h: Omit<HostingPackage, 'id'>) => {
        const { data, error } = await supabase.from('hosting_packages').insert({
            name: h.name,
            type: h.type,
            vps_id: h.vpsId || null,
            control_panel: h.controlPanel,
            customer_id: h.customerId || null,
            primary_domain: h.primaryDomain,
            ip_address: h.ipAddress,
            expiry_date: h.expiryDate
        }).select().single();
        if (error) throw error;
        return mapHosting(data as DBHosting);
    },
    updateHosting: async (h: HostingPackage) => {
        const { error } = await supabase.from('hosting_packages').update({
            name: h.name,
            type: h.type,
            vps_id: h.vpsId || null,
            control_panel: h.controlPanel,
            customer_id: h.customerId || null,
            primary_domain: h.primaryDomain,
            ip_address: h.ipAddress,
            expiry_date: h.expiryDate
        }).eq('id', h.id);
        if (error) throw error;
        return h;
    },
    deleteHosting: async (id: string) => {
        const { error } = await supabase.from('hosting_packages').delete().eq('id', id);
        if (error) throw error;
    },

    // Domains
    fetchDomains: async (): Promise<Domain[]> => {
        const { data, error } = await supabase.from('domains').select('*');
        if (error) throw error;
        return (data as DBDomain[]).map(mapDomain);
    },
    createDomain: async (d: Omit<Domain, 'id'>) => {
        const { data, error } = await supabase.from('domains').insert({
            domain_name: d.domainName,
            registrar: d.registrar,
            purchase_date: d.purchaseDate,
            expiry_date: d.expiryDate,
            nameservers: d.nameservers || [],
            hosting_id: d.hostingId || null,
            customer_id: d.customerId || null,
            status: d.status,
            is_auto_renew: d.isAutoRenew
        }).select().single();
        if (error) throw error;
        return mapDomain(data as DBDomain);
    },
    updateDomain: async (d: Domain) => {
        const { error } = await supabase.from('domains').update({
            domain_name: d.domainName,
            registrar: d.registrar,
            purchase_date: d.purchaseDate,
            expiry_date: d.expiryDate,
            nameservers: d.nameservers || [],
            hosting_id: d.hostingId || null,
            customer_id: d.customerId || null,
            status: d.status,
            is_auto_renew: d.isAutoRenew
        }).eq('id', d.id);
        if (error) throw error;
        return d;
    },
    deleteDomain: async (id: string) => {
        const { error } = await supabase.from('domains').delete().eq('id', id);
        if (error) throw error;
    }
};
