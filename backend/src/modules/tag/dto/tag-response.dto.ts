import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
export class TagDtoResponse {
    @ApiProperty({ example: 1, description: 'The id of the tag' })
    id: number;

    @ApiProperty({ example: 'Tag 1', description: 'The name of the tag' })
    name: string;

    @ApiProperty({ example: 'Tag 1', description: 'The slug of the tag' })
    slug: string;

    @ApiProperty({ example: '2024-01-01', description: 'The created at of the tag' })
    @Exclude()
    createdAt: Date;

    @ApiProperty({ example: '2024-01-01', description: 'The updated at of the tag' })
    @Exclude()
    updatedAt: Date;
}


