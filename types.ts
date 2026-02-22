export enum Status {
  ACTIVE = 'Active',
  SUSPENDED = 'Suspended',
  EXPIRED = 'Expired',
  PENDING = 'Pending'
}

export enum ServerStatus {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
  MAINTENANCE = 'Maintenance'
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  notes: string;
  status: Status;
}

export interface VPS {
  id: string;
  name: string;
  provider: string; // Vultr, DigitalOcean, etc.
  ipAddress: string;
  os: string;
  specs: {
    cpu: string;
    ram: string;
    disk: string;
  };
  expiryDate: string;
  status: ServerStatus;
  customerId?: string; // If dedicated to a customer
}

export interface HostingPackage {
  id: string;
  name: string; // e.g., "Shared Starter"
  type: 'Shared' | 'Reseller' | 'Dedicated';
  vpsId: string; // The VPS this hosting resides on
  controlPanel: 'cPanel' | 'DirectAdmin' | 'CyberPanel';
  customerId: string;
  primaryDomain: string;
  ipAddress?: string;
  expiryDate: string;
}

export interface Domain {
  id: string;
  domainName: string;
  registrar: string; // Namecheap, Godaddy, etc.
  purchaseDate: string;
  expiryDate: string;
  dnsProvider?: string; // Deprecated
  nameservers: string[];
  aRecord?: string; // Deprecated
  hostingId?: string; // The selected hosting for this domain
  customerId: string;
  status: Status;
  isAutoRenew: boolean;
}

// Helper type for the visualized graph/linkage
export interface InfrastructureNode {
  id: string;
  label: string;
  type: 'domain' | 'hosting' | 'vps';
  status: string;
  details?: string;
}