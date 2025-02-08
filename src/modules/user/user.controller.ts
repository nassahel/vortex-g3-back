import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // crea un usuario
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // obtiene todos los usuarios sin borrado logico
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
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  //Borrado logico de un usuario por id
  @Patch('delete/:id')
  logicDelete(@Param('id') id: string) {
    return this.userService.logicDelete(id);
  }

  //Borra definitivamente un suuario de la base de datos.
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
