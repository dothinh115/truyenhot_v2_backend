import { Model, Schema } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export default function userPlugin<T>(schema: Schema) {
  //gắn default role nếu có
  schema.pre('save', async function (next) {
    const modelName: any = (this.constructor as Model<T>).modelName;
    if (modelName !== 'User') return next();
    if (!this.role) {
      const settingModel = this.model('Setting') as Model<T>;
      const setting: any = await settingModel.findOne();
      if (setting && setting.defaultRole) {
        this.role = setting.defaultRole.toString();
      }
    }
    next();
  });

  //hash password khi lưu
  schema.pre('save', async function (next) {
    const modelName: any = (this.constructor as Model<T>).modelName;
    if (modelName !== 'User') return next();
    if (this.password) {
      this.password = bcrypt.hashSync(
        this.password as string,
        Number(process.env.BCRYPT_LOOPS),
      );
    }
    next();
  });

  //check root user và hash password khi update
  schema.pre('findOneAndUpdate', async function (next) {
    const modelName = this.model.modelName;
    if (modelName !== 'User') return next();
    const payload: any = this.getUpdate();
    if (payload.password !== undefined)
      payload.password = bcrypt.hashSync(
        payload.password as string,
        Number(process.env.BCRYPT_LOOPS),
      );
    next();
  });
}
