import type { BillingProvider, IssueInvoiceInput, IssueInvoiceResult } from './provider';

// Default when no billing provider is configured: records intent, issues nothing.
export class NoopBillingProvider implements BillingProvider {
  readonly name = 'none';

  async issueInvoice(_input: IssueInvoiceInput): Promise<IssueInvoiceResult> {
    void _input;
    return { ok: false, provider: 'none', reason: 'config_missing' };
  }
}
