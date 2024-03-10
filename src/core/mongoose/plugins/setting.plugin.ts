import { Schema } from 'mongoose';
import { Role } from 'src/core/role/schema/role.schema';
import { User } from 'src/core/user/schema/user.schema';

export default function settingPlugin<T>(schema: Schema<T>) {
  schema.pre('findOneAndUpdate', async function (next) {
    const { defaultRole }: any = this.getUpdate();
    if (defaultRole) {
      const setting = await this.model.findOne();
      const oldDefaultRole = setting.defaultRole;

      //tìm role đang update
      const roleModel = this.model.db.model(Role.name);
      const exists = await roleModel.findById(defaultRole);
      if (exists) {
        //nếu có thì phải tìm tất cả users có role cũ và update thành mới
        const userModel = this.model.db.model(User.name);
        await userModel.updateMany(
          {
            role: oldDefaultRole,
          },
          { role: defaultRole },
        );
      } else {
        //nếu không thì phải set về cái đang có, ko cho update
        this.set({
          defaultRole: oldDefaultRole,
        });
      }
    }
    next();
  });
}
