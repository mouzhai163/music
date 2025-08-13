import crypto from "crypto";
import * as https from "https";
import * as zlib from "zlib";
import { URLSearchParams } from "url";
import * as qs from "querystring";

const KEY = Buffer.from("e82ckenh8dichen8", "utf8"); // AES-128-ECB key
const MAGIC = "36cd479b6b5"; //固定死的参数

/**
 * 大致的可以看出携带的params里面包含了哪些参数
 * 传递params进来即可
 * 解析 eapi params（hex）→ { path, jsonStr, json, sign, ok, plaintext }
 * 采用稳健分割：利用 `-MAGIC-` 两次定位，最后一个 '-' 分割 sign
 */
export function parseParams(hex: string) {
  const plaintext = aesEcbDecryptHexToUtf8(hex);
  const sep = `-${MAGIC}-`;

  const first = plaintext.indexOf(sep);
  const last = plaintext.lastIndexOf(sep);
  if (first <= 0 || last <= first) {
    throw new Error("格式不符合 eapi 明文结构");
  }

  const path = plaintext.slice(0, first);
  // 拿到 `<json>-<sign>`
  const jsonAndSign = plaintext.slice(first + sep.length);
  // 去掉后半段的 `-MAGIC-`，剩 `<json>-<sign>`
  const middle = jsonAndSign.slice(0, jsonAndSign.length - sep.length); // 等于截掉 `-MAGIC-` 之后的部分？
  // 更稳妥：直接用 last 去切 json
  const jsonStr = plaintext.slice(first + sep.length, last);
  const tail = plaintext.slice(last + sep.length); // `<sign>` 或者可能包含多余减号
  const dash = tail.lastIndexOf("-");
  const sign = dash === -1 ? tail : tail.slice(dash + 1);

  let json = null;
  try {
    json = JSON.parse(jsonStr);
  } catch {
    // 有些情况下 header 是字符串 "{}"（已包含在 jsonStr 内），保留原文
  }

  // 校验签名
  const calc = md5("nobody" + path + "use" + jsonStr + "md5forencrypt");
  const ok = calc === sign;

  return { path, jsonStr, json, sign, ok, plaintext };
}

function aesEcbDecryptHexToUtf8(hex: string) {
  const buf = Buffer.from(hex, "hex");
  const decipher = crypto.createDecipheriv("aes-128-ecb", KEY, null);
  decipher.setAutoPadding(true); // 去 PKCS#7
  const out = Buffer.concat([decipher.update(buf), decipher.final()]);
  return out.toString("utf8");
}
/** md5 → hex */
function md5(s: string) {
  return crypto.createHash("md5").update(s, "utf8").digest("hex");
}

/**
 * 生成 cache_key（按键名排序后 querystring，再用 AES-128-ECB 加密并 base64 输出）
 * 与原 JS 逻辑一致：key = AES-ECB(")(13daqP@ssw0rd~", qs.stringify(sortedParams)) → base64
 * 代码来自 https://rocka.me/article/netease-cloud-music-cache-key-reverse  感谢大佬逆向分享
 */
/** 允许的参数类型：可序列化为字符串 */
export type CacheKeyParams = Record<
  string,
  string | number | boolean | null | undefined
>;
export function getCacheKey(params: CacheKeyParams): string {
  // 1) 稳定排序（按首字符 codePoint）
  const keys = Object.keys(params).sort(
    (a, b) => (a.codePointAt(0) ?? 0) - (b.codePointAt(0) ?? 0)
  );

  // 2) 只收集有值字段，统一转字符串
  const record: Record<string, string> = {};
  for (const k of keys) {
    const v = params[k];
    if (v !== undefined) record[k] = String(v);
  }

  // 3) 生成 querystring
  const text = qs.stringify(record);

  // 4) AES-128-ECB → base64
  const key = Buffer.from(")(13daqP@ssw0rd~", "utf8"); // 16字节
  const cipher = crypto.createCipheriv("aes-128-ecb", key, null);
  let b64 = cipher.update(text, "utf8", "base64") + cipher.final("base64");

  // 默认去掉尾部 '='（无填充）
  b64 = b64.replace(/=+$/, "");

  return b64;
}

// 解码cacheKey的 可以查看里面携带的参数有哪些

export function decryptCacheKey(b64: string) {
  const KEY = Buffer.from(")(13daqP@ssw0rd~", "utf8");
  const buf = Buffer.from(b64fix(b64), "base64");
  const dec = crypto.createDecipheriv("aes-128-ecb", KEY, null);
  dec.setAutoPadding(true);
  const out = Buffer.concat([dec.update(buf), dec.final()]);
  const txt = out.toString("utf8");
  return { text: txt, obj: qs.parse(txt) };
}
function b64fix(s: string) {
  let t = s.replace(/-/g, "+").replace(/_/g, "/");
  const mod = t.length % 4;
  if (mod) t += "=".repeat(4 - mod);
  return t;
}

/**--------------解析网易云的重要工具---------------------- */
/** AES-ECB 加密 → HEX(大写) */
function aesEcbEncryptHex(plain: string, key: Buffer = KEY): string {
  const cipher = crypto.createCipheriv("aes-128-ecb", key, null);
  cipher.setAutoPadding(true);
  const out = Buffer.concat([
    cipher.update(Buffer.from(plain, "utf8")),
    cipher.final(),
  ]);
  return out.toString("hex").toUpperCase();
}

