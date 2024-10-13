import {
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';
import { autoSlug } from '../listeners/auto-slug.listener';
import { autoHashPassword } from '../listeners/auto-hash-password.listener';
import { autoTrim } from '../listeners/auto-trim.listener';

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
