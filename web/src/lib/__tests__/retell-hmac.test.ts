import { describe, it, expect } from 'vitest';
import { createHmac } from 'crypto';
import { verifyHmacSignatureWithSecret } from '@/lib/retell';

const SECRET = 'test_webhook_secret_min_32_bytes_random_xyz';

function sign(body: string, secret: string = SECRET): string {
  return 'sha256=' + createHmac('sha256', secret).update(body).digest('hex');
}

describe('verifyHmacSignatureWithSecret', () => {
  it('accepts a valid signature for the exact body', () => {
    const body = JSON.stringify({ event: 'call.end', call_id: 'abc' });
    expect(verifyHmacSignatureWithSecret(body, sign(body), SECRET)).toBe(true);
  });

  it('rejects a tampered body even with the original signature', () => {
    const body = JSON.stringify({ event: 'call.end', call_id: 'abc' });
    const sig = sign(body);
    const tampered = JSON.stringify({ event: 'call.end', call_id: 'attacker' });
    expect(verifyHmacSignatureWithSecret(tampered, sig, SECRET)).toBe(false);
  });

  it('rejects a missing signature header', () => {
    expect(verifyHmacSignatureWithSecret('any', null, SECRET)).toBe(false);
    expect(verifyHmacSignatureWithSecret('any', '', SECRET)).toBe(false);
  });

  it('accepts both prefixed and raw hex formats', () => {
    const body = 'x';
    const prefixed = sign(body);
    const raw = prefixed.slice(7);
    expect(verifyHmacSignatureWithSecret(body, prefixed, SECRET)).toBe(true);
    expect(verifyHmacSignatureWithSecret(body, raw, SECRET)).toBe(true);
  });

  it('rejects signature with wrong length without throwing', () => {
    expect(verifyHmacSignatureWithSecret('x', 'sha256=deadbeef', SECRET)).toBe(false);
  });

  it('rejects signature signed with a different secret', () => {
    const body = 'x';
    const otherSig = sign(body, 'wrong_secret');
    expect(verifyHmacSignatureWithSecret(body, otherSig, SECRET)).toBe(false);
  });

  it('rejects non-hex signature gracefully', () => {
    expect(verifyHmacSignatureWithSecret('x', 'sha256=zzznotvalidhex', SECRET)).toBe(false);
  });
});
