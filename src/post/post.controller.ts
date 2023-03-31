import {
  Controller,
  Patch,
  Post,
  UseGuards,
  Param,
  ParseIntPipe,
  Body,
  Res,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { CreatePostDto, UpdatePostDto } from './dto/PostDto';
import { PostService } from './post.service';

@UseGuards(JwtGuard)
@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}
  @Post()
  createPost(
    @Body() createPostDto: CreatePostDto,
    @GetUser() user: { id: number },
  ) {
    return this.postService.createPost(createPostDto, user.id);
  }

  @Patch('/:id')
  async updatePost(
    @Param('id', new ParseIntPipe()) postId: number,
    @Body() updatePostDto: UpdatePostDto,
    @Res() res,
  ) {
    const data = await this.postService.updatePost(updatePostDto, postId);
    return res.status(200).json(data);
  }
}
