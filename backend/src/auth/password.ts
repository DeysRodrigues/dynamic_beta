import { Algorithm, hash, verify } from "@node-rs/argon2";

// argon2id with the memory and time costs the OWASP password guide recommends as a minimum.
const options = { algorithm: Algorithm.Argon2id, memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;

export const hashPassword = (password: string) => hash(password, options);

/** A real hash of a password nobody has, to spend the same time when the e-mail is unknown. */
let dummyHash: Promise<string> | undefined;

/**
 * Checks a password against a stored hash. With no stored hash (unknown e-mail) it still does the
 * work of a check, so the response time does not tell whether the account exists.
 */
export async function verifyPassword(storedHash: string | undefined, password: string): Promise<boolean> {
  if (!storedHash) {
    dummyHash ??= hashPassword("not-a-real-password");
    await verify(await dummyHash, password);
    return false;
  }
  try {
    return await verify(storedHash, password);
  } catch {
    return false;
  }
}