/** 自动解压（更稳：header + 魔数 + 容错） */
function autoInflate(
  buffer: Buffer,
  headers: Record<string, unknown> = {}
): Buffer {
  const ce = String(headers["content-encoding"] || "").toLowerCase();
  try {
    if (ce.includes("br")) return zlib.brotliDecompressSync(buffer);
    if (ce.includes("gzip")) return zlib.gunzipSync(buffer);
    if (ce.includes("deflate")) {
      try {
        return zlib.inflateSync(buffer);
      } catch {}
      try {
        return zlib.inflateRawSync(buffer);
      } catch {}
    }
  } catch {}
  // 魔数兜底：gzip
  if (buffer.length > 2 && buffer[0] === 0x1f && buffer[1] === 0x8b) {
    try {
      return zlib.gunzipSync(buffer);
    } catch {}
  }
  // 再尝试一次其他常见压缩
  try {
    return zlib.brotliDecompressSync(buffer);
  } catch {}
  try {
    return zlib.inflateSync(buffer);
  } catch {}
  try {
    return zlib.inflateRawSync(buffer);
  } catch {}
  return buffer; // 实在不行就当明文
}

/** eapi 解密（Brotli → AES-ECB → 去填充）；若非 16 倍数则视为明文 */
export function eapiDecrypt(
  buffer: Buffer,
  headers: Record<string, unknown> = {},
  key: Buffer = KEY
) {
  // 直接贴 eapiSmartDecode 的实现
  const inflated = autoInflate(buffer, headers);

  const plain = inflated.toString("utf8");
  const t0 = plain.trimStart();
  if (t0.startsWith("{") || t0.startsWith("[")) {
    return { text: plain, decrypted: false };
  }

  if (inflated.length % 16 === 0) {
    try {
      const decipher = crypto.createDecipheriv("aes-128-ecb", key, null);
      decipher.setAutoPadding(false);
      const out = Buffer.concat([decipher.update(inflated), decipher.final()]);
      const pad = out[out.length - 1];
      const unpadded =
        pad > 0 && pad <= 16 ? out.subarray(0, out.length - pad) : out;
      const txt = unpadded.toString("utf8");
      const t1 = txt.trimStart();
      if (t1.startsWith("{") || t1.startsWith("[")) {
        return { text: txt, decrypted: true };
      }
    } catch {}
  }

  return { text: plain, decrypted: false };
}

/** eapi 打包（签名路径必须是 /api/...） */
function eapiPack(
  apiPath: string,
  dataObj: Record<string, unknown> = {},
  key: Buffer = KEY
) {
  const dataJson = JSON.stringify(dataObj);
  const digest = md5(`nobody${apiPath}use${dataJson}md5forencrypt`);
  const payload = `${apiPath}-36cd479b6b5-${dataJson}-36cd479b6b5-${digest}`;
  const params = aesEcbEncryptHex(payload, key);
  return new URLSearchParams({ params }).toString();
}

/** 发 POST（加超时 & 统计字节数） */
function postBuffer({
  hostname,
  pathWithQuery,
  body,
  headers = {},
  timeoutMs = 15000,
}: {
  hostname: string;
  pathWithQuery: string;
  body: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
}) {
  return new Promise<{
    buffer: Buffer;
    headers: Record<string, unknown>;
    status: number;
  }>((resolve, reject) => {
    const req = https.request(
      {
        hostname,
        path: pathWithQuery,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body).toString(),
          "User-Agent":
            "NeteaseMusic/9.3.55.250807173349(9003055); Dalvik/2.1.0 (Linux; U; Android 12)",
          Referer: "https://music.163.com/",
          Accept: "*/*",
          "Accept-Encoding": "br,gzip,deflate",
          ...headers,
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (d) => chunks.push(d));
        res.on("end", () =>
          resolve({
            buffer: Buffer.concat(chunks),
            headers: res.headers as Record<string, unknown>,
            status: res.statusCode || 0,
          })
        );
      }
    );
    req.on("error", reject);
    req.setTimeout(timeoutMs, () =>
      req.destroy(new Error(`timeout ${timeoutMs}ms`))
    );
    req.write(body);
    req.end();
  });
}

/** 调用 eapi（带详细日志与 JSON 判别） */
export async function callEapi<T = unknown>({
  hostname,
  eapiPath,
  query = "",
  apiPath,
  data = {},
  cookie = "",
  key = KEY,
}: {
  hostname: string;
  eapiPath: string;
  query?: string;
  apiPath: string;
  data?: Record<string, unknown>;
  cookie?: string;
  key?: Buffer;
}): Promise<T> {
  const body = eapiPack(apiPath, data, key);

  const { buffer, headers, status } = await postBuffer({
    hostname,
    pathWithQuery: eapiPath + query,
    body,
    headers: cookie ? { Cookie: cookie } : {},
  });

  const { text, decrypted } = eapiDecrypt(buffer, headers, key);

  // 清 BOM / 防注入前缀
  let cleaned = text;
  if (cleaned.charCodeAt(0) === 0xfeff) cleaned = cleaned.slice(1);
  if (cleaned.startsWith(")]}'")) cleaned = cleaned.slice(4);

  // 不是 JSON-like 直接报错，避免继续误判
  const first = cleaned.trimStart()[0];
  if (first !== "{" && first !== "[") {
    console.log(cleaned);
    throw new Error(
      `Response is not JSON-like (status ${status}, decrypted=${decrypted}).`
    );
  }

  try {
    const obj = JSON.parse(cleaned);
    return obj as T;
  } catch (e: unknown) {
    throw new Error(
      `JSON parse failed (status ${status}, decrypted=${decrypted}). ` +
        `CT=${headers["content-type"]}; Preview=${cleaned.slice(0, 200)}`
    );
  }
}
