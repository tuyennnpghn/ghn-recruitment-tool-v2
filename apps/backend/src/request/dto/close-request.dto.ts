import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CloseRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Lý do close không được để trống' })
  @MinLength(3, { message: 'Lý do close phải có ít nhất 3 ký tự' })
  closeReason: string;
}
