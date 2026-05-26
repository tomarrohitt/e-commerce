import { prisma } from "../config/prisma";
import { safeQuery } from "@ecommerce/common";

class ProductReplicaRepository {
  async findbyId(id: string) {
    return await safeQuery(
      () =>
        prisma.productReplica.findUnique({
          where: { id },
        }),
      { model: "ProductReplica", operation: "find" }
    );
  }

  async findByIds(ids: string[]) {
    return await safeQuery(
      () =>
        prisma.productReplica.findMany({
          where: { id: { in: ids } },
        }),
      { model: "ProductReplica", operation: "findByIds" }
    );
  }
}

export default new ProductReplicaRepository();
