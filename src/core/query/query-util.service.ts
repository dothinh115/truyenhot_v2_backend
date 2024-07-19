import { Injectable } from '@nestjs/common';
import { OrmService } from './orm.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../setting/entities/setting.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class QueryUtilService {
  constructor(
    private ormService: OrmService,
    @InjectRepository(Setting) private settingRepo: Repository<Setting>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}
  addProperty({
    fieldData,
    condition,
    ifTrue,
    ifFalse,
  }: {
    fieldData: Set<string>;
    condition: [string, string];
    ifTrue?: string;
    ifFalse?: string | undefined;
  }) {
    const checkIfRelation = this.ormService.checkIfRelation(condition);
    if (checkIfRelation && ifTrue) fieldData.add(ifTrue);
    else if (ifFalse) fieldData.add(ifFalse);
  }

  joinRelation({
    joinData,
    condition,
    ifTrue,
    ifFalse,
  }: {
    joinData: Set<string>;
    condition: [string, string];
    ifFalse?: { field: string; alias: string };
    ifTrue: { field: string; alias: string };
  }) {
    const checkIfRelation = this.ormService.checkIfRelation(condition);
    if (checkIfRelation) joinData.add(JSON.stringify(ifTrue));
    else if (ifFalse) joinData.add(JSON.stringify(ifFalse));
  }

  handleMapResult(object: any) {
    if (typeof object !== 'object') return;
    for (const [key, value] of Object.entries(object)) {
      if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === 'object') {
          // Kiểm tra nếu mảng chứa các đối tượng
          const firstObject = value[0];
          if (Object.keys(firstObject).length === 1 && firstObject.id) {
            // Nếu mỗi đối tượng chỉ có thuộc tính id, chuyển mảng các đối tượng thành mảng các id
            object[key] = value.map((x) => x.id);
          } else {
            // Đệ quy cho từng đối tượng trong mảng
            for (const item of value) {
              if (typeof item === 'object' && item !== null) {
                this.handleMapResult(item);
              }
            }
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        if (Object.keys(value).length === 1 && value['id']) {
          // Nếu đối tượng chỉ có thuộc tính id, chuyển đối tượng thành id
          object[key] = value['id'];
        } else {
          // Đệ quy cho đối tượng
          this.handleMapResult(value);
        }
      }
    }
  }

  convertToEntity<T>(entityName: string, body: T) {
    for (const [key, value] of Object.entries(body)) {
      const relationType = this.ormService.checkIfRelation([entityName, key]);
      if (relationType) {
        let propertyData: { id: string | number } | { id: string | number }[];

        if (relationType === 'many-to-many' && Array.isArray(value)) {
          propertyData = value.map((item) => ({ id: item }));
        } else {
          propertyData = {
            id: value,
          };
        }
        body[key] = propertyData;
      }
    }
    return body;
  }

  async setDefaultRole<T>(body: T) {
    const setting = await this.settingRepo.find({
      take: 1,
    });
    if (setting[0].defaultRole) {
      body['role'] = setting[0].defaultRole.id;
    }
    return body;
  }

  async resetDefaultRole<T>(body: T) {
    const setting = await this.settingRepo.find({
      take: 1,
    });
    if (body['defaultRole'] && setting[0].defaultRole) {
      const usersWithDefaultRole = await this.userRepo.find({
        where: {
          role: setting[0].defaultRole,
        },
      });
      if (usersWithDefaultRole.length > 0) {
        const promises = usersWithDefaultRole.map(async (user) => {
          this.userRepo.merge(user, {
            role: {
              id: body['defaultRole'],
            },
          });
          return this.userRepo.save(user);
        });
        await Promise.all(promises);
      }
    }
  }
}
