import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateMeDto } from './dto/update-me.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { QueryService } from '../query/query.service';
import { CustomRequest, TQuery } from '../utils/model.util';
import { connection } from '../database/connection.database';

@Injectable()
export class MeService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectEntityManager() private entityManager: EntityManager,
    private queryService: QueryService,
  ) {}

  async find(query: TQuery, req: CustomRequest) {
    try {
      const reqUser = req.raw.user;
      if (!reqUser) throw new UnauthorizedException();
      return await this.queryService.query({
        repository: this.userRepo,
        query,
        id: reqUser.id,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(body: UpdateMeDto, req: CustomRequest, query: TQuery) {
    const connection = this.entityManager.connection;
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const userRepo = queryRunner.connection.getRepository(User);
    try {
      const reqUser = req.raw.user;
      if (!reqUser) throw new UnauthorizedException();
      const user = await this.userRepo.findOne({
        where: {
          id: reqUser.id,
        },
      });
      if (!user) {
        throw new Error('User này không tồn tại!');
      }
      if (user.isEditedUsername && !user.rootUser) {
        throw new Error('Chỉ được chỉnh sửa username 1 lần');
      }

      const updated = await this.queryService.update({
        repository: userRepo,
        body,
        id: reqUser.id,
        query,
      });
      user.isEditedUsername = true;
      await userRepo.save(user);
      await queryRunner.commitTransaction();
      return updated;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
