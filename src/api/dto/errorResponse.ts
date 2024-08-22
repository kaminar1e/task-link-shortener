import { ApiProperty } from '@nestjs/swagger';
export class errorResponse {
    
    @ApiProperty({ description: 'Error message' })
    error: string;

}
