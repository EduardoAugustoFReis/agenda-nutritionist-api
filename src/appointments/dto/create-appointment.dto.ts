import { IsInt, IsPositive } from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  @IsPositive()
  availabilityId: number;
}
