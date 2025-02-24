import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleEnum } from 'src/common/constants';
import { PaginationArgs } from 'src/utils/pagination/pagination.dto';
import { I18nService } from 'nestjs-i18n';
import { SWAGGER_TRANSLATIONS } from 'src/i18n/en/i18n.swagger';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly i18n: I18nService,
  ) {}

  // crea un usuario
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.USER_CREATE }) //Para documentacion de Swagger
  @ApiResponse({
    status: 201,
    description: SWAGGER_TRANSLATIONS.USER_CREATE_SUCCESS,
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // obtiene todos los usuarios sin borrado logico
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @Get()
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.USER_GET_ALL }) //Para documentacion de Swagger
  @ApiResponse({
    status: 201,
    description: SWAGGER_TRANSLATIONS.USER_GET_ALL_SUCCESS,
  })
  findAll(@Query() filters: PaginationArgs) {
    return this.userService.findAll(filters);
  }

  // obtiene solo los usuarios sin borrado logico y que esten activos
  @Get('get-all-active')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.USER_GET_ALL }) //Para documentacion de Swagger
  @ApiResponse({
    status: 201,
    description: SWAGGER_TRANSLATIONS.USER_GET_ALL_SUCCESS,
  })
  findAllActive(@Query() filters: PaginationArgs) {
    return this.userService.findAllActive(filters);
  }

  // Obtiene todos los usuarios con rol USER
  @Get('get-all-users')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.USER_GET_ALL }) //Para documentacion de Swagger
  @ApiResponse({
    status: 201,
    description: SWAGGER_TRANSLATIONS.USER_GET_ALL_SUCCESS,
  })
  findAllUsers(@Query() filters: PaginationArgs) {
    return this.userService.findAllUsers(filters);
  }

  // Obtiene un usuario por id
  @Get(':id')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.USER_GET_ONE }) //Para documentacion de Swagger
  @ApiResponse({
    status: 201,
    description: SWAGGER_TRANSLATIONS.USER_GET_ONE_SUCCESS,
  })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // Actualiza un usuario por id
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.USER_UPDATE }) //Para documentacion de Swagger
  @ApiResponse({
    status: 201,
    description: SWAGGER_TRANSLATIONS.USER_UPDATE_SUCCESS,
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  //Borrado logico de un usuario por id
  @UseGuards(JwtAuthGuard)
  @Patch('delete/:id')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.USER_DELETE }) //Para documentacion de Swagger
  @ApiResponse({
    status: 201,
    description: SWAGGER_TRANSLATIONS.USER_DELETE_SUCCESS,
  })
  logicDelete(@Param('id') id: string) {
    return this.userService.logicDelete(id);
  }

  //Borra definitivamente un suuario de la base de datos.

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @Delete('delete/:id')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.USER_DELETE }) //Para documentacion de Swagger
  @ApiResponse({
    status: 201,
    description: SWAGGER_TRANSLATIONS.USER_DELETE_SUCCESS,
  })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
