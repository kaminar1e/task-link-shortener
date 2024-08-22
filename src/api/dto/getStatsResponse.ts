import { ApiProperty } from '@nestjs/swagger';
export class getStatsResponse {
    @ApiProperty({ description: 'Response data', example: 'Short link generated' })
    response: string;

    @ApiProperty({ description: 'Short link clicks count' })
    clicks: string;
}
