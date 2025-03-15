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
import { ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ApiCustomOperation } from 'src/common/decorators/swagger.decorator';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly i18n: I18nService,
  ) { }

  // crea un usuario, se utiliza para admins.
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiCustomOperation({
    summary: SWAGGER_TRANSLATIONS.USER_CREATE,
    bodyType: CreateUserDto,
    responseStatus: 201,
    responseDescription: SWAGGER_TRANSLATIONS.USER_CREATE_SUCCESS,
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // obtiene todos los usuarios sin borrado logico
  @Get('/admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiCustomOperation({
    summary: SWAGGER_TRANSLATIONS.USER_GET_ALL,
    responseStatus: 201,
    responseDescription: SWAGGER_TRANSLATIONS.USER_GET_ALL_SUCCESS,
  })
  findAll(@Query() filters: PaginationArgs) {
    return this.userService.findAll(filters);
  }

  // obtiene solo los usuarios sin borrado logico y que esten activos
  @Get('get-all-active')
  @ApiCustomOperation({
    summary: SWAGGER_TRANSLATIONS.USER_GET_ALL,
    responseStatus: 201,
    responseDescription: SWAGGER_TRANSLATIONS.USER_GET_ALL_SUCCESS,
  })
  findAllActive(@Query() filters: PaginationArgs) {
    return this.userService.findAllActive(filters);
  }

  // Obtiene todos los usuarios con rol USER
  @Get('get-all-users')
  @ApiCustomOperation({
    summary: SWAGGER_TRANSLATIONS.USER_GET_ALL,
    responseStatus: 201,
    responseDescription: SWAGGER_TRANSLATIONS.USER_GET_ALL_SUCCESS,
  })
  findAllUsers(@Query() filters: PaginationArgs) {
    return this.userService.findAllUsers(filters);
  }

  // Obtiene un usuario por id
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.USER_GET_ONE })
  @ApiParam({ name: 'id', example: '123', description: 'ID del usuario' })
  @ApiResponse({
    status: 201,
    description: SWAGGER_TRANSLATIONS.USER_GET_ONE_SUCCESS,
  })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // Actualiza un usuario por id
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', example: '123', description: 'ID del usuario' })
  @ApiBody({ type: UpdateUserDto }) // Define el request body
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.USER_UPDATE })
  @ApiResponse({
    status: 201,
    description: SWAGGER_TRANSLATIONS.USER_UPDATE_SUCCESS,
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  //Borrado logico de un usuario por id
  @Patch('delete/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.USER_DELETE })
  @ApiParam({ name: 'id', example: '123', description: 'ID del usuario' })
  @ApiResponse({
    status: 201,
    description: SWAGGER_TRANSLATIONS.USER_DELETE_SUCCESS,
  })
  logicDelete(@Param('id') id: string) {
    return this.userService.logicDelete(id);
  }

  //Borra definitivamente un usuario de la base de datos.
  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.USER_DELETE })
  @ApiParam({ name: 'id', example: '123', description: 'ID del usuario' })
  @ApiResponse({
    status: 201,
    description: SWAGGER_TRANSLATIONS.USER_DELETE_SUCCESS,
  })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
