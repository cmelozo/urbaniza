-- CreateTable
CREATE TABLE `Cidadao` (
    `idCidadao` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `telefone` VARCHAR(20) NULL,

    UNIQUE INDEX `Cidadao_email_key`(`email`),
    PRIMARY KEY (`idCidadao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gestao` (
    `idGestao` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `Gestao_email_key`(`email`),
    PRIMARY KEY (`idGestao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Denuncia` (
    `idDenuncia` INTEGER NOT NULL AUTO_INCREMENT,
    `descricao` TEXT NOT NULL,
    `categoria` VARCHAR(50) NULL,
    `localizacao` VARCHAR(255) NOT NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(30) NOT NULL DEFAULT 'Pendente',
    `prioridade` VARCHAR(20) NULL,
    `midia` JSON NULL,
    `Cidadao_idCidadao` INTEGER NOT NULL,
    `Gestao_idGestao` INTEGER NULL,

    PRIMARY KEY (`idDenuncia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Denuncia` ADD CONSTRAINT `Denuncia_Cidadao_idCidadao_fkey` FOREIGN KEY (`Cidadao_idCidadao`) REFERENCES `Cidadao`(`idCidadao`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Denuncia` ADD CONSTRAINT `Denuncia_Gestao_idGestao_fkey` FOREIGN KEY (`Gestao_idGestao`) REFERENCES `Gestao`(`idGestao`) ON DELETE SET NULL ON UPDATE CASCADE;
