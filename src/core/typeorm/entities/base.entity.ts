import {
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';
import { autoTrim } from '../middlewares/auto-trim.middleware';
import { autoHashPassword } from '../middlewares/auto-hash-password.middleware';
import { autoSlug } from '../middlewares/auto-slug.middleware';

@Index(['createdAt', 'updatedAt'])
export class BaseEntity {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  handleAutoSlug() {
    autoSlug(this);
  }

  @BeforeInsert()
  @BeforeUpdate()
  handleHashPassword() {
    autoHashPassword(this);
  }

  @BeforeInsert()
  @BeforeUpdate()
  autoTrimProperties() {
    autoTrim(this);
  }
}
