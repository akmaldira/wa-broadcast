-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ROOT', 'ADMIN', 'USER');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("provider","provider_account_id")
);

-- CreateTable
CREATE TABLE "session" (
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "verification_token" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_token_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "whatsapp" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,

    CONSTRAINT "whatsapp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_session" (
    "id" TEXT NOT NULL,
    "whatsapp_id" TEXT NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "whatsapp_session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_session_token_key" ON "session"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_api_key_key" ON "whatsapp"("api_key");

-- CreateIndex
CREATE INDEX "whatsapp_session_id_whatsapp_id_idx" ON "whatsapp_session"("id", "whatsapp_id");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_session_id_whatsapp_id" ON "whatsapp_session"("id", "whatsapp_id");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_session" ADD CONSTRAINT "whatsapp_session_whatsapp_id_fkey" FOREIGN KEY ("whatsapp_id") REFERENCES "whatsapp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
