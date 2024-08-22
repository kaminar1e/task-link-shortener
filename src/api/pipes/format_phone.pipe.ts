import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class FormatPhonePipe implements PipeTransform<string, string> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any): string {
    if (typeof value !== 'string') {
      throw new BadRequestException('Неправильний формат номеру телефону');
    }
    value = value.replace(' ', '+');
    if (!value.includes('+38') && value[0] == '0') {
      value = '+38' + value;
    } else if (!value.includes('+') && value[0] == '0' || value[0] == '3') {
      value = '+' + value;
    }
    if (!value.includes('+380') && value[0] != '0') {
      value = '+380' + value;
    }
    return value;
  }
}
