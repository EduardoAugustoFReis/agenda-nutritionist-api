import { IsString } from 'class-validator';

export class CreateAvailabilityDto {
  @IsString()
  date: string; // YYYY-MM-DD

  @IsString()
  startTime: string; // HH:MM

  @IsString()
  endTime: string; // HH:MM
}
