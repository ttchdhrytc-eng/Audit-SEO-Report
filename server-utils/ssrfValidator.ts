import dns from "dns";

export function isPrivateIp(ip: string): boolean {
  const cleanIp = ip.replace(/^\[|\]$/g, '').trim();

  // IPv6 Loopback
  if (cleanIp === '::1' || cleanIp === '0:0:0:0:0:0:0:1') {
    return true;
  }

  // IPv6 Private & Local Link Ranges
  const cleanIpLower = cleanIp.toLowerCase();
  if (
    cleanIpLower.startsWith('fc00:') || 
    cleanIpLower.startsWith('fd00:') || 
    cleanIpLower.startsWith('fe80:')
  ) {
    return true;
  }

  // IPv4 check
  const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = cleanIp.match(ipv4Pattern);
  if (match) {
    const p1 = parseInt(match[1], 10);
    const p2 = parseInt(match[2], 10);
    const p3 = parseInt(match[3], 10);
    const p4 = parseInt(match[4], 10);

    if (p1 > 255 || p2 > 255 || p3 > 255 || p4 > 255) {
      return true; // Malformed/unsafe
    }

    // localhost / loopback: 127.0.0.0/8
    if (p1 === 127) return true;

    // 10.0.0.0/8
    if (p1 === 10) return true;

    // 172.16.0.0/12
    if (p1 === 172 && (p2 >= 16 && p2 <= 31)) return true;

    // 192.168.0.0/16
    if (p1 === 192 && p2 === 168) return true;

    // 169.254.0.0/16
    if (p1 === 169 && p2 === 254) return true;

    // 0.0.0.0/8
    if (p1 === 0) return true;
  }

  return false;
}

export function isLocalhostOrLoopbackHostname(hostname: string): boolean {
  const h = hostname.toLowerCase().trim();
  if (h === 'localhost' || h === 'localhost.localdomain' || h.endsWith('.localhost')) {
    return true;
  }
  return false;
}

/**
 * Validates a user-supplied URL string, parses it, resolves its DNS,
 * and confirms it doesn't map to a local/restricted address.
 */
export async function validateUrlAndResolveSafe(urlStr: string): Promise<{ safe: boolean; url?: string; ip?: string; error?: string }> {
  try {
    let target = urlStr.trim();
    if (!/^https?:\/\//i.test(target)) {
      target = "https://" + target;
    }

    const parsed = new URL(target);
    const protocol = parsed.protocol.toLowerCase();
    
    if (protocol !== 'http:' && protocol !== 'https:') {
      return { safe: false, error: "Only http and https protocols are permitted." };
    }

    const hostname = parsed.hostname;

    if (isLocalhostOrLoopbackHostname(hostname)) {
      return { safe: false, error: "Access to localhost or loopback domains is forbidden." };
    }

    // Check if the hostname is an IP directly
    if (isPrivateIp(hostname)) {
      return { safe: false, error: "Access to private IP addresses is forbidden." };
    }

    // For non-IP hostnames, perform DNS lookup to resolve the address
    const ip = await new Promise<string>((resolve, reject) => {
      dns.lookup(hostname, { family: 4 }, (err, address) => {
        if (err) {
          reject(err);
        } else {
          resolve(address);
        }
      });
    });

    if (isPrivateIp(ip)) {
      return { safe: false, error: "Access to private IP space is forbidden." };
    }

    return { safe: true, url: target, ip };
  } catch (err: any) {
    return { safe: false, error: `Invalid URL or DNS resolution failed: ${err.message}` };
  }
}

/**
 * A custom dns lookup implementation to pass as part of http/https request options.
 * This intercepts socket connection-level DNS resolution to guarantee protection
 * against DNS rebinding attacks.
 */
export const ssrfSafeLookup = (
  hostname: string, 
  options: any, 
  callback: (err: NodeJS.ErrnoException | null, address: string | any, family?: number) => void
) => {
  // Call original DNS lookup
  dns.lookup(hostname, options, (err, address, family) => {
    if (err) {
      callback(err, address, family);
      return;
    }

    if (Array.isArray(address)) {
      // If returning all addresses
      const hasUnsafe = address.some(addrObj => isPrivateIp(addrObj.address));
      if (hasUnsafe) {
        callback(new Error("Access forbidden: DNS resolved to unsafe private IP address"), "", undefined);
        return;
      }
    } else {
      if (isPrivateIp(address)) {
        callback(new Error("Access forbidden: DNS resolved to unsafe private IP address"), "", undefined);
        return;
      }
    }

    callback(null, address, family);
  });
};
