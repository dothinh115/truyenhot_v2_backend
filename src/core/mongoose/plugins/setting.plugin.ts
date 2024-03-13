import { Schema } from 'mongoose';
import { User } from '@/core/user/schema/user.schema';

export default function settingPlugin(schema: Schema) {
  schema.pre('findOneAndUpdate', async function (next) {
    const { defaultRole }: any = this.getUpdate();
    if (defaultRole) {
      const setting = await this.model.findOne();
      const oldDefaultRole = setting.defaultRole;

      const userModel = this.model.db.model(User.name);
      await userModel.updateMany(
        {
          role: oldDefaultRole,
        },
        { role: defaultRole },
      );
    }
    next();
  });
}
