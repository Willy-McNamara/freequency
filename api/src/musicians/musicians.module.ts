import { Module } from "@nestjs/common";
import { MusiciansService } from "./musicians.service";
import { MusiciansController } from "./musicians.controller";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
  controllers: [MusiciansController],
  providers: [MusiciansService, PrismaService],
})
export class MusiciansModule {}
