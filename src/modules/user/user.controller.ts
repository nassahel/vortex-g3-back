import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleEnum } from 'src/common/constants';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // crea un usuario
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // obtiene todos los usuarios sin borrado logico
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // obtiene solo los usuarios sin borrado logico y que esten activos
  @Get('get-all-active')
  findAllActive() {
    return this.userService.findAllActive();
  }

  // Obtiene todos los usuarios con rol USER
  @Get('get-all-users')
  findAllUsers() {
    return this.userService.findAllUsers();
  }

  // Obtiene un usuario por id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // Actualiza un usuario por id
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  //Borrado logico de un usuario por id
  @UseGuards(JwtAuthGuard)
  @Patch('delete/:id')
  logicDelete(@Param('id') id: string) {
    return this.userService.logicDelete(id);
  }

  //Borra definitivamente un suuario de la base de datos.

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
