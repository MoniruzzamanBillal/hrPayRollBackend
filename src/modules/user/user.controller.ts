import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/generated/prisma/enums';
import { CreateUserDto } from './dto/create.user.dto';
import { GetUserQueryDto } from './dto/get.user.query.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  //  ! for creating new user
  @Post('')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async createNewUser(
    @Body() payload: CreateUserDto,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    const imageUrl =
      profileImage &&
      `${process.env.APP_URL}/uploads/${profileImage?.filename}`;

    await this.userService.createUser(payload, imageUrl);

    return {
      message: 'User Registered successfully!!!',
    };
  }

  // ! for getting all users
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('')
  async getAllUser(@Query() query: GetUserQueryDto) {
    const result = await this.userService.getAllUser(query);

    return {
      result,
      message: 'All Users retrived successfully!!!',
    };
  }

  // ! for getting single user data
  @Get(':id')
  async getSingleUser(@Param('id') id: string) {
    const result = await this.userService.getSingleData(id);

    return result;
  }

  //
}
