export interface OutboxRecord {
  id: string;
  aggregateId: string;
  eventType: string;
  payload: any; // Json
  status: string;
  createdAt: Date;
}

export interface OutboxPrismaClient {
  outboxEvent: {
    findMany: (args: {
      where: { status: any };
      take: number;
      orderBy: { createdAt: "asc" | "desc" };
    }) => Promise<OutboxRecord[]>;

    update: (args: {
      where: { id: string };
      data: { status: any };
    }) => Promise<OutboxRecord>;
  };
}
