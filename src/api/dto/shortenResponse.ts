import { ApiProperty } from '@nestjs/swagger';
export class shortenResponse {
    @ApiProperty({ description: 'Response data', example: 'Short link generated' })
    response: string;

    @ApiProperty({ description: '6 symbols short link', example: 'http://api-address/abc123' })
    link: string;
}
