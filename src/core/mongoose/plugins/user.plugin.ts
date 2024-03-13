import { Model, Schema } from 'mongoose';
import { BcryptService } from '@/core/main/services/bcrypt.service';
import { ConfigService } from '@nestjs/config';
import { Setting } from '@/core/setting/schema/setting.schema';

export default function userPlugin(schema: Schema) {
  const configService = new ConfigService();
  const bcryptService = new BcryptService(configService);
  //gắn default role nếu có
  schema.pre('save', async function (next) {
    if (!this.role) {
      const settingModel = this.model('Setting') as Model<Setting>;
      const setting = await settingModel.findOne();
      if (setting && setting.defaultRole) {
        this.role = setting.defaultRole.toString();
      }
    }
    next();
  });

  //hash password khi lưu
  schema.pre('save', async function (next) {
    if (this.password) {
      this.password = await bcryptService.hashPassword(this.password as string);
    }
    next();
  });

  //check root user và hash password khi update
  schema.pre('findOneAndUpdate', async function (next) {
    const payload: any = this.getUpdate();
    if (payload.password !== undefined)
      payload.password = await bcryptService.hashPassword(
        payload.password as string,
      );
    next();
  });
}
