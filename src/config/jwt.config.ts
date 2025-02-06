import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

const JwtModuleConfig = async () => {
    const options = {
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
            return {
                secret: configService.get<string>('JWT_SECRET_KEY'),
            };
        },
        inject: [ConfigService],
    };
    return JwtModule.registerAsync(options);
};

export default JwtModuleConfig;