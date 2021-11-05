/**
 * Cloudflare Worker KV
 *
 * Workers KV is a global, low-latency, key-value data store. It supports exceptionally
 * high read volumes with low-latency, making it possible to build highly dynamic APIs
 * and websites which respond as quickly as a cached static file would.
 *
 * Workers KV is generally good for use-cases where you need to write relatively infrequently,
 * but read quickly and frequently. It is optimized for these high-read applications, only
 * reaching its full performance when data is being frequently read. Very infrequently read
 * values are stored centrally, while more popular values are maintained in all of our data
 * centers around the world.
 *
 * KV achieves this performance by being eventually-consistent. New key-value pairs are
 * immediately available everywhere, but value changes may take up to ten seconds to propagate.
 * Workers KV isn’t ideal for situations where you need support for atomic operations or where
 * values must be read and written in a single transaction.
 *
 * ref: https://developers.cloudflare.com/workers/kv
 *
 * Prerequisite
 * The first step is to bind one of your Namespaces to your Worker. This will make
 * that Namespace accessible from within the Worker at the variable name you specify.
 * ref: https://developers.cloudflare.com/workers/api/resource-bindings/
 */
 export interface CloudflareWorkerKV {
  /**
   * Read Value
   *
   * NAMESPACE.get(key, [type])
   *
   * The method returns a promise you can await to get the value.
   * If the key is not found, the promise will resolve with the literal value null.
   *
   * Type can be any of:
   *    "text" (default)
   *    "json"
   *    "arrayBuffer"
   *    "stream"
   *
   * The most performant way to read a KV value is directly from a Worker.
   * Read performance will generally get better the higher your read volume.
   *
   * For simple values it often makes sense to use the default "text" type which
   * provides you with your value as a string. For convenience a "json" type is also
   * specified which will convert your value into an object before returning it to you.
   * For large values you can request a ReadableStream, and for binary values an ArrayBuffer.
   */
  get(key: string, type?: 'text'): Promise<string>;
  get(key: string, type: 'json'): Promise<any>;
  get(key: string, type: 'arrayBuffer'): Promise<ArrayBuffer>;
  get(key: string, type: 'stream'): Promise<ReadableStream>;

  /**
   * Write Value
   *
   * You can write and delete values from a Worker, but you should note that it is an
   * eventually consistent data store. In practice, this means it is not uncommon for
   * an edge location to continue returning an old value for a key that has recently been
   * written in some other edge location. If, after considering that, it does make sense
   * to write values from your Worker, the API is:
   *
   * NAMESPACE.put(key, value, options?)
   *
   * The type is automatically inferred from value, and can be any of:
   *    string
   *    ReadableStream
   *    ArrayBuffer
   *    FormData
   *
   * All values are encrypted at rest with 256-bit AES-GCM, and only decrypted by the
   * process executing your Worker scripts.
   *
   * If you want the keys you write to be automatically deleted at some time in the future,
   * use the optional third parameter. It accepts an object with optional fields that allow
   * you to customize the behavior of the put. In particular, you can set either expiration
   * or expirationTtl, depending on how you would like to specify the key’s expiration time.
   * In other words, you’d run one of the two commands below to set an expiration when writing
   * a key from within a Worker:
   *
   * NAMESPACE.put(key, value, {expiration: secondsSinceEpoch})
   *
   * NAMESPACE.put(key, value, {expirationTtl: secondsFromNow})
   *
   * These assume that secondsSinceEpoch and secondsFromNow are variables defined elsewhere in
   * your Worker code.
   */
  put(
    key: string,
    value: string | ReadableStream | ArrayBuffer | FormData,
    options?: CloudflareWorkerKVOptions,
  ): Promise<void>;

  /**
   * Delete Value
   *
   * NAMESPACE.delete(key)
   *
   * As with all updates, deletes can take up to ten seconds to propagate globally.
   */
  delete(key: string): Promise<void>;

  /**
   * Listing Keys
   *
   * NAMESPACE.list({prefix?: string, limit?: number, cursor?: string})
   *
   * The .list method returns a promise which resolves with a CloudflareWorkerKVList object:
   *
   *  {
   *    keys: [{ name: "foo", expiration: 1234}],
   *    list_complete: false,
   *    cursor: "6Ck1la0VxJ0djhidm1MdX2FyD"
   *  }
   */
  list(
    prefix?: string,
    limit?: number,
    cursor?: string,
  ): Promise<CloudflareWorkerKVList>;
}

/**
 * Cloudflare Worker KV Options
 * Worker KV accepts a third parameters to control the lifetime of the key
 * ref: https://developers.cloudflare.com/workers/kv/expiring-keys/
 *
 * Many common uses of Workers KV involve writing keys that are only meant to be valid
 * for a certain amount of time. Rather than requiring applications to remember to delete
 * such data at the appropriate time, Workers KV offers the ability to create keys that
 * automatically expire, either at a particular point in time or after a certain amount of
 * time has passed since the key was last modified.
 */
export interface CloudflareWorkerKVOptions {
  /**
   * Set its “expiration”, using an absolute time specified in a number of seconds since the
   * UNIX epoch. For example, if you wanted a key to expire at 12:00AM UTC on April 1, 2019,
   * you would set the key’s expiration to 1554076800.
   */
  expiration?: number;
  /**
   * Set its “expiration TTL” (time to live), using a relative number of seconds from the
   * current time. For example, if you wanted a key to expire 10 minutes after creating it,
   * you would set its expiration TTL to 600.
   */
  expirationTtl?: number;
}

/**
 * Cloudflare Worker KV key list
 */
export interface CloudflareWorkerKVList {
  keys: {
    name: string;
    expiration?: number;
  }[];
  list_complete: boolean;
  cursor: string;
}

declare global {
  const SWAPS_DB: CloudflareWorkerKV;
  const SELLERS_DB: CloudflareWorkerKV;
  const YAPILY_KEY: string;
  const YAPILY_SECRET: string;
  const MNEMONIC: string;
}