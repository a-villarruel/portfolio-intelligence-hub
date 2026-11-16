CREATE TYPE "DemandStatus" AS ENUM ('New');

CREATE TABLE "Demand" (
    "id" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" VARCHAR(4000) NOT NULL,
    "requesterName" VARCHAR(120) NOT NULL,
    "status" "DemandStatus" NOT NULL DEFAULT 'New',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Demand_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Demand_title_nonempty_check" CHECK (regexp_replace("title", '[[:space:]]', '', 'g') <> ''),
    CONSTRAINT "Demand_description_nonempty_check" CHECK (regexp_replace("description", '[[:space:]]', '', 'g') <> ''),
    CONSTRAINT "Demand_requesterName_nonempty_check" CHECK (regexp_replace("requesterName", '[[:space:]]', '', 'g') <> '')
);

CREATE INDEX "Demand_createdAt_id_idx" ON "Demand"("createdAt" DESC, "id" DESC);
