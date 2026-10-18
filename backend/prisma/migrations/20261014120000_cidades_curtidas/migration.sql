-- CreateTable
CREATE TABLE `Cidade` (
    `idCidade` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `uf` VARCHAR(2) NOT NULL DEFAULT 'RN',
    `token` VARCHAR(40) NOT NULL,
    `cadastrada` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Cidade_token_key`(`token`),
    UNIQUE INDEX `Cidade_nome_uf_key`(`nome`, `uf`),
    PRIMARY KEY (`idCidade`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `Cidadao` ADD COLUMN `Cidade_idCidade` INTEGER NULL;
ALTER TABLE `Gestao` ADD COLUMN `Cidade_idCidade` INTEGER NULL;
ALTER TABLE `Denuncia`
    ADD COLUMN `Cidade_idCidade` INTEGER NULL,
    MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'Não iniciada',
    MODIFY `prioridade` VARCHAR(20) NULL DEFAULT 'Média';

-- Converte os status antigos para os novos
UPDATE `Denuncia` SET `status` = 'Não iniciada' WHERE `status` = 'Pendente';
UPDATE `Denuncia` SET `status` = 'Em andamento' WHERE `status` = 'Em análise';
UPDATE `Denuncia` SET `status` = 'Concluída' WHERE `status` = 'Resolvida';

-- CreateTable
CREATE TABLE `Curtida` (
    `idCurtida` INTEGER NOT NULL AUTO_INCREMENT,
    `criadaEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `Cidadao_idCidadao` INTEGER NOT NULL,
    `Denuncia_idDenuncia` INTEGER NOT NULL,

    UNIQUE INDEX `Curtida_Cidadao_idCidadao_Denuncia_idDenuncia_key`(`Cidadao_idCidadao`, `Denuncia_idDenuncia`),
    PRIMARY KEY (`idCurtida`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Denuncia_Cidade_idCidade_idx` ON `Denuncia`(`Cidade_idCidade`);

-- AddForeignKey
ALTER TABLE `Cidadao` ADD CONSTRAINT `Cidadao_Cidade_idCidade_fkey` FOREIGN KEY (`Cidade_idCidade`) REFERENCES `Cidade`(`idCidade`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Gestao` ADD CONSTRAINT `Gestao_Cidade_idCidade_fkey` FOREIGN KEY (`Cidade_idCidade`) REFERENCES `Cidade`(`idCidade`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Denuncia` ADD CONSTRAINT `Denuncia_Cidade_idCidade_fkey` FOREIGN KEY (`Cidade_idCidade`) REFERENCES `Cidade`(`idCidade`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Curtida` ADD CONSTRAINT `Curtida_Cidadao_idCidadao_fkey` FOREIGN KEY (`Cidadao_idCidadao`) REFERENCES `Cidadao`(`idCidadao`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Curtida` ADD CONSTRAINT `Curtida_Denuncia_idDenuncia_fkey` FOREIGN KEY (`Denuncia_idDenuncia`) REFERENCES `Denuncia`(`idDenuncia`) ON DELETE CASCADE ON UPDATE CASCADE;
