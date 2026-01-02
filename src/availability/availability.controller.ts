import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NUTRITIONIST')
  create(@Body() dto: CreateAvailabilityDto, @Req() req) {
    const nutritionistId = req.user.id;
    return this.availabilityService.create(nutritionistId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT')
  listAllAvailableSlots(
    @Query('nutritionistId') nutritionistId: string,
    @Query('date') date: string,
  ) {
    return this.availabilityService.listAll(Number(nutritionistId), date);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NUTRITIONIST')
  listMySlots(@Req() req) {
    const nutritionistId = req.user.id;
    return this.availabilityService.listAllSlotsByNutritionist(nutritionistId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NUTRITIONIST')
  deleteMySlots(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const nutritionistId = req.user.id;
    return this.availabilityService.deleteSlot(id, nutritionistId);
  }
}
