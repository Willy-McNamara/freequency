"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const sessions_module_1 = require("./sessions/sessions.module");
const musicians_module_1 = require("./musicians/musicians.module");
const serve_static_1 = require("@nestjs/serve-static");
const logger_middleware_1 = require("./logger.middleware");
const path_1 = require("path");
const musicians_service_1 = require("./musicians/musicians.service");
const sessions_service_1 = require("./sessions/sessions.service");
const auth_module_1 = require("./auth/auth.module");
const core_1 = require("@nestjs/core");
const unauthorized_exception_filter_1 = require("./filters/unauthorized-exception.filter");
const jwt_strategy_1 = require("./auth/jwt.strategy");
const jwt_1 = require("@nestjs/jwt");
const s3_service_1 = require("./s3/s3.service");
const all_exceptions_filter_1 = require("./filters/all-exceptions.filter");
const throttler_1 = require("@nestjs/throttler");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(logger_middleware_1.LoggerMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            sessions_module_1.SessionsModule,
            musicians_module_1.MusiciansModule,
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '../../../frontend/dist'),
            }),
            auth_module_1.AuthModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: '5m' },
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 10,
                },
            ]),
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            musicians_service_1.MusiciansService,
            sessions_service_1.SessionsService,
            jwt_strategy_1.JwtStrategy,
            jwt_1.JwtService,
            s3_service_1.S3Service,
            {
                provide: core_1.APP_FILTER,
                useClass: all_exceptions_filter_1.AllExceptionsFilter,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: unauthorized_exception_filter_1.UnauthorizedExceptionFilter,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map