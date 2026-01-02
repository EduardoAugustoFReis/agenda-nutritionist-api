import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [AppointmentsService],
  controllers: [AppointmentsController],
  imports: [PrismaModule],
})
export class AppointmentsModule {}
