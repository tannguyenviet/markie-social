import {
  Controller,
  Patch,
  Post,
  UseGuards,
  Param,
  ParseIntPipe,
  Body,
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
    console.log({ createPostDto });
    return this.postService.createPost(createPostDto, user.id);
  }
  @Patch('/:id')
  updatePost(
    @Param('id', new ParseIntPipe()) postId: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.updatePost(updatePostDto, postId);
  }
}
