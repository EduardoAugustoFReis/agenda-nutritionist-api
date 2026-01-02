import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prismaService: PrismaService) {}

  create = async (nutritionistId: number, dto: CreateAvailabilityDto) => {
    // Criar a base da data (somente o dia) a partir da string recebida
    const baseDate = new Date(dto.date);

    // Validar se a data é válida
    if (isNaN(baseDate.getTime())) {
      throw new BadRequestException('Data inválida');
    }

    // Normalizar para o início do dia (00:00 UTC)
    baseDate.setUTCHours(0, 0, 0, 0);

    // Separar horas e minutos que vieram como string "HH:MM"
    const [startHour, startMinute] = dto.startTime.split(':').map(Number);
    const [endHour, endMinute] = dto.endTime.split(':').map(Number);

    const startTime = new Date(baseDate);
    startTime.setUTCHours(startHour, startMinute, 0, 0);

    const endTime = new Date(baseDate);
    endTime.setUTCHours(endHour, endMinute, 0, 0);

    const user = await this.prismaService.user.findUnique({
      where: { id: nutritionistId },
    });

    if (!user || user.role !== 'NUTRITIONIST') {
      throw new BadRequestException('Usuário não é um nutricionista');
    }

    if (startTime >= endTime) {
      throw new BadRequestException(
        'Horário inicial deve ser antes do horário final',
      );
    }

    if (startTime < new Date()) {
      throw new BadRequestException(
        'Não é possível criar horários no passado.',
      );
    }

    const conflict = await this.prismaService.availability.findFirst({
      where: {
        nutritionistId,
        date: baseDate,
        AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
      },
    });

    if (conflict) {
      throw new BadRequestException('Conflito com outro horário disponível');
    }

    const availability = await this.prismaService.availability.create({
      data: {
        nutritionistId,
        date: baseDate,
        startTime,
        endTime,
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        isBooked: true,
      },
    });

    return {
      message: 'Horário disponível criado com sucesso',
      availability: {
        id: availability.id,
        date: availability.date.toISOString().split('T')[0],
        startTime: availability.startTime.toISOString().substring(11, 16),
        endTime: availability.endTime.toISOString().substring(11, 16),
        isBooked: availability.isBooked,
      },
    };
  };

  listAll = async (nutritionistId: number, date: string) => {
    if (!nutritionistId || !date) {
      throw new BadRequestException('nutritionistId e date são obrigatórios');
    }

    const nutritionist = await this.prismaService.user.findUnique({
      where: { id: nutritionistId },
    });

    if (!nutritionist || nutritionist.role !== 'NUTRITIONIST') {
      throw new NotFoundException('Nutricionista não encontrado');
    }

    const parsedDate = new Date(date);

    // “Se a string que veio não virar uma data válida, lança erro antes de ir ao banco.”
    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Data inválida');
    }

    const availableSlots = await this.prismaService.availability.findMany({
      where: {
        nutritionistId,
        date: parsedDate,
        isBooked: false,
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
      },
    });

    return availableSlots;
  };

  listAllSlotsByNutritionist = async (nutritionistId: number) => {
    const slots = await this.prismaService.availability.findMany({
      where: {
        nutritionistId,
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    return slots;
  };

  deleteSlot = async (id: number, nutritionistId: number) => {
    const slot = await this.prismaService.availability.findUnique({
      where: { id },
    });

    if (!slot) {
      throw new NotFoundException('Horário não encontrado');
    }

    if (slot.nutritionistId !== nutritionistId) {
      throw new ForbiddenException(
        'Você não tem permissão para deletar este horário',
      );
    }

    if (slot.isBooked === true) {
      throw new BadRequestException(
        'Não é possível deletar um horário já reservado',
      );
    }

    await this.prismaService.availability.delete({
      where: {
        id: slot.id,
      },
    });

    return { message: 'Horário deletado com sucesso' };
  };
}
