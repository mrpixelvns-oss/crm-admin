import { Customer, Domain, HostingPackage, VPS, Status, ServerStatus } from './types';

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Nguyen Van A',
    company: 'Tech Solutions Co.',
    email: 'contact@techsolutions.vn',
    phone: '0901234567',
    notes: 'Requires high availability.',
    status: Status.ACTIVE
  },
  {
    id: 'c2',
    name: 'Tran Thi B',
    company: 'Floral Design',
    email: 'info@floraldesign.com',
    phone: '0912345678',
    notes: 'Non-technical user.',
    status: Status.ACTIVE
  },
  {
    id: 'c3',
    name: 'Le Van C',
    company: 'Crypto Traders',
    email: 'support@cryptotraders.xyz',
    phone: '0987654321',
    notes: 'Late payments often.',
    status: Status.SUSPENDED
  }
];

export const MOCK_VPS: VPS[] = [
  {
    id: 'vps1',
    name: 'SG-HCMC-01',
    provider: 'Vultr',
    ipAddress: '103.100.200.50',
    os: 'Ubuntu 22.04 LTS',
    specs: { cpu: '2 vCore', ram: '4GB', disk: '80GB NVMe' },
    expiryDate: '2025-12-01',
    status: ServerStatus.ONLINE
  },
  {
    id: 'vps2',
    name: 'US-NY-05',
    provider: 'DigitalOcean',
    ipAddress: '159.65.20.10',
    os: 'CentOS 7',
    specs: { cpu: '4 vCore', ram: '8GB', disk: '160GB SSD' },
    expiryDate: '2024-05-15', // Expiring soon
    status: ServerStatus.ONLINE
  },
  {
    id: 'vps3',
    name: 'VN-HANOI-02',
    provider: 'AZDIGI',
    ipAddress: '45.119.80.12',
    os: 'AlmaLinux 8',
    specs: { cpu: '8 vCore', ram: '16GB', disk: '320GB SSD' },
    expiryDate: '2024-11-20',
    status: ServerStatus.MAINTENANCE
  }
];

export const MOCK_HOSTING: HostingPackage[] = [
  {
    id: 'h1',
    name: 'Business Shared',
    type: 'Shared',
    vpsId: 'vps1',
    controlPanel: 'cPanel',
    customerId: 'c1',
    primaryDomain: 'techsolutions.vn',
    expiryDate: '2025-01-20'
  },
  {
    id: 'h2',
    name: 'Wordpress Optimized',
    type: 'Shared',
    vpsId: 'vps1',
    controlPanel: 'cPanel',
    customerId: 'c2',
    primaryDomain: 'floraldesign.com',
    expiryDate: '2024-06-15'
  },
  {
    id: 'h3',
    name: 'Reseller Plan A',
    type: 'Reseller',
    vpsId: 'vps2',
    controlPanel: 'DirectAdmin',
    customerId: 'c3',
    primaryDomain: 'cryptotraders.xyz',
    expiryDate: '2024-09-01'
  }
];

export const MOCK_DOMAINS: Domain[] = [
  {
    id: 'd1',
    domainName: 'techsolutions.vn',
    registrar: 'PA Vietnam',
    purchaseDate: '2023-01-15',
    expiryDate: '2025-01-15',
    dnsProvider: 'Cloudflare',
    nameservers: ['dina.ns.cloudflare.com', 'norm.ns.cloudflare.com'],
    aRecord: '103.100.200.50', // Points correctly to VPS1
    customerId: 'c1',
    status: Status.ACTIVE,
    isAutoRenew: true
  },
  {
    id: 'd2',
    domainName: 'floraldesign.com',
    registrar: 'Namecheap',
    purchaseDate: '2022-06-10',
    expiryDate: '2024-06-10', // Expiring soon
    dnsProvider: 'Namecheap Basic',
    nameservers: ['dns1.namecheaphosting.com', 'dns2.namecheaphosting.com'],
    aRecord: '103.100.200.50', // Points correctly to VPS1
    customerId: 'c2',
    status: Status.ACTIVE,
    isAutoRenew: false
  },
  {
    id: 'd3',
    domainName: 'cryptotraders.xyz',
    registrar: 'GoDaddy',
    purchaseDate: '2023-08-20',
    expiryDate: '2024-08-20',
    dnsProvider: 'Cloudflare',
    nameservers: ['arya.ns.cloudflare.com', 'zoe.ns.cloudflare.com'],
    aRecord: '1.1.1.1', // INCORRECT IP (Does not match hosting VPS)
    customerId: 'c3',
    status: Status.SUSPENDED,
    isAutoRenew: true
  },
  {
    id: 'd4',
    domainName: 'unused-project.net',
    registrar: 'Namecheap',
    purchaseDate: '2021-01-01',
    expiryDate: '2024-01-01',
    dnsProvider: 'Namecheap',
    nameservers: ['dns1.namecheap.com'],
    aRecord: '0.0.0.0', // Parked
    customerId: 'c1',
    status: Status.EXPIRED,
    isAutoRenew: false
  }
];