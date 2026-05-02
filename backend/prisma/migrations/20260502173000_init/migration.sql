-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTAMENTO', 'CASA', 'LOTE', 'OUTRO');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('EM_ANALISE', 'ARREMATADO', 'EM_REGULARIZACAO', 'EM_REFORMA', 'A_VENDA', 'VENDIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('COMPRA', 'CARTORIO_1', 'CARTORIO_2', 'REFORMA', 'MATERIAL', 'MAO_DE_OBRA', 'CONDOMINIO', 'IPTU', 'LAUDO', 'COMISSAO_CORRETOR', 'COMISSAO_IMOBILIARIA', 'LUZ', 'AGUA', 'ACORDO_SAIDA', 'MATRICULA', 'CERTIDAO', 'CHAVEIRO', 'LIMPEZA', 'INDICACAO', 'OUTROS');

-- CreateEnum
CREATE TYPE "SplitType" AS ENUM ('POR_APORTE', 'PERCENTUAL_MANUAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "document" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "city" TEXT,
    "district" TEXT,
    "address" TEXT,
    "type" "PropertyType" NOT NULL DEFAULT 'APARTAMENTO',
    "status" "PropertyStatus" NOT NULL DEFAULT 'EM_ANALISE',
    "purchasePrice" DECIMAL(14,2) NOT NULL,
    "currentAppraisal" DECIMAL(14,2),
    "oldAppraisal" DECIMAL(14,2),
    "expectedSalePrice" DECIMAL(14,2),
    "finalSalePrice" DECIMAL(14,2),
    "purchaseDate" TIMESTAMP(3),
    "appraisalDate" TIMESTAMP(3),
    "saleDate" TIMESTAMP(3),
    "returnDate" TIMESTAMP(3),
    "registryNumber" TEXT,
    "iptuNumber" TEXT,
    "buyerCpf" TEXT,
    "condominiumMonths" INTEGER,
    "condominiumMonthlyValue" DECIMAL(14,2),
    "condominiumTotal" DECIMAL(14,2),
    "condominiumLastPaidMonth" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyInvestor" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "initialContribution" DECIMAL(14,2) NOT NULL,
    "ownershipPercent" DECIMAL(8,4),
    "profitPercent" DECIMAL(8,4),
    "splitType" "SplitType" NOT NULL DEFAULT 'POR_APORTE',
    "expectedReturn" DECIMAL(14,2),
    "finalReturn" DECIMAL(14,2),
    "amountAlreadyPaid" DECIMAL(14,2),
    "balanceToPay" DECIMAL(14,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyInvestor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "paidByInvestorId" TEXT,
    "description" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestorPayment" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestorPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "cdiAnnualRate" DECIMAL(8,4),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyInvestor_propertyId_investorId_key" ON "PropertyInvestor"("propertyId", "investorId");

-- AddForeignKey
ALTER TABLE "PropertyInvestor" ADD CONSTRAINT "PropertyInvestor_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyInvestor" ADD CONSTRAINT "PropertyInvestor_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "Investor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_paidByInvestorId_fkey" FOREIGN KEY ("paidByInvestorId") REFERENCES "Investor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestorPayment" ADD CONSTRAINT "InvestorPayment_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestorPayment" ADD CONSTRAINT "InvestorPayment_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "Investor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

