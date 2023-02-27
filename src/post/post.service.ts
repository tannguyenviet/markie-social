import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto/PostDto';

@Injectable()
export class PostService {
  constructor(private prismaService: PrismaService) {}
  async createPost(createPostDto: CreatePostDto, userId: number) {
    return await this.prismaService.post.create({
      data: {
        ...createPostDto,
        authorId: userId,
      },
    });
  }

  async updatePost(updatePostDto: UpdatePostDto, postId: number) {
    return await this.prismaService.post.update({
      where: { id: postId },
      data: {
        ...updatePostDto,
      },
    });
  }
  async delete(postId: number) {
    return await this.prismaService.post.delete({ where: { id: postId } });
  }
}
