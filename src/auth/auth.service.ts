import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwt: JwtService
  ) {}

  async register(dto) {
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) throw new BadRequestException('Email already taken');

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.createUser({
      name: dto.name,
      email: dto.email,
      password: hashed,
    });

    return { message: 'User created successfully', user };
  }

  async login(dto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    const payload = { id: user.id, email: user.email };

    return {
      message: 'Login successful',
      access_token: this.jwt.sign(payload, { expiresIn: '1d' }),
      refresh_token: this.jwt.sign(payload, { expiresIn: '7d' }),
      user,
    };
  }
}
