import { Body, Controller, Get, Param, Post, Req, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { Response, Request } from 'express';
import { ShortcodeService } from '../services/shortcode.service';
import { LimiterGuard } from '../guards/limiter.guard';
import { Shorten } from '../dto/shorten';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { shortenResponse } from '../dto/shortenResponse';
import { getStatsResponse } from '../dto/getStatsResponse';
import { errorResponse } from '../dto/errorResponse';


@ApiTags('shorten')
@Controller('')
export class ShortenController {
    constructor(
        private readonly shortcode: ShortcodeService,

    ) { };

    @Post('/shorten')
    @UseGuards(LimiterGuard)
    @ApiOperation({ summary: 'Generate short link' })
    @ApiBody({ type: Shorten })
    @ApiResponse({ status: 201, description: 'Shorten link generated', type: shortenResponse })
    @ApiResponse({ status: 403, description: 'Rate limit exceeded', })
    @ApiResponse({ status: 409, description: 'This shortcode already exists', type: errorResponse })
    @ApiResponse({ status: 500, description: 'Internal server error', type: errorResponse })

    async shortenLink(@Body(new ValidationPipe({ transform: true, whitelist: true })) body: Shorten, @Req() req: Request, @Res() res: Response): Promise<Response> {
        try {
            const code = await this.shortcode.createUniqueCode();
            const mappingResult = await this.shortcode.createMapping(code, body.longUrl);
            if (mappingResult) {
                const protocol = req.get('x-forwarded-proto') || req.protocol;
                const host = req.get('x-forwarded-host') || req.get('host');
                const baseUrl = `${protocol}://${host}`;
                return res.status(201).json({ response: 'Short Link generated', link: `${baseUrl}/${code}` });
            } else {
                return res.status(409).json({ error: 'This shortcode already exists' });
            }
        } catch (error) {
            return res.status(500).json({ error: `Internal server error: ${error}` });
        }
    }

    @Get('/:code')
    @UseGuards(LimiterGuard)
    @ApiOperation({ summary: 'Redirect to original URL' })
    @ApiParam({ name: 'code', description: 'Link short code', example: 'abc123' })
    @ApiResponse({ description: 'Redirects to original URL' })
    @ApiResponse({ status: 403, description: 'Rate limit exceeded', })
    @ApiResponse({ status: 404, description: 'Short link not found', type: errorResponse })
    @ApiResponse({ status: 500, description: 'Internal server error', type: errorResponse })

    async redirect(@Param('code') code: string, @Res() res: Response): Promise<void | Response> {
        if (code.length === 6) {
            try {
                const originalUrl = await this.shortcode.getMappedUrl(code);
                if (originalUrl) {
                    await this.shortcode.updateStats(code);
                    res.redirect(originalUrl);
                } else {
                    return res.status(404).json({ error: 'Short link not found' });
                }
            } catch (error) {
                return res.status(500).json({ error: `Internal server error: ${error}` });
            }
        }
    }

    @Get('/stats/:code')
    @UseGuards(LimiterGuard)
    @ApiOperation({ summary: 'Get click count of short link' })
    @ApiParam({ name: 'shortcode', description: 'Link short code', example: 'abc123' })
    @ApiResponse({ status: 200, description: 'Click counts of short link', type: getStatsResponse })
    @ApiResponse({ status: 403, description: 'Rate limit exceeded', })
    @ApiResponse({ status: 404, description: 'Short link not found', type: errorResponse })
    @ApiResponse({ status: 500, description: 'Internal server error', type: errorResponse })
    async getLinkStats(@Param('code') code: string, @Res() res: Response): Promise<Response> {
        try {
            const clicks = await this.shortcode.getStats(code);
            if (clicks) return res.status(200).json({ response: 'OK', clicks: clicks });
            else return res.status(404).json({ error: 'Short link not found' });
        } catch (error) {
            return res.status(500).json({ error: `Internal server error: ${error}` });
        }
    }


}
