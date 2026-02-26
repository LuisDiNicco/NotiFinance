import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../../../../application/AuthService';
import { RegisterRequest } from './request/RegisterRequest';
import { LoginRequest } from './request/LoginRequest';
import { RefreshTokenRequest } from './request/RefreshTokenRequest';
import { AuthResponse } from '../responses/AuthResponse';
import { RefreshTokenResponse } from '../responses/RefreshTokenResponse';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, type: AuthResponse })
  public async register(
    @Body() request: RegisterRequest,
  ): Promise<AuthResponse> {
    const result = await this.authService.register(
      request.email,
      request.password,
      request.displayName,
    );

    return AuthResponse.fromEntity(result.user, result.tokens);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, type: AuthResponse })
  public async login(@Body() request: LoginRequest): Promise<AuthResponse> {
    const result = await this.authService.login(
      request.email,
      request.password,
    );
    return AuthResponse.fromEntity(result.user, result.tokens);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, type: RefreshTokenResponse })
  public async refreshToken(
    @Body() request: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> {
    const tokens = await this.authService.refreshToken(request.refreshToken);
    return RefreshTokenResponse.fromTokens(tokens);
  }

  @Post('demo')
  @ApiOperation({ summary: 'Start a recruiter-friendly demo session' })
  @ApiResponse({ status: 201, type: AuthResponse })
  public async demo(): Promise<AuthResponse> {
    const result = await this.authService.createDemoSession();
    return AuthResponse.fromEntity(result.user, result.tokens);
  }
}
