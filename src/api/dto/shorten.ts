import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class Shorten {
    @IsString()
    @ApiProperty({ description: 'The long URL to shorten', example: 'http://example.com' })
    longUrl: string;
}
