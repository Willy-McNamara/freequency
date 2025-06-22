import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('tags')
export class TagsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('all-labels')
  async getAllLabels(): Promise<string[]> {
    const tags = await this.prisma.tag.findMany({
      select: { label: true },
      orderBy: { label: 'asc' },
    });
    return tags.map((t) => t.label);
  }
}
