import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { createFirstOwnerInvitation, requireProductionBootstrapConfiguration } from "../../src/modules/authentication/first-owner-bootstrap";

function requireInteractiveTerminal() {
  if (!stdin.isTTY || !stdout.isTTY) {
    throw new Error("This command must run interactively in a private operator terminal.");
  }
}

async function main() {
  requireInteractiveTerminal();
  if (process.argv[2] !== "bootstrap") {
    throw new Error("Usage: npm run auth:first-owner -- bootstrap");
  }
  const configuration = requireProductionBootstrapConfiguration();
  const prompt = createInterface({ input: stdin, output: stdout });
  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString: configuration.connectionString }) });
  try {
    const ownerEmail = await prompt.question("Owner email: ");
    const confirmation = await prompt.question("Type CREATE FIRST OWNER to continue: ");
    if (confirmation !== "CREATE FIRST OWNER") throw new Error("Confirmation did not match; no data was changed.");
    const link = await createFirstOwnerInvitation(client, ownerEmail);
    stdout.write("First-owner invitation created. Deliver this single-use link privately; do not paste it into chat, tickets, or logs.\n");
    stdout.write(`${link}\n`);
  } finally {
    prompt.close();
    await client.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "First-owner operation failed.";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});

