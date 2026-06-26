// Provider-agnostic billing / invoicing adapter (Fázis 3 foundation).
import { SzamlazzHuProvider } from './szamlazz';
import { NoopBillingProvider } from './noop';

export interface IssueInvoiceItem {
  name: string;
  quantity: number;
  unitNetCents: number;
  vatRate: number; // e.g. 27 for HU standard
}

export interface IssueInvoiceInput {
  orderId: string;
  orderNumber: string;
  netCents: number;
  vatCents: number;
  grossCents: number;
  currency: string;
  buyerName: string;
  buyerAddress: { name?: string; street?: string; city?: string; postcode?: string; country?: string } | null;
  buyerTaxId?: string | null;
  items: IssueInvoiceItem[];
}

export type IssueFailReason =
  | 'config_missing'   // no provider key / seller data
  | 'not_live'         // key present but BILLING_LIVE !== 'true'
  | 'not_implemented'  // provider call not wired yet
  | 'provider_error';

export interface IssueInvoiceResult {
  ok: boolean;
  provider: string;
  invoiceNumber?: string;
  externalId?: string;
  pdfUrl?: string;
  reason?: IssueFailReason;
}

export interface BillingProvider {
  readonly name: string;
  issueInvoice(input: IssueInvoiceInput): Promise<IssueInvoiceResult>;
}

// ponytail: provider chosen by env; defaults to no-op so nothing issues by accident.
export function getBillingProvider(): BillingProvider {
  switch (process.env.BILLING_PROVIDER) {
    case 'szamlazzhu':
      return new SzamlazzHuProvider();
    default:
      return new NoopBillingProvider();
  }
}
