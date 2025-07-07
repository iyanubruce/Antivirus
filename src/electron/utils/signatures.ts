import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Signature } from "../types/interfaces";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let signaturesCache: Signature[] | null = null;

export async function loadSignatures(): Promise<Signature[]> {
  if (signaturesCache) {
    return signaturesCache;
  }
  const signaturesPath = path.join(
    __dirname,
    "../../signatures/signatures.json"
  );
  try {
    const data = await fs.readFile(signaturesPath, "utf-8");
    const json = JSON.parse(data) as { signatures: Signature[] };
    signaturesCache = json.signatures;
    return signaturesCache;
  } catch (error: any) {
    throw new Error(`Failed to load signatures: ${error.message}`);
  }
}
