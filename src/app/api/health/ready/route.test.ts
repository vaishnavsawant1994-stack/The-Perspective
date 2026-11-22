import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  connect: vi.fn(),
  query: vi.fn(),
  end: vi.fn(),
  connectionString: undefined as string | undefined,
}));

vi.mock("pg", () => ({
  Client: class MockClient {
    constructor(options: { connectionString: string }) {
      database.connectionString = options.connectionString;
    }

    connect() {
      return database.connect();
    }

    query(query: string) {
      return database.query(query);
    }

    end() {
      return database.end();
    }
  },
}));

vi.mock("@/modules/foundation/config/production-boundary", () => ({
  assertProductionConfiguration: vi.fn(),
}));

import { GET } from "./route";

describe("GET /api/health/ready", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    database.connect.mockResolvedValue(undefined);
    database.query.mockResolvedValue({ rows: [{ "?column?": 1 }] });
    database.end.mockResolvedValue(undefined);
    vi.stubEnv(
      "DATABASE_URL",
      "postgresql://user:pass@db.example.test:5432/app?sslmode=require",
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the strict normalized TLS mode for its PostgreSQL probe", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(database.connectionString).toBe(
      "postgresql://user:pass@db.example.test:5432/app?sslmode=verify-full",
    );
    expect(database.query).toHaveBeenCalledWith("SELECT 1");
    expect(database.end).toHaveBeenCalledOnce();
  });
});
