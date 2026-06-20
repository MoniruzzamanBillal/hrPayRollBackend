import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  //  ! for creating new user
  @Post('')
  async createNewUser(@Body() payload: CreateUserDto) {
    const result = await this.userService.createUser(payload);

    return {
      result,
      message: 'User Registered successfully!!!',
    };
  }

  // ! for getting all users
  @Get('')
  async getAllUser() {
    const result = await this.userService.getAllUser();

    // return result;

    return {
      result,
      message: 'All Users retrived successfully!!!',
    };

    // return {
    //   success: true,
    //   status: HttpStatus.OK,
    //   message: 'all users retrived successfully!!!',
    //   data: result,
    // };
  }

  // ! for getting single user data
  @Get(':id')
  async getSingleUser(@Param('id') id: string) {
    const result = await this.userService.getSingleData(id);

    return result;
  }

  //
}
