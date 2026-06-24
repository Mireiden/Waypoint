-- CreateTable
CREATE TABLE "favorites" (
    "user_id" INTEGER NOT NULL,
    "destination_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("user_id","destination_id")
);

-- CreateIndex
CREATE INDEX "idx_favorites_destination" ON "favorites"("destination_id");

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "fk_destination_id" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
