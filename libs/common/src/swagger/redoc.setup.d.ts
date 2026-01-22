import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ReDocOptions } from './redoc.config';
export declare const setupReDoc: (app: NestFastifyApplication, config: {
    title: string;
    description: string;
    version: string;
    tags: Array<{
        name: string;
        description: string;
    }>;
    port: number;
    serviceName: string;
}, redocOptions?: ReDocOptions) => import("@nestjs/swagger").OpenAPIObject;
