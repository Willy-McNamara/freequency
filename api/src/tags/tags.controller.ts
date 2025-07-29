import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MAX_LENGTH = 30;
const ALLOWED_REGEX = /^[a-z0-9 _\-.,!?()'":;]+$/;

function sanitizeTagLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9 _\-.,!?()'":;]/g, '')
    .slice(0, MAX_LENGTH);
}

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

  @Post()
  async createTag(
    @Body() body: { label: string; color?: string },
  ): Promise<{ id: number; label: string; color?: string }> {
    const { color } = body;
    let { label } = body;
    if (!label || label.trim() === '') {
      throw new BadRequestException('Tag label is required');
    }
    label = sanitizeTagLabel(label.trim());
    if (label.length === 0) {
      throw new BadRequestException('Tag label is required after sanitization');
    }
    if (label.length > MAX_LENGTH) {
      throw new BadRequestException(
        `Tag must be ${MAX_LENGTH} characters or less.`,
      );
    }
    if (!ALLOWED_REGEX.test(label)) {
      throw new BadRequestException('Tag contains invalid characters.');
    }
    // Check if tag already exists
    let tag = await this.prisma.tag.findUnique({ where: { label } });
    if (tag) return tag;
    tag = await this.prisma.tag.create({ data: { label, color } });
    return tag;
  }
}
