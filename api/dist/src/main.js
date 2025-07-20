"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const dotenv_1 = require("dotenv");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = require("path");
const fs_1 = require("fs");
async function bootstrap() {
    (0, dotenv_1.config)();
    if ((0, fs_1.existsSync)('.env.local')) {
        (0, dotenv_1.config)({ path: '.env.local' });
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://demo.freequencyapp.com',
        ],
        credentials: true,
    });
    app.use((0, cookie_parser_1.default)());
    app.use((req, res, next) => {
        if (req.url.startsWith('/api') ||
            req.url.startsWith('/auth') ||
            req.url.startsWith('/sessions') ||
            req.url.startsWith('/musicians') ||
            req.url.startsWith('/instruments') ||
            req.url.startsWith('/tags') ||
            req.url.startsWith('/tasks') ||
            req.url.startsWith('/assets') ||
            req.url.startsWith('/logo.svg') ||
            req.url.startsWith('/vite.svg')) {
            return next();
        }
        res.sendFile((0, path_1.join)(process.cwd(), '../frontend/dist/index.html'));
    });
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map